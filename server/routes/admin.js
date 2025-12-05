const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Course = require("../models/Course")
const Payment = require("../models/Payment")
const Enrollment = require("../models/Enrollment")
const InstructorApplication = require("../models/InstructorApplication")
const PromoCode = require("../models/PromoCode")
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
    // Get current date
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    // Calculate last month's date range
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Get date ranges for current and previous months
    const currentMonthStart = new Date(currentYear, currentMonth, 1)
    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1)

    // Calculate statistics
    const [
      totalUsers,
      totalCourses,
      currentMonthPayments,
      lastMonthPayments,
      activeEnrollments,
      lastMonthUsers,
      lastMonthCourses,
      lastMonthEnrollments
    ] = await Promise.all([
      // Total users count
      User.countDocuments(),
      
      // Total courses count  
      Course.countDocuments(),

      // Current month revenue
      Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: currentMonthStart }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]),

      // Last month revenue
      Payment.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: lastMonthStart,
              $lt: currentMonthStart
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]),

      // Active enrollments
      Enrollment.countDocuments({ status: "active" }),

      // Last month users count
      User.countDocuments({ createdAt: { $lt: currentMonthStart } }),
      
      // Last month courses count
      Course.countDocuments({ createdAt: { $lt: currentMonthStart } }),

      // Last month enrollments count
      Enrollment.countDocuments({ 
        status: "active",
        createdAt: { $lt: currentMonthStart } 
      })
    ])

    // Calculate month-over-month changes
    const currentMonthRevenue = currentMonthPayments[0]?.total || 0
    const lastMonthRevenue = lastMonthPayments[0]?.total || 0

    const revenueChange = lastMonthRevenue === 0 ? 0 : 
      ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)

    const usersChange = lastMonthUsers === 0 ? 0 :
      ((totalUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1)
    
    const coursesChange = lastMonthCourses === 0 ? 0 :
      ((totalCourses - lastMonthCourses) / lastMonthCourses * 100).toFixed(1)
    
    const enrollmentsChange = lastMonthEnrollments === 0 ? 0 :
      ((activeEnrollments - lastMonthEnrollments) / lastMonthEnrollments * 100).toFixed(1)

    // Get all time total revenue
    const allTimeRevenue = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ])

    res.json({
      totalUsers,
      totalCourses, 
      totalRevenue: allTimeRevenue[0]?.total || 0,
      activeEnrollments,
      changes: {
        users: `${usersChange > 0 ? '+' : ''}${usersChange}%`,
        courses: `${coursesChange > 0 ? '+' : ''}${coursesChange}%`, 
        revenue: `${revenueChange > 0 ? '+' : ''}${revenueChange}%`,
        enrollments: `${enrollmentsChange > 0 ? '+' : ''}${enrollmentsChange}%`
      }
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

// Create new user
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || "student",
      isEmailVerified: true, // Admin created users are verified by default
    })

    await user.save()

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject()
    res.status(201).json({ message: "User created successfully", user: userWithoutPassword })
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ message: "Failed to create user" })
  }
})

// Update user
router.put("/users/:userId", async (req, res) => {
  try {
    const { name, email, role, isEmailVerified, profile } = req.body
    const userId = req.params.userId

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } })
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" })
      }
    }

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (typeof isEmailVerified === 'boolean') updateData.isEmailVerified = isEmailVerified
    if (profile) updateData.profile = { ...updateData.profile, ...profile }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User updated successfully", user })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ message: "Failed to update user" })
  }
})

// Get single user details
router.get("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get enrollment count for this user
    const enrollmentCount = await Enrollment.countDocuments({ user: user._id })
    
    res.json({
      ...user.toObject(),
      enrollments: enrollmentCount,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Failed to fetch user" })
  }
})

// Update user role
router.post("/users/:userId/role", async (req, res) => {
  try {
    const { role } = req.body
    const userId = req.params.userId

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User role updated successfully", user })
  } catch (error) {
    console.error("Error updating user role:", error)
    res.status(500).json({ message: "Failed to update user role" })
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

    console.log("course data for saving course",req.body);

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
      const emailResult = await sendInstructorApprovalEmail({
        applicantName: application.applicantName,
        email: application.email,
        loginLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
      })
      if (emailResult.success) {
        console.log('Approval email sent to:', application.email)
      } else {
        console.log('Approval email skipped (configuration missing):', emailResult.message)
      }
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

// ============= COUPON MANAGEMENT ROUTES =============

// Get all coupons
router.get("/coupons", async (req, res) => {
  try {
    const coupons = await PromoCode.find().sort({ createdAt: -1 })
    res.json({
      success: true,
      data: coupons
    })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons"
    })
  }
})

// Get single coupon
router.get("/coupons/:id", async (req, res) => {
  try {
    const coupon = await PromoCode.findById(req.params.id)
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      })
    }
    res.json({
      success: true,
      data: coupon
    })
  } catch (error) {
    console.error("Error fetching coupon:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon"
    })
  }
})

// Create new coupon
router.post("/coupons", async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      validFrom,
      validUntil,
      usageLimit,
      userUsageLimit,
      isActive,
      isGlobal,
      applicableCourses,
      applicableCategories,
    } = req.body

    // Validate required fields
    if (!code || !description || !discountType || !discountValue || !validFrom || !validUntil) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      })
    }

    // Validate discount value
    if (discountType === "percentage" && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%"
      })
    }

    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() })
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists"
      })
    }

    const newCoupon = new PromoCode({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minimumAmount: minimumAmount || 0,
      maximumDiscount: maximumDiscount || undefined,
      validFrom,
      validUntil,
      usageLimit: usageLimit || undefined,
      userUsageLimit: userUsageLimit || 1,
      isActive: isActive !== undefined ? isActive : true,
      isGlobal: isGlobal !== undefined ? isGlobal : true,
      applicableCourses: applicableCourses || [],
      applicableCategories: applicableCategories || [],
      createdBy: req.user._id,
    })

    await newCoupon.save()

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: newCoupon
    })
  } catch (error) {
    console.error("Error creating coupon:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      error: error.message
    })
  }
})

// Update coupon
router.put("/coupons/:id", async (req, res) => {
  try {
    const {
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      validFrom,
      validUntil,
      usageLimit,
      userUsageLimit,
      isActive,
      isGlobal,
      applicableCourses,
      applicableCategories,
    } = req.body

    const coupon = await PromoCode.findById(req.params.id)
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      })
    }

    // Validate discount value
    if (discountType && discountType === "percentage" && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%"
      })
    }

    // Update fields
    if (description) coupon.description = description
    if (discountType) coupon.discountType = discountType
    if (discountValue) coupon.discountValue = discountValue
    if (minimumAmount !== undefined) coupon.minimumAmount = minimumAmount
    if (maximumDiscount !== undefined) coupon.maximumDiscount = maximumDiscount
    if (validFrom) coupon.validFrom = validFrom
    if (validUntil) coupon.validUntil = validUntil
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit || undefined
    if (userUsageLimit) coupon.userUsageLimit = userUsageLimit
    if (isActive !== undefined) coupon.isActive = isActive
    if (isGlobal !== undefined) coupon.isGlobal = isGlobal
    if (applicableCourses) coupon.applicableCourses = applicableCourses
    if (applicableCategories) coupon.applicableCategories = applicableCategories

    await coupon.save()

    res.json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon
    })
  } catch (error) {
    console.error("Error updating coupon:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
      error: error.message
    })
  }
})

// Delete coupon
router.delete("/coupons/:id", async (req, res) => {
  try {
    const coupon = await PromoCode.findByIdAndDelete(req.params.id)
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      })
    }

    res.json({
      success: true,
      message: "Coupon deleted successfully",
      data: coupon
    })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
      error: error.message
    })
  }
})

module.exports = router
