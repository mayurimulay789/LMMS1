const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Course = require("../models/Course")
const Payment = require("../models/Payment")
const Enrollment = require("../models/Enrollment")
const auth = require("../middleware/auth")
const instructorMiddleware = require("../middleware/instructorMiddleware")
const mongoose = require("mongoose");

// Apply auth and instructor middleware to all routes
router.use(auth)
router.use(instructorMiddleware)

// Get instructor dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const instructorId = req.user.id

    // Get instructor's courses
    const courses = await Course.find({ instructorId: instructorId })
    const courseIds = courses.map(course => course._id)

    // Calculate stats
    const totalCourses = courses.length
    const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } })
    const totalRevenue = await Payment.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
    const activeEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds }, status: "active" })

    res.json({
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeEnrollments,
    })
  } catch (error) {
    console.error("Error fetching instructor stats:", error)
    res.status(500).json({ message: "Failed to fetch stats" })
  }
})

// Get instructor's courses
router.get("/courses", async (req, res) => {
  try {
    const instructorId = req.user.id
    const courses = await Course.find({ instructorId: instructorId }).sort({ createdAt: -1 })

    // Get enrollment count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ course: course._id })
        return {
          ...course.toObject(),
          enrollments: enrollmentCount,
        }
      }),
    )

    res.json(coursesWithStats)
  } catch (error) {
    console.error("Error fetching courses:", error)
    res.status(500).json({ message: "Failed to fetch courses" })
  }
})

// Create new course
router.post("/courses", async (req, res) => {
  try {
    const { calculateLessonsDurations } = require("../utils/videoUtils")

    const course = new Course({
      ...req.body,
      instructor: req.user.name, // Set instructor name
      instructorId: req.user.id, // Set instructor ObjectId reference
      createdBy: req.user.id, // Set who created the course
    })

    // Calculate durations for lessons with video URLs
    if (course.lessons && course.lessons.length > 0) {
      try {
        const result = await calculateLessonsDurations(course.lessons)
        course.lessons = result.lessons
        course.duration = result.totalDuration
        console.log(`Calculated durations for ${course.lessons.length} lessons. Total course duration: ${course.duration} minutes`)
      } catch (durationError) {
        console.error("Error calculating lesson durations:", durationError)
        // Continue with course creation even if duration calculation fails
      }
    }

    await course.save()
    res.status(201).json(course)
  } catch (error) {
    console.error("Error creating course:", error)
    res.status(500).json({ message: "Failed to create course" })
  }
})

// Update course
router.put("/courses/:courseId", async (req, res) => {
  try {
    const { calculateLessonsDurations } = require("../utils/videoUtils")
    const instructorId = req.user.id

    const course = await Course.findOne({ _id: req.params.courseId, instructorId: instructorId })

    if (!course) {
      return res.status(404).json({ message: "Course not found or not authorized" })
    }

    // Update course fields
    Object.assign(course, req.body)

    // Calculate durations for lessons with video URLs
    if (course.lessons && course.lessons.length > 0) {
      try {
        const result = await calculateLessonsDurations(course.lessons)
        course.lessons = result.lessons
        course.duration = result.totalDuration
        console.log(`Updated durations for ${course.lessons.length} lessons. Total course duration: ${course.duration} minutes`)
      } catch (durationError) {
        console.error("Error calculating lesson durations:", durationError)
        // Continue with course update even if duration calculation fails
      }
    }

    await course.save()
    res.json(course)
  } catch (error) {
    console.error("Error updating course:", error)
    res.status(500).json({ message: "Failed to update course" })
  }
})

// Delete course
router.delete("/courses/:courseId", async (req, res) => {
  try {
    const instructorId = req.user.id
    const course = await Course.findOneAndDelete({ _id: req.params.courseId, instructorId: instructorId })

    if (!course) {
      return res.status(404).json({ message: "Course not found or not authorized" })
    }

    // Also delete related enrollments
    await Enrollment.deleteMany({ course: req.params.courseId })

    res.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    res.status(500).json({ message: "Failed to delete course" })
  }
})

// Get students enrolled in instructor's courses
router.get("/students", async (req, res) => {
  try {
    const instructorId = req.user.id
    const courses = await Course.find({ instructorId: instructorId })
    const courseIds = courses.map(course => course._id)

    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate("user", "name email")
      .populate("course", "title")
      .sort({ createdAt: -1 })

    res.json(enrollments)
  } catch (error) {
    console.error("Error fetching students:", error)
    res.status(500).json({ message: "Failed to fetch students" })
  }
})

// Get reports for instructor's courses
router.get("/reports/:type", async (req, res) => {
  try {
    const { type } = req.params
    const instructorId = req.user.id
    const courses = await Course.find({ instructorId: instructorId })
    const courseIds = courses.map(course => course._id)

    let data = []

    switch (type) {
      case "revenue":
        // Get monthly revenue data for instructor's courses
        data = await Payment.aggregate([
          { $match: { course: { $in: courseIds } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              revenue: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 },
          },
        ])
        break

      case "enrollments":
        // Get enrollment data for each course
        data = await Course.aggregate([
          { $match: { _id: { $in: courseIds } } },
          {
            $lookup: {
              from: "enrollments",
              localField: "_id",
              foreignField: "course",
              as: "enrollments",
            },
          },
          {
            $group: {
              _id: "$title",
              value: { $sum: { $size: "$enrollments" } },
            },
          },
        ])
        break

      default:
        return res.status(400).json({ message: "Invalid report type" })
    }

    res.json(data)
  } catch (error) {
    console.error("Error fetching report data:", error)
    res.status(500).json({ message: "Failed to fetch report data" })
  }
})

module.exports = router
