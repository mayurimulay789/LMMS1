const express = require("express")
const router = express.Router()
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")
const Progress = require("../models/Progress")
const auth = require("../middleware/auth")
const adminMiddleware = require("../middleware/AdminMiddleware")
const instructorMiddleware = require("../middleware/instructorMiddleware")
const { getVideoDuration, convertSecondsToMinutes } = require("../utils/videoUtils")

// GET /courses - Get all courses with optional filters
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      priceRange,
      level,
      rating,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 12
    } = req.query

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

    // Price range filtering
    if (priceRange && priceRange !== "all") {
      switch (priceRange) {
        case "free":
          query.price = 0
          break
        case "0-50":
          query.price = { $gte: 0, $lte: 50 }
          break
        case "50-100":
          query.price = { $gte: 50, $lte: 100 }
          break
        case "100+":
          query.price = { $gte: 100 }
          break
      }
    }

    // Level filtering
    if (level && level !== "all") {
      query.level = level
    }

    // Rating filtering
    if (rating && rating !== "all") {
      const minRating = parseFloat(rating)
      // Since we calculate avgRating in the response, we need to filter by the stored rating field
      query.rating = { $gte: minRating }
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
      .populate("createdBy", "name email profile.avatar")

    // Get enrollment count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ 
          course: course._id, 
          status: { $ne: "suspended" }
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
router.get("/:id",auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("createdBy", "name email avatar profile")
      .populate("reviews.user", "name avatar")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Auto-calculate durations for lessons with video URLs but 0 duration
    let needsDurationUpdate = false

    for (let i = 0; i < course.lessons.length; i++) {
      const lesson = course.lessons[i]
      if (lesson.videoUrl && (lesson.duration === 0 || lesson.duration === undefined || lesson.duration === null)) {
        try {
          console.log(`Auto-calculating duration for lesson: ${lesson.title}`)
          console.log(`Video URL: ${lesson.videoUrl}`)

          const durationInSeconds = await getVideoDuration(lesson.videoUrl)
          const durationInMinutes = convertSecondsToMinutes(durationInSeconds)

          console.log(`Duration calculated: ${durationInSeconds} seconds = ${durationInMinutes} minutes`)

          if (durationInMinutes > 0) {
            lesson.duration = durationInMinutes
            needsDurationUpdate = true
            console.log(`Updated lesson "${lesson.title}" duration: ${durationInMinutes} minutes`)
          } else {
            console.log(`Duration is 0 for lesson "${lesson.title}", keeping as 0`)
          }
        } catch (error) {
          console.error(`Error calculating duration for lesson "${lesson.title}":`, error.message)
          console.error(`Video URL: ${lesson.videoUrl}`)
        }
      }
    }

    // Update course total duration if any lessons were updated
    if (needsDurationUpdate) {
      course.duration = course.lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)
      await course.save()
      console.log(`Updated total course duration: ${course.duration} minutes`)
    }

    // Get enrollment count and average rating
    const enrollmentCount = await Enrollment.countDocuments({ 
      course: course._id, 
      status: { $ne: "suspended" }
    })
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
      })
      console.log(`Enrollment found for user ${req.user.id} and course ${course._id}:`, enrollment)  // Debug log
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
      instructorImage: course.instructorImage,
      instructorImagePublicId: course.instructorImagePublicId,
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
      status: { $in: ["active", "completed", "in-progress"] }
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



// GET /courses/meta/categories - Get all categories
router.get("/meta/categories", async (req, res) => {
  try {
    // Return all supported categories from the model instead of just existing ones
    const supportedCategories = ["Programming", "Design", "Marketing", "Business", "Creative", "Technology", "Health", "Language"]
    res.json(supportedCategories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({ message: "Failed to fetch categories" })
  }
})

// GET /courses/meta/featured - Get featured courses (1 per category)
router.get("/meta/featured", async (req, res) => {
  try {
    // Use aggregation to get one course per category, prioritizing by enrollment count and rating
    const featuredCourses = await Course.aggregate([
      {
        $match: {
          status: "published",
          featured: true,
        }
      },
      {
        $addFields: {
          enrollmentCount: { $ifNull: ["$enrollmentCount", 0] },
          avgRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: {
                $round: [
                  {
                    $divide: [
                      { $sum: "$reviews.rating" },
                      { $size: "$reviews" }
                    ]
                  },
                  1
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $sort: {
          enrollmentCount: -1,
          avgRating: -1,
          createdAt: -1
        }
      },
      {
        $group: {
          _id: "$category",
          course: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$course" }
      },
      {
        $limit: 8 // Limit to 8 courses (one per category, up to 8 categories)
      }
    ])

    // Populate the createdBy field for each course
    const populatedCourses = await Course.populate(featuredCourses, {
      path: "createdBy",
      select: "name email"
    })

    res.json(populatedCourses)
  } catch (error) {
    console.error("Error fetching featured courses:", error)
    res.status(500).json({ message: "Failed to fetch featured courses" })
  }
})

// GET /courses/meta/featured-five - Get exactly 5 featured courses from different categories
router.get("/meta/featured-five", async (req, res) => {
  try {
    // Use aggregation to get one course per category, prioritizing by enrollment count and rating
    const featuredCourses = await Course.aggregate([
      {
        $match: {
          status: "published",
          isPublished: true,
        }
      },
      {
        $addFields: {
          enrollmentCount: { $ifNull: ["$enrollmentCount", 0] },
          avgRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviews" }, 0] },
              then: {
                $round: [
                  {
                    $divide: [
                      { $sum: "$reviews.rating" },
                      { $size: "$reviews" }
                    ]
                  },
                  1
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $sort: {
          enrollmentCount: -1,
          avgRating: -1,
          createdAt: -1
        }
      },
      {
        $group: {
          _id: "$category",
          course: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$course" }
      },
      {
        $limit: 5 // Limit to exactly 5 courses from different categories
      }
    ])

    // Populate the createdBy field for each course
    const populatedCourses = await Course.populate(featuredCourses, {
      path: "createdBy",
      select: "name email"
    })

    res.json(populatedCourses)
  } catch (error) {
    console.error("Error fetching featured five courses:", error)
    res.status(500).json({ message: "Failed to fetch featured courses" })
  }
})

// POST /courses/:id/update-durations - Update lesson durations for existing course
router.post("/:id/update-durations", auth, instructorMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if user is the course creator or admin
    if (course.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this course" })
    }

    let updatedLessons = 0
    let totalDuration = 0

    // Update duration for each lesson that has a video URL
    for (const lesson of course.lessons) {
      if (lesson.videoUrl && lesson.duration === 0) {
        try {
          const durationInSeconds = await getVideoDuration(lesson.videoUrl)
          const durationInMinutes = convertSecondsToMinutes(durationInSeconds)

          if (durationInMinutes > 0) {
            lesson.duration = durationInMinutes
            updatedLessons++
            totalDuration += durationInMinutes
          }
        } catch (error) {
          console.error(`Error updating duration for lesson ${lesson._id}:`, error)
        }
      } else {
        totalDuration += lesson.duration || 0
      }
    }

    // Save the updated course
    course.duration = totalDuration
    await course.save()

    res.json({
      message: "Lesson durations updated successfully",
      updatedLessons,
      totalDuration,
      courseId: course._id
    })
  } catch (error) {
    console.error("Error updating lesson durations:", error)
    res.status(500).json({ message: "Failed to update lesson durations" })
  }
})

// GET /courses/:id/fix-durations - Fix durations for all courses (admin only)
router.get("/fix-durations", auth, adminMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ "lessons.videoUrl": { $exists: true } })

    const results = []
    for (const course of courses) {
      let updatedLessons = 0
      let totalDuration = 0

      for (const lesson of course.lessons) {
        if (lesson.videoUrl && lesson.duration === 0) {
          try {
            const durationInSeconds = await getVideoDuration(lesson.videoUrl)
            const durationInMinutes = convertSecondsToMinutes(durationInSeconds)

            if (durationInMinutes > 0) {
              lesson.duration = durationInMinutes
              updatedLessons++
              totalDuration += durationInMinutes
            }
          } catch (error) {
            console.error(`Error updating duration for lesson ${lesson._id}:`, error)
          }
        } else {
          totalDuration += lesson.duration || 0
        }
      }

      if (updatedLessons > 0) {
        course.duration = totalDuration
        await course.save()
        results.push({
          courseId: course._id,
          courseTitle: course.title,
          updatedLessons,
          totalDuration
        })
      }
    }

    res.json({
      message: "Duration update completed",
      processedCourses: results.length,
      results
    })
  } catch (error) {
    console.error("Error fixing durations:", error)
    res.status(500).json({ message: "Failed to fix durations" })
  }
})

module.exports = router