// const express = require("express")
// const router = express.Router()
// const path = require("path")
// const Certificate = require("../models/Certificate")
// const Enrollment = require("../models/Enrollment")
// const Course = require("../models/Course")
// const User = require("../models/User")
// const certificateService = require("../services/certificateService")
// const auth = require("../middleware/auth")

// // Generate certificate (triggered automatically or manually)
// router.post("/generate", auth, async (req, res) => {
//   try {
//     const { courseId } = req.body
//     const userId = req.user.id

//     // Get enrollment details
//     const enrollment = await Enrollment.findOne({
//       user: userId,
//       course: courseId,
//     }).populate("course")

//     if (!enrollment) {
//       return res.status(404).json({ message: "Enrollment not found" })
//     }

//     // Check if certificate already exists
//     const existingCertificate = await Certificate.findOne({
//       user: userId,
//       course: courseId,
//     })

//     if (existingCertificate) {
//       return res.status(400).json({
//         message: "Certificate already exists",
//         certificate: existingCertificate,
//       })
//     }

//     // Verify completion requirements
//     if (enrollment.progress.completionPercentage < 100) {
//       return res.status(400).json({
//         message: "Course not completed. Progress must be 100%",
//         currentProgress: enrollment.progress.completionPercentage,
//       })
//     }

//     // Check if assessments are passed (if any)
//     // This would need to be implemented based on your assessment system
//     // For now, we'll assume assessments are passed if progress is 100%

//     const user = await User.findById(userId)
//     const course = enrollment.course

//     // Calculate hours completed (convert minutes to hours)
//     const hoursCompleted = Math.round(((enrollment.progress.timeSpent || 0) / 60) * 10) / 10

//     // Extract skills from course (this could be enhanced)
// const skills = extractSkillsFromCourse(course)

//     // Generate certificate
//     const certificate = await certificateService.generateCertificate({
//       user,
//       course,
//       enrollment,
//       studentName: user.name,
//       courseName: course.title,
//       instructor: course.instructor,
//       completionDate: enrollment.progress.lastAccessedAt || new Date(),
//       finalScore: 85, // This should come from actual assessment scores
//       hoursCompleted,
//       skills,
//       metadata: {
//         ipAddress: req.ip,
//         userAgent: req.get("User-Agent"),
//       },
//     })

//     // Update enrollment with certificate info
//     enrollment.certificate.issued = true
//     enrollment.certificate.issuedAt = certificate.issueDate
//     enrollment.certificate.certificateId = certificate.certificateId
//     await enrollment.save()

//     res.json({
//       message: "Certificate generated successfully",
//       certificate: {
//         id: certificate._id,
//         certificateId: certificate.certificateId,
//         certificateNumber: certificate.certificateNumber,
//         pdfUrl: certificate.pdfUrl,
//         verificationUrl: certificate.verificationUrl,
//         issueDate: certificate.issueDate,
//       },
//     })
//   } catch (error) {
//     res.status(500).json({ message: error.message || "Failed to generate certificate" })
//   }
// })

// // Get user's certificates
// router.get("/me", auth, async (req, res) => {
//   try {
//     const userId = req.user.id
//     const certificates = await certificateService.getUserCertificates(userId)

//     res.json(certificates)
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch certificates" })
//   }
// })

// // Get specific certificate details
// router.get("/:certificateId", async (req, res) => {
//   try {
//     const { certificateId } = req.params

//     const certificate = await Certificate.findOne({
//       certificateId,
//     })
//       .populate("user", "name email")
//       .populate("course", "title instructor description")

//     if (!certificate) {

//       return res.status(404).json({ message: "Certificate not found" })
//     }

//     if (!certificate.isValid) {
//       console.log("Certificate fetch failed for ID (invalid):", certificateId)
//       return res.status(404).json({ message: "Certificate is invalid or revoked" })
//     }

//     res.json(certificate)
//   } catch (error) {
//     console.error("Get certificate error:", error)
//     res.status(500).json({ message: "Failed to fetch certificate" })
//   }
// })

// // Download certificate PDF
// router.get("/download/:certificateId", auth, async (req, res) => {
//   try {
//     const { certificateId } = req.params
//     const userId = req.user.id

//     const certificate = await Certificate.findOne({
//       certificateId,
//       user: userId,
//       isValid: true,
//     })

//     if (!certificate) {
//       return res.status(404).json({ message: "Certificate not found" })
//     }

//     const filePath = certificate.pdfPath

//     if (!require("fs").existsSync(filePath)) {
//       return res.status(404).json({ message: "Certificate file not found" })
//     }

//     res.setHeader("Content-Type", "application/pdf")
//     res.setHeader("Content-Disposition", `attachment; filename="${certificate.certificateNumber}.pdf"`)

//     const fileStream = require("fs").createReadStream(filePath)
//     fileStream.pipe(res)
//   } catch (error) {
//     console.error("Certificate download error:", error)
//     res.status(500).json({ message: "Failed to download certificate" })
//   }
// })

// // Verify certificate (public endpoint)
// router.get("/verify/:certificateId", async (req, res) => {
//   try {
//     const { certificateId } = req.params

//     const certificate = await Certificate.findOne({
//       certificateId,
//     }).populate("user", "name email")

//     if (!certificate) {
//       console.log("Certificate verification failed for ID:", certificateId)
//       return res.status(404).json({
//         valid: false,
//         message: "Certificate not found",
//       })
//     }

//     if (!certificate.isValid) {
//       console.log("Certificate verification failed for ID (invalid):", certificateId)
//       return res.status(404).json({
//         valid: false,
//         message: "Certificate is invalid or revoked",
//       })
//     }

//     // Update verification count and last verified date
//     certificate.metadata.verificationCount = (certificate.metadata.verificationCount || 0) + 1
//     certificate.metadata.lastVerifiedAt = new Date()
//     await certificate.save()

//     res.json({
//       valid: true,
//       certificate: {
//         certificateId: certificate.certificateId,
//         certificateNumber: certificate.certificateNumber,
//         studentName: certificate.studentName,
//         courseName: certificate.courseName,
//         instructor: certificate.instructor,
//         completionDate: certificate.completionDate,
//         issueDate: certificate.issueDate,
//         grade: certificate.grade,
//         finalScore: certificate.finalScore,
//         hoursCompleted: certificate.hoursCompleted,
//         skills: certificate.skills,
//         verificationUrl: certificate.verificationUrl,
//       },
//     })
//   } catch (error) {
//     console.error("Certificate verification error:", error)
//     res.status(500).json({ message: "Failed to verify certificate" })
//   }
// })

// // Serve certificate PDFs (public endpoint for viewing)
// router.get("/pdf/:certificateId", async (req, res) => {
//   try {
//     const { certificateId } = req.params

//     const certificate = await Certificate.findOne({
//       certificateId,
//       isValid: true,
//     })

//     if (!certificate) {
//       return res.status(404).json({ message: "Certificate not found" })
//     }

//     const filePath = certificate.pdfPath

//     if (!require("fs").existsSync(filePath)) {
//       return res.status(404).json({ message: "Certificate file not found" })
//     }

//     res.setHeader("Content-Type", "application/pdf")
//     res.setHeader("Content-Disposition", `inline; filename="${certificate.certificateNumber}.pdf"`)

//     const fileStream = require("fs").createReadStream(filePath)
//     fileStream.pipe(res)
//   } catch (error) {
//     console.error("Certificate PDF serve error:", error)
//     res.status(500).json({ message: "Failed to serve certificate" })
//   }
// })

// // Admin: Revoke certificate
// router.post("/revoke/:certificateId", auth, async (req, res) => {
//   try {
//     // Check if user is admin
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Access denied. Admin only." })
//     }

//     const { certificateId } = req.params
//     const { reason } = req.body

//     const certificate = await certificateService.revokeCertificate(certificateId, reason)

//     res.json({
//       message: "Certificate revoked successfully",
//       certificate: {
//         certificateId: certificate.certificateId,
//         isValid: certificate.isValid,
//         revokedAt: certificate.metadata.revokedAt,
//         revokeReason: certificate.metadata.revokeReason,
//       },
//     })
//   } catch (error) {
//     console.error("Certificate revocation error:", error)
//     res.status(500).json({ message: error.message || "Failed to revoke certificate" })
//   }
// })

// // Helper function to extract skills from course
// function extractSkillsFromCourse(course) {
//   const skillsMap = {
//     Programming: ["Problem Solving", "Code Development", "Debugging", "Software Architecture"],
//     Design: ["Visual Design", "User Experience", "Prototyping", "Design Thinking"],
//     Marketing: ["Digital Strategy", "Analytics", "Campaign Management", "Brand Development"],
//     Business: ["Strategic Planning", "Leadership", "Project Management", "Business Analysis"],
//     Creative: ["Creative Thinking", "Visual Communication", "Artistic Expression", "Media Production"],
//   }

//   return skillsMap[course.category] || ["Professional Development", "Continuous Learning"]
// }

// module.exports = router

const express = require("express")
const router = express.Router()
const path = require("path")
const Certificate = require("../models/Certificate")
const Enrollment = require("../models/Enrollment")
const Course = require("../models/Course")
const User = require("../models/User")
const certificateService = require("../services/certificateService")
const auth = require("../middleware/auth")

// Generate certificate (triggered automatically or manually)
router.post("/generate", auth, async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    // Get enrollment details
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    }).populate("course")

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" })
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    })

    if (existingCertificate) {
      return res.status(400).json({
        message: "Certificate already exists",
        certificate: existingCertificate,
      })
    }

    // Verify completion requirements
    if (enrollment.progress.completionPercentage < 100) {
      return res.status(400).json({
        message: "Course not completed. Progress must be 100%",
        currentProgress: enrollment.progress.completionPercentage,
      })
    }

    const user = await User.findById(userId)
    const course = enrollment.course

    // Calculate hours completed (convert minutes to hours)
    const hoursCompleted = Math.round(((enrollment.progress.timeSpent || 0) / 60) * 10) / 10

    // Extract skills from course (this could be enhanced)
const skills = extractSkillsFromCourse(course)

    // Generate certificate
    const certificate = await certificateService.generateCertificate({
      user,
      course,
      enrollment,
      studentName: user.name,
      courseName: course.title,
      instructor: course.instructor,
      completionDate: enrollment.progress.lastAccessedAt || new Date(),
      finalScore: 85, // This should come from actual assessment scores
      hoursCompleted,
      skills,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    })

    // Update enrollment with certificate info
    enrollment.certificate.issued = true
    enrollment.certificate.issuedAt = certificate.issueDate
    enrollment.certificate.certificateId = certificate.certificateId
    await enrollment.save()

    res.json({
      message: "Certificate generated successfully",
      certificate: {
        id: certificate._id,
        certificateId: certificate.certificateId,
        certificateNumber: certificate.certificateNumber,
        pdfUrl: certificate.pdfUrl,
        verificationUrl: certificate.verificationUrl,
        issueDate: certificate.issueDate,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to generate certificate" })
  }
})

// Get user's certificates
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id
    const certificates = await certificateService.getUserCertificates(userId)

    res.json(certificates)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch certificates" })
  }
})

// Get specific certificate details
router.get("/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params

    const certificate = await Certificate.findOne({
      certificateId,
    })
      .populate("user", "name email")
      .populate("course", "title instructor description")

    if (!certificate) {

      return res.status(404).json({ message: "Certificate not found" })
    }

    if (!certificate.isValid) {
      console.log("Certificate fetch failed for ID (invalid):", certificateId)
      return res.status(404).json({ message: "Certificate is invalid or revoked" })
    }

    res.json(certificate)
  } catch (error) {
    console.error("Get certificate error:", error)
    res.status(500).json({ message: "Failed to fetch certificate" })
  }
})

// Download certificate PDF
// router.get("/download/:certificateId", auth, async (req, res) => {
//   try {
//     const { certificateId } = req.params
//     const userId = req.user.id

//     const certificate = await Certificate.findOne({
//       certificateId,
//       user: userId,
//       isValid: true,
//     })

//     if (!certificate) {
//       return res.status(404).json({ message: "Certificate not found" })
//     }

//     // Check if it's a Cloudinary URL
//     if (certificate.pdfUrl.includes('cloudinary.com')) {
//       // Redirect to Cloudinary URL with download parameter
//       const downloadUrl = `${certificate.pdfUrl}?dl=1`
//       return res.redirect(downloadUrl)
//     } else {
//       // Fallback to local file for old certificates
//       const filePath = certificate.pdfPath
//       if (!require("fs").existsSync(filePath)) {
//         return res.status(404).json({ message: "Certificate file not found" })
//       }

//       res.setHeader("Content-Type", "application/pdf")
//       res.setHeader("Content-Disposition", `attachment; filename="${certificate.certificateNumber}.pdf"`)

//       const fileStream = require("fs").createReadStream(filePath)
//       fileStream.pipe(res)
//     }
//   } catch (error) {
//     console.error("Certificate download error:", error)
//     res.status(500).json({ message: "Failed to download certificate" })
//   }
// })

// Download certificate PDF
router.get("/download/:certificateId", auth, async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;

    const certificate = await Certificate.findOne({
      certificateId,
      user: userId,
      isValid: true,
    });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Check if it's a Cloudinary URL
    if (certificate.pdfUrl.includes('cloudinary.com')) {
      let downloadUrl = certificate.pdfUrl;
      
      // For Cloudinary raw files, add download flag
      if (downloadUrl.includes('/raw/upload/')) {
        // Add flag to force download
        downloadUrl = downloadUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
      } else {
        // For regular URLs, add download parameter
        downloadUrl = downloadUrl + '?dl=1';
      }
      
      return res.redirect(downloadUrl);
    } else {
      // Fallback to local file for old certificates
      const filePath = certificate.pdfPath;
      if (!require("fs").existsSync(filePath)) {
        return res.status(404).json({ message: "Certificate file not found" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${certificate.certificateNumber}.pdf"`);

      const fileStream = require("fs").createReadStream(filePath);
      fileStream.pipe(res);
    }
  } catch (error) {
    console.error("Certificate download error:", error);
    res.status(500).json({ message: "Failed to download certificate" });
  }
});

// Verify certificate (public endpoint)
router.get("/verify/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params

    const certificate = await Certificate.findOne({
      certificateId,
    }).populate("user", "name email")

    if (!certificate) {
      console.log("Certificate verification failed for ID:", certificateId)
      return res.status(404).json({
        valid: false,
        message: "Certificate not found",
      })
    }

    if (!certificate.isValid) {
      console.log("Certificate verification failed for ID (invalid):", certificateId)
      return res.status(404).json({
        valid: false,
        message: "Certificate is invalid or revoked",
      })
    }

    // Update verification count and last verified date
    certificate.metadata.verificationCount = (certificate.metadata.verificationCount || 0) + 1
    certificate.metadata.lastVerifiedAt = new Date()
    await certificate.save()

    res.json({
      valid: true,
      certificate: {
        certificateId: certificate.certificateId,
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructor: certificate.instructor,
        completionDate: certificate.completionDate,
        issueDate: certificate.issueDate,
        grade: certificate.grade,
        finalScore: certificate.finalScore,
        hoursCompleted: certificate.hoursCompleted,
        skills: certificate.skills,
        verificationUrl: certificate.verificationUrl,
      },
    })
  } catch (error) {
    console.error("Certificate verification error:", error)
    res.status(500).json({ message: "Failed to verify certificate" })
  }
})

// Serve certificate PDFs (public endpoint for viewing)
// router.get("/pdf/:certificateId", async (req, res) => {
//   try {
//     const { certificateId } = req.params

//     const certificate = await Certificate.findOne({
//       certificateId,
//       isValid: true,
//     })

//     if (!certificate) {
//       return res.status(404).json({ message: "Certificate not found" })
//     }

//     // Check if it's a Cloudinary URL
//     if (certificate.pdfUrl.includes('cloudinary.com')) {
//       // Redirect directly to Cloudinary URL
//       return res.redirect(certificate.pdfUrl)
//     } else {
//       // Fallback to local file for old certificates
//       const filePath = certificate.pdfPath
//       if (!require("fs").existsSync(filePath)) {
//         return res.status(404).json({ message: "Certificate file not found" })
//       }

//       res.setHeader("Content-Type", "application/pdf")
//       res.setHeader("Content-Disposition", `inline; filename="${certificate.certificateNumber}.pdf"`)

//       const fileStream = require("fs").createReadStream(filePath)
//       fileStream.pipe(res)
//     }
//   } catch (error) {
//     console.error("Certificate PDF serve error:", error)
//     res.status(500).json({ message: "Failed to serve certificate" })
//   }
// })

// Serve certificate PDFs (public endpoint for viewing)
router.get("/pdf/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({
      certificateId,
      isValid: true,
    });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Check if it's a Cloudinary URL
    if (certificate.pdfUrl.includes('cloudinary.com')) {
      // For Cloudinary raw files, we need to add the .pdf extension explicitly
      let cloudinaryUrl = certificate.pdfUrl;
      
      // Add transformation to ensure it's served as PDF
      if (cloudinaryUrl.includes('/raw/upload/')) {
        // Replace /raw/upload/ with /raw/upload/fl_attachment:certificate.pdf/
        // This tells Cloudinary to serve it as a downloadable PDF
        cloudinaryUrl = cloudinaryUrl.replace('/raw/upload/', '/raw/upload/fl_inline/');
        
        // OR try this alternative for inline viewing:
        // cloudinaryUrl = cloudinaryUrl + '.pdf';
      }
      
      return res.redirect(cloudinaryUrl);
    } else {
      // Fallback to local file for old certificates
      const filePath = certificate.pdfPath;
      if (!require("fs").existsSync(filePath)) {
        return res.status(404).json({ message: "Certificate file not found" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${certificate.certificateNumber}.pdf"`);

      const fileStream = require("fs").createReadStream(filePath);
      fileStream.pipe(res);
    }
  } catch (error) {
    console.error("Certificate PDF serve error:", error);
    res.status(500).json({ message: "Failed to serve certificate" });
  }
});


// Admin: Revoke certificate
router.post("/revoke/:certificateId", auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." })
    }

    const { certificateId } = req.params
    const { reason } = req.body

    const certificate = await certificateService.revokeCertificate(certificateId, reason)

    res.json({
      message: "Certificate revoked successfully",
      certificate: {
        certificateId: certificate.certificateId,
        isValid: certificate.isValid,
        revokedAt: certificate.metadata.revokedAt,
        revokeReason: certificate.metadata.revokeReason,
      },
    })
  } catch (error) {
    console.error("Certificate revocation error:", error)
    res.status(500).json({ message: error.message || "Failed to revoke certificate" })
  }
})

// Helper function to extract skills from course
function extractSkillsFromCourse(course) {
  const skillsMap = {
    Programming: ["Problem Solving", "Code Development", "Debugging", "Software Architecture"],
    Design: ["Visual Design", "User Experience", "Prototyping", "Design Thinking"],
    Marketing: ["Digital Strategy", "Analytics", "Campaign Management", "Brand Development"],
    Business: ["Strategic Planning", "Leadership", "Project Management", "Business Analysis"],
    Creative: ["Creative Thinking", "Visual Communication", "Artistic Expression", "Media Production"],
  }

  return skillsMap[course.category] || ["Professional Development", "Continuous Learning"]
}

module.exports = router 


