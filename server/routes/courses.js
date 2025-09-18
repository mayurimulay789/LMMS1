const express = require("express")
const router = express.Router()
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")
const Progress = require("../models/Progress")
const auth = require("../middleware/auth")

// GET /courses - Get all courses with optional filters
router.get("/", async (req, res) => {
  try {
    const { category, search, sort = "createdAt", order = "desc", page = 1, limit = 12 } = req.query

    const query = { status: "published" }

    // Build query based on filters
    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { instructor: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort options
    const sortOptions = {}
    switch (sort) {
      case "price-low":
        sortOptions.price = 1
        break
      case "price-high":
        sortOptions.price = -1
        break
      case "rating":
        sortOptions.rating = -1
        break
      case "popular":
        sortOptions.enrollmentCount = -1
        break
      default:
        sortOptions.createdAt = order === "desc" ? -1 : 1
    }

    const courses = await Course.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("createdBy", "name email")

    // Get enrollment count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ course: course._id, status: "active" })
        const avgRating =
          course.reviews.length > 0
            ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length
            : 0

        return {
          ...course.toObject(),
          enrollmentCount,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: course.reviews.length,
        }
      }),
    )

    const total = await Course.countDocuments(query)

    res.json({
      courses: coursesWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: Number.parseInt(page),
      total,
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ message: "Failed to fetch courses" })
  }
})

// GET /courses/top - Get popular courses
router.get("/top", async (req, res) => {
  try {
    const popularCourses = await Course.find({ status: "published", isPopular: true })
      .sort({ enrollmentCount: -1, rating: -1 })
      .limit(6)
    res.json(popularCourses)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /courses/:id - Get single course
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("reviews.user", "name avatar")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Get enrollment count and average rating
    const enrollmentCount = await Enrollment.countDocuments({ course: course._id, status: "active" })
    const avgRating =
      course.reviews.length > 0
        ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length
        : 0

    // Check if user is enrolled (if authenticated)
    let isEnrolled = false
    let userProgress = null

    if (req.user) {
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: course._id,
        status: "active",
      })
      isEnrolled = !!enrollment

      if (isEnrolled) {
        userProgress = await Progress.findOne({
          user: req.user.id,
          course: course._id,
        })
      }
    }

    res.json({
      ...course.toObject(),
      enrollmentCount,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: course.reviews.length,
      isEnrolled,
      userProgress: userProgress
        ? {
            completionPercentage: userProgress.completionPercentage,
            completedLessons: userProgress.completedLessons,
            currentLesson: userProgress.currentLesson,
          }
        : null,
    })
  } catch (error) {
    console.error("Error fetching course:", error)
    res.status(500).json({ message: "Failed to fetch course" })
  }
})

// GET /courses/:id/lessons - Get course lessons (protected route for enrolled users)
router.get("/:id/lessons", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id,
      status: "active",
    })

    if (!enrollment) {
      return res.status(403).json({ message: "You must be enrolled to access course content" })
    }

    // Get user progress
    const progress = await Progress.findOne({
      user: req.user.id,
      course: req.params.id,
    })

    res.json({
      lessons: course.lessons,
      progress: progress
        ? {
            completionPercentage: progress.completionPercentage,
            completedLessons: progress.completedLessons,
            currentLesson: progress.currentLesson,
          }
        : {
            completionPercentage: 0,
            completedLessons: [],
            currentLesson: course.lessons[0]?._id,
          },
    })
  } catch (error) {
    console.error("Error fetching course lessons:", error)
    res.status(500).json({ message: "Failed to fetch course lessons" })
  }
})

// POST /courses/:id/reviews - Add course review
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id,
      status: "active",
    })

    if (!enrollment) {
      return res.status(403).json({ message: "You must be enrolled to review this course" })
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find((review) => review.user.toString() === req.user.id)

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this course" })
    }

    // Add review
    course.reviews.push({
      user: req.user.id,
      rating,
      comment,
      createdAt: new Date(),
    })

    await course.save()

    // Populate the new review
    await course.populate("reviews.user", "name avatar")

    res.status(201).json({
      message: "Review added successfully",
      review: course.reviews[course.reviews.length - 1],
    })
  } catch (error) {
    console.error("Error adding review:", error)
    res.status(500).json({ message: "Failed to add review" })
  }
})

// GET /courses/meta/categories - Get all categories
router.get("/meta/categories", async (req, res) => {
  try {
    const categories = await Course.distinct("category", { status: "published" })
    res.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({ message: "Failed to fetch categories" })
  }
})

// GET /courses/meta/featured - Get featured courses
router.get("/meta/featured", async (req, res) => {
  try {
    const featuredCourses = await Course.find({
      status: "published",
      featured: true,
    })
      .limit(6)
      .populate("createdBy", "name email")

    // Get enrollment count for each course
    const coursesWithStats = await Promise.all(
      featuredCourses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({
          course: course._id,
          status: "active",
        })
        const avgRating =
          course.reviews.length > 0
            ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length
            : 0

        return {
          ...course.toObject(),
          enrollmentCount,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: course.reviews.length,
        }
      }),
    )

    res.json(coursesWithStats)
  } catch (error) {
    console.error("Error fetching featured courses:", error)
    res.status(500).json({ message: "Failed to fetch featured courses" })
  }
})

module.exports = router
