const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Course = require("../models/Course")
const Payment = require("../models/Payment")
const Enrollment = require("../models/Enrollment")
const auth = require("../middleware/auth")
const adminMiddleware = require("../middleware/AdminMiddleware")
const mongoose = require("mongoose");

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
// ✅ Bulk user actions — move this ABOVE individual user routes
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
    const course = new Course({
      ...req.body,
      createdBy: req.user.id,
    })

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
    const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true })

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

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
        data = await Course.aggregate([
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

module.exports = router
