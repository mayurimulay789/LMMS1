const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Course = require("../models/Course")
const Payment = require("../models/Payment")
const Enrollment = require("../models/Enrollment")
const InstructorApplication = require("../models/InstructorApplication")
const auth = require("../middleware/auth")
const adminMiddleware = require("../middleware/AdminMiddleware")
const mongoose = require("mongoose");
const { sendInstructorApprovalEmail, sendInstructorRejectionEmail } = require("../services/emailService")

// Apply auth and admin middleware to all routes
router.use(auth)
router.use(adminMiddleware)

// Get admin dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalCourses = await Course.countDocuments()
    const totalPayments = await Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
    const activeEnrollments = await Enrollment.countDocuments({ status: "active" })

    res.json({
      totalUsers,
      totalCourses,
      totalRevenue: totalPayments[0]?.total || 0,
      activeEnrollments,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ message: "Failed to fetch stats" })
  }
})

// Get all users with pagination and filtering
router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query
    const query = {}

    if (role && role !== "all") {
      query.role = role
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    // Get enrollment count for each user
    const usersWithEnrollments = await Promise.all(
      users.map(async (user) => {
        const enrollmentCount = await Enrollment.countDocuments({ user: user._id })
        return {
          ...user.toObject(),
          enrollments: enrollmentCount,
        }
      }),
    )

    const total = await User.countDocuments(query)

    res.json({
      users: usersWithEnrollments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Failed to fetch users" })
  }
})

// Bulk user actions
router.post("/users/bulk/:action", async (req, res) => {
  try {
    const { action } = req.params;
    const { userIds } = req.body;

    // Validate input
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds must be a non-empty array" });
    }

    // Convert to ObjectIds safely
    const objectIds = userIds.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid user ID: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    // Perform bulk actions
    switch (action) {
      case "activate":
        await User.updateMany({ _id: { $in: objectIds } }, { isActive: true });
        break;
      case "deactivate":
        await User.updateMany({ _id: { $in: objectIds } }, { isActive: false });
        break;
      case "delete":
        await User.deleteMany({ _id: { $in: objectIds } });
        break;
      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    res.json({ message: `Bulk ${action} completed successfully` });
  } catch (error) {
    console.error("Error performing bulk action:", error.message);
    res.status(500).json({ message: `Failed to ${req.params.action} users`, error: error.message });
  }
});

// User management actions
router.post("/users/:userId/activate", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { isActive: true })
    res.json({ message: "User activated successfully" })
  } catch (error) {
    console.error("Error activating user:", error)
    res.status(500).json({ message: "Failed to activate user" })
  }
})

router.post("/users/:userId/deactivate", async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { isActive: false })
    res.json({ message: "User deactivated successfully" })
  } catch (error) {
    console.error("Error deactivating user:", error)
    res.status(500).json({ message: "Failed to deactivate user" })
  }
})

router.post("/users/:userId/delete", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Failed to delete user" })
  }
})

// Get all courses for admin
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email").sort({ createdAt: -1 })

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
      instructor: req.user.name,
      instructorId: req.user._id,
      createdBy: req.user.id,
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

// Create new course with automatic duration calculation
router.post("/courses-with-durations", async (req, res) => {
  try {
    const { calculateLessonsDurations } = require("../utils/videoUtils")

    const course = new Course({
      ...req.body,
      instructor: req.user.name,
      instructorId: req.user._id,
      createdBy: req.user.id,
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

    const course = await Course.findById(req.params.courseId)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if course was created by an instructor
    const creator = await User.findById(course.createdBy);
    if (creator && creator.role === 'instructor') {
      return res.status(403).json({ message: "Admins cannot update courses created by instructors" });
    }

    // Prepare update fields, excluding immutable ones
    const updateFields = { ...req.body };
    delete updateFields.instructorId;
    delete updateFields.instructor;
    delete updateFields.createdBy;

    // Apply updates
    Object.assign(course, updateFields);

    // Ensure immutable fields are set
    if (!course.instructorId) {
      course.instructorId = req.user._id;
    }
    if (!course.instructor) {
      course.instructor = req.user.name;
    }
    if (!course.createdBy) {
      course.createdBy = req.user._id;
    }

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

// Update course with automatic duration calculation
router.put("/courses/:courseId/with-durations", async (req, res) => {
  try {
    const { calculateLessonsDurations } = require("../utils/videoUtils")

    const course = await Course.findById(req.params.courseId)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if course was created by an instructor
    const creator = await User.findById(course.createdBy);
    if (creator && creator.role === 'instructor') {
      return res.status(403).json({ message: "Admins cannot update courses created by instructors" });
    }

    // Prepare update fields, excluding immutable ones
    const updateFields = { ...req.body };
    delete updateFields.instructorId;
    delete updateFields.instructor;
    delete updateFields.createdBy;

    // Apply updates
    Object.assign(course, updateFields);

    // Ensure immutable fields are set
    if (!course.instructorId) {
      course.instructorId = req.user._id;
    }
    if (!course.instructor) {
      course.instructor = req.user.name;
    }
    if (!course.createdBy) {
      course.createdBy = req.user._id;
    }

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
    const course = await Course.findByIdAndDelete(req.params.courseId)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Also delete related enrollments
    await Enrollment.deleteMany({ course: req.params.courseId })

    res.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Error deleting course:", error)
    res.status(500).json({ message: "Failed to delete course" })
  }
})

// Recalculate durations for all courses
router.post("/courses/recalculate-durations", async (req, res) => {
  try {
    const results = await Course.recalculateAllDurations()

    res.json({
      message: "Duration recalculation completed",
      ...results
    })
  } catch (error) {
    console.error("Error recalculating durations:", error)
    res.status(500).json({ message: "Failed to recalculate durations", error: error.message })
  }
})

// Recalculate duration for a specific course
router.post("/courses/:courseId/recalculate-duration", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    const updated = await course.recalculateDurations()

    if (updated) {
      res.json({
        message: "Course duration recalculated successfully",
        course: {
          id: course._id,
          title: course.title,
          duration: course.duration,
          lessons: course.lessons.map(lesson => ({
            id: lesson._id,
            title: lesson.title,
            duration: lesson.duration
          }))
        }
      })
    } else {
      res.status(400).json({ message: "No lessons found to recalculate" })
    }
  } catch (error) {
    console.error("Error recalculating course duration:", error)
    res.status(500).json({ message: "Failed to recalculate course duration", error: error.message })
  }
})

// Get reports data
router.get("/reports/:type", async (req, res) => {
  try {
    const { type } = req.params
    let data = []

    switch (type) {
      case "revenue":
        // Get monthly revenue data
        data = await Payment.aggregate([
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
        // Get course category enrollment distribution
        const enrollmentData = await Course.aggregate([
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
              _id: "$category",
              value: { $sum: { $size: "$enrollments" } },
            },
          },
        ])

        // Add color mapping for chart visualization
        const colorMap = {
          "Programming": "#8884d8",
          "Design": "#82ca9d",
          "Marketing": "#ffc658",
          "Business": "#ff7300",
          "Creative": "#00ff00",
          "Technology": "#ff0000",
          "Health": "#0000ff",
          "Language": "#ff00ff",
          "Other": "#ffa500"
        }

        data = enrollmentData.map(item => ({
          name: item._id || "Other",
          value: item.value,
          color: colorMap[item._id] || "#8884d8" // Default color if category not in map
        }))
        break

      case "detailed":
        // Get daily stats for the last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        data = await Promise.all(
          Array.from({ length: 7 }, async (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const startOfDay = new Date(date.setHours(0, 0, 0, 0))
            const endOfDay = new Date(date.setHours(23, 59, 59, 999))

            const users = await User.countDocuments({
              createdAt: { $gte: startOfDay, $lte: endOfDay },
            })

            const courses = await Course.countDocuments({
              createdAt: { $gte: startOfDay, $lte: endOfDay },
            })

            const revenue = await Payment.aggregate([
              {
                $match: {
                  createdAt: { $gte: startOfDay, $lte: endOfDay },
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$amount" },
                },
              },
            ])

            return {
              date: startOfDay.toISOString().split("T")[0],
              users,
              courses,
              revenue: revenue[0]?.total || 0,
            }
          }),
        )
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

// Get all instructor applications
router.get("/instructor-applications", async (req, res) => {
  try {
    const applications = await InstructorApplication.find().sort({ createdAt: -1 })
    res.json(applications)
  } catch (error) {
    console.error("Error fetching instructor applications:", error)
    res.status(500).json({ message: "Failed to fetch applications" })
  }
})

// Approve instructor application
router.post("/instructor-applications/:applicationId/approve", async (req, res) => {
  try {
    const application = await InstructorApplication.findById(req.params.applicationId)

    if (!application) {
      return res.status(404).json({ message: "Application not found" })
    }

    // Create or update user account
    let user = await User.findOne({ email: application.email });
    if (user) {
      // Update existing user
      user.role = 'instructor';
      user.password = application.password; // Update password to the one from application
      user.isEmailVerified = true;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name: application.applicantName,
        email: application.email,
        password: application.password,
        role: 'instructor',
        isEmailVerified: true,
      });
      await user.save();
    }

    // Delete the application
    await InstructorApplication.findByIdAndDelete(req.params.applicationId)

    // Send approval email
    try {
      await sendInstructorApprovalEmail({
        applicantName: application.applicantName,
        email: application.email,
        loginLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      })
      console.log('Approval email sent to:', application.email)
    } catch (emailError) {
      console.error('Approval email failed:', emailError)
      // Don't fail the approval if email fails
    }

    res.json({ message: "Application approved successfully" })
  } catch (error) {
    console.error("Error approving application:", error)
    res.status(500).json({ message: "Failed to approve application" })
  }
})

// Reject instructor application
router.post("/instructor-applications/:applicationId/reject", async (req, res) => {
  try {
    const application = await InstructorApplication.findById(req.params.applicationId)

    if (!application) {
      return res.status(404).json({ message: "Application not found" })
    }

    // Send rejection email
    try {
      await sendInstructorRejectionEmail({
        applicantName: application.applicantName,
        email: application.email,
      })
      console.log('Rejection email sent to:', application.email)
    } catch (emailError) {
      console.error('Rejection email failed:', emailError)
      // Don't fail the rejection if email fails
    }

    // Delete the application
    await InstructorApplication.findByIdAndDelete(req.params.applicationId)

    res.json({ message: "Application rejected successfully" })
  } catch (error) {
    console.error("Error rejecting application:", error)
    res.status(500).json({ message: "Failed to reject application" })
  }
})

module.exports = router
