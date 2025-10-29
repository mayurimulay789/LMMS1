const express = require("express")
const router = express.Router()
const Enrollment = require("../models/Enrollment")
const Course = require("../models/Course")
const auth = require("../middleware/auth")

// ✅ POST /api/enrollments - Enroll a user to a course
router.post("/", auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: "You are already enrolled in this course" });
    }

    // Get correct lesson count from modules.subcourses
    const allLessons = course.modules ? course.modules.flatMap(module => module.subcourses || []) : [];

    // Create new enrollment
    const enrollment = new Enrollment({
      user: userId,
      course: courseId,
      progress: {
        completedLessons: [],
        totalLessons: allLessons.length,
        completionPercentage: 0,
        lastAccessedAt: null,
      },
      certificate: {
        issued: false,
        issuedAt: null,
        certificateId: null,
      },
      status: "in-progress", // must exist in schema enum
      enrolledAt: new Date(),
    });

    await enrollment.save();

    res.status(201).json({
      message: "Enrolled successfully!",
      enrollmentId: enrollment._id,
      courseId: course._id,
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({ message: "Failed to enroll in course", error: error.message });
  }
});

// ✅ GET /api/enrollments/me - Get all user enrollments
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.find({ user: userId })
      .populate("course", "title description instructor thumbnail duration level reviewCount avgRating")
      .populate("payment", "amount createdAt")
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
});

// ✅ GET /api/enrollments/:courseId - Get a specific enrollment
router.get("/:courseId", auth, async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      status: "active"
    })
      .populate("course")
      .populate("payment");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json(enrollment);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    res.status(500).json({ message: "Failed to fetch enrollment" });
  }
})

// ✅ POST /api/enrollments/progress - Update course progress
router.post("/progress", auth, async (req, res) => {
  try {
    const { courseId, lessonId, timeSpent } = req.body;
    const userId = req.user.id;

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Initialize progress if not exists (for legacy enrollments)
    if (!enrollment.progress) {
      const course = await Course.findById(courseId);
      const allLessons = course ? (course.modules ? course.modules.flatMap(module => module.subcourses || []) : []) : [];
      enrollment.progress = {
        completedLessons: [],
        totalLessons: allLessons.length,
        completionPercentage: 0,
        lastAccessedAt: new Date(),
      };
    }

    // Always update totalLessons to current course lessons count
    const course = await Course.findById(courseId);
    const allLessons = course ? (course.modules ? course.modules.flatMap(module => module.subcourses || []) : []) : [];
    enrollment.progress.totalLessons = allLessons.length;

    // Check if lesson is already completed
    const existingLesson = enrollment.progress.completedLessons.find(
      (lesson) => lesson.lessonId === lessonId
    );

    if (!existingLesson) {
      // Add new completed lesson
      enrollment.progress.completedLessons.push({
        lessonId,
        completedAt: new Date(),
      });

      // Update completion percentage
      enrollment.progress.completionPercentage = Math.round(
        (enrollment.progress.completedLessons.length / enrollment.progress.totalLessons) * 100
      );
    }

    // Update last accessed only, remove timeSpent tracking
    enrollment.progress.lastAccessedAt = new Date();

    // Check if course is completed and trigger certificate generation
    if (enrollment.progress.completionPercentage >= 100 && !enrollment.certificate.issued) {
      console.log(`Attempting auto certificate generation for user ${userId}, course ${courseId}`);
      try {
        const certificateService = require("../services/certificateService");
        const User = require("../models/User");

        const user = await User.findById(userId);
        if (!user) {
          console.error(`User not found for certificate generation: ${userId}`);
          // Don't fail the progress update, just log the error
          return;
        }

        const course = await Course.findById(courseId);
        if (!course) {
          console.error(`Course not found for certificate generation: ${courseId}`);
          // Don't fail the progress update, just log the error
          return;
        }

        // Remove hoursCompleted calculation based on timeSpent
        const hoursCompleted = 0;

        const skillsMap = {
          Programming: ["Problem Solving", "Code Development", "Debugging", "Software Architecture"],
          Design: ["Visual Design", "User Experience", "Prototyping", "Design Thinking"],
          Marketing: ["Digital Strategy", "Analytics", "Campaign Management", "Brand Development"],
          Business: ["Strategic Planning", "Leadership", "Project Management", "Business Analysis"],
          Creative: ["Creative Thinking", "Visual Communication", "Artistic Expression", "Media Production"],
        };
        const skills = skillsMap[course.category] || [
          "Professional Development",
          "Continuous Learning",
        ];

        console.log(`Generating certificate for user: ${user.name}, course: ${course.title}`);

        // Generate certificate automatically
        const certificate = await certificateService.generateCertificate({
          user,
          course,
          enrollment,
          studentName: user.name,
          courseName: course.title,
          instructor: course.instructor,
          completionDate: new Date(),
          finalScore: 85,
          hoursCompleted,
          skills,
          metadata: {
            autoGenerated: true,
            triggeredBy: "progress_completion",
          },
        });

        console.log(`Certificate generated successfully: ${certificate.certificateId}`);

        // Update enrollment with certificate info
        enrollment.certificate.issued = true;
        enrollment.certificate.issuedAt = certificate.issueDate;
        enrollment.certificate.certificateId = certificate.certificateId;
        enrollment.status = "completed";

        console.log(`Enrollment updated with certificate: ${certificate.certificateId}`);
      } catch (error) {
        console.error("Auto certificate generation error:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          userId,
          courseId
        });
        // Don't fail the progress update if certificate generation fails
        // The certificate can be generated manually later
      }
    }

    await enrollment.save();

    res.json({
      message: "Progress updated successfully",
      progress: enrollment.progress,
      certificate: enrollment.certificate,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Failed to update progress" });
  }
});

// ✅ GET /api/enrollments/progress/:courseId - Get progress of specific course
const mongoose = require("mongoose")

router.get("/progress/:courseId", auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Removed non-error log to reduce noise
    // console.log(`Fetching progress for user: ${userId}, course: ${courseId}`);

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.warn(`Invalid course ID received: ${courseId}`);
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Initialize progress if not exists (for legacy enrollments)
    if (!enrollment.progress) {
      const course = await Course.findById(courseId);
      if (enrollment.status === "completed") {
        // For legacy completed enrollments, mark all lessons as complete
        const allLessons = course ? (course.modules ? course.modules.flatMap(module => module.subcourses) : []) : [];
        const allCompletedLessons = allLessons.map(lesson => ({
          lessonId: lesson._id,
          completedAt: enrollment.enrolledAt || new Date(),
        }));
        enrollment.progress = {
          completedLessons: allCompletedLessons,
          totalLessons: allLessons.length,
          completionPercentage: 100,
          timeSpent: 0, // Could estimate or leave as 0
          lastAccessedAt: new Date(),
        };

        // Auto-generate certificate if not issued
        if (!enrollment.certificate.issued) {
          try {
            const certificateService = require("../services/certificateService");
            const User = require("../models/User");

            const user = await User.findById(userId);
            const hoursCompleted = 10; // Default for legacy

            const skillsMap = {
              Programming: ["Problem Solving", "Code Development", "Debugging", "Software Architecture"],
              Design: ["Visual Design", "User Experience", "Prototyping", "Design Thinking"],
              Marketing: ["Digital Strategy", "Analytics", "Campaign Management", "Brand Development"],
              Business: ["Strategic Planning", "Leadership", "Project Management", "Business Analysis"],
              Creative: ["Creative Thinking", "Visual Communication", "Artistic Expression", "Media Production"],
            };
            const skills = skillsMap[course.category] || ["Professional Development", "Continuous Learning"];

            const certificate = await certificateService.generateCertificate({
              user,
              course,
              enrollment,
              studentName: user.name,
              courseName: course.title,
              instructor: course.instructor,
              completionDate: enrollment.enrolledAt || new Date(),
              finalScore: 85,
              hoursCompleted,
              skills,
              metadata: {
                autoGenerated: true,
                triggeredBy: "legacy_completion",
              },
            });

            enrollment.certificate.issued = true;
            enrollment.certificate.issuedAt = certificate.issueDate;
            enrollment.certificate.certificateId = certificate.certificateId;
          } catch (error) {
            console.error("Auto certificate generation for legacy error:", error);
          }
        }
      } else {
        const allLessons = course ? (course.modules ? course.modules.flatMap(module => module.subcourses) : []) : [];
        enrollment.progress = {
          completedLessons: [],
          totalLessons: allLessons.length,
          completionPercentage: 0,
          timeSpent: 0,
          lastAccessedAt: new Date(),
        };
      }
      await enrollment.save();
    }

    // Fix progress inconsistency: if certificate is issued but progress < 100%, set to 100%
    if (enrollment.certificate.issued && enrollment.progress.completionPercentage < 100) {
      const course = await Course.findById(courseId);
      const allLessons = course ? (course.modules ? course.modules.flatMap(module => module.subcourses) : []) : [];
      enrollment.progress.completedLessons = allLessons.map(lesson => ({
        lessonId: lesson._id.toString(),
        completedAt: enrollment.certificate.issuedAt || new Date(),
      }));
      enrollment.progress.totalLessons = allLessons.length;
      enrollment.progress.completionPercentage = 100;
      enrollment.status = "completed";
      await enrollment.save();
    }

    res.json({
      progress: enrollment.progress,
      certificate: enrollment.certificate,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
});

// DEV ROUTE: force issue a certificate for a course
router.post("/:courseId/force-certificate", auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Mark certificate issued
    enrollment.certificate.issued = true;
    enrollment.certificate.issuedAt = new Date();
    enrollment.certificate.certificateId = "FORCED_CERT_" + Date.now();
    enrollment.status = "completed";

    await enrollment.save();

    res.json({
      message: "Certificate issued manually",
      certificate: enrollment.certificate
    });
  } catch (err) {
    console.error("Force certificate error:", err);
    res.status(500).json({ message: "Failed to issue certificate" });
  }
});


// ✅ GET /api/enrollments/certificates/me - Get all user certificates
router.get("/certificates/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.find({
      user: userId,
      "certificate.issued": true,
    })
      .populate("course", "title instructor")
      .select("certificate course");

    const certificates = enrollments.map((enrollment) => ({
      _id: enrollment._id,
      certificateId: enrollment.certificate.certificateId,
      courseName: enrollment.course.title,
      instructor: enrollment.course.instructor,
      issuedAt: enrollment.certificate.issuedAt,
      courseId: enrollment.course._id,
    }));

    res.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ message: "Failed to fetch certificates" });
  }
});

module.exports = router;
