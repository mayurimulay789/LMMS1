const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs")
const axios = require("axios")
const Certificate = require("../models/Certificate")
const Enrollment = require("../models/Enrollment")
const Course = require("../models/Course")
const User = require("../models/User")
const certificateService = require("../services/certificateService")
const { uploadToCloudinary } = require("../utils/cloudinary")
const auth = require("../middleware/auth")

// Promote any legacy local PDFs to Cloudinary on-demand
async function ensureCloudPdf(certificate) {
  if (certificate?.pdfUrl && certificate.pdfUrl.includes("res.cloudinary.com")) {
    // If already on Cloudinary but stored under image upload, regenerate and re-upload as raw to fix PDF preview
    if (certificate.pdfUrl.includes("/raw/upload/")) {
      return certificate.pdfUrl
    }

    try {
      const pdfUrl = await certificateService.regenerateCertificateAsset(certificate)
      return pdfUrl
    } catch (regenErr) {
      console.warn("Could not regenerate certificate PDF as raw", regenErr.message)
      return certificate.pdfUrl
    }
  }

  const localPath = certificate?.pdfPath
  if (localPath && fs.existsSync(localPath)) {
    const buffer = fs.readFileSync(localPath)
    const cloudFolder = process.env.CLOUDINARY_CERT_FOLDER || "lms/certificates"
    const pdfUrl = await uploadToCloudinary(buffer, cloudFolder, "raw", "application/pdf")
    certificate.pdfUrl = pdfUrl
    certificate.pdfPath = pdfUrl
    await certificate.save()
    // Best-effort cleanup; ignore errors
    try {
      fs.unlinkSync(localPath)
    } catch (cleanupErr) {
      console.warn("Could not remove local certificate file", cleanupErr.message)
    }
    return pdfUrl
  }

  return null
}

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

    // Check if assessments are passed (if any)
    // This would need to be implemented based on your assessment system
    // For now, we'll assume assessments are passed if progress is 100%

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
router.get("/download/:certificateId", auth, async (req, res) => {
  try {
    const { certificateId } = req.params
    const userId = req.user.id

    const certificate = await Certificate.findOne({
      certificateId,
      user: userId,
      isValid: true,
    })

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" })
    }

    let pdfUrl = await ensureCloudPdf(certificate)
    if (!pdfUrl) {
      return res.status(404).json({ message: "Certificate file not found" })
    }

    try {
      const response = await axios.get(pdfUrl, { responseType: "arraybuffer" })
      res.setHeader("Content-Type", "application/pdf")
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${certificate.certificateNumber || certificate.certificateId}.pdf"`
      )
      res.send(response.data)
    } catch (fetchErr) {
      console.error("Failed to fetch PDF from Cloudinary:", fetchErr.message)
      res.status(500).json({ message: "Failed to download certificate" })
    }
  } catch (error) {
    console.error("Certificate download error:", error)
    res.status(500).json({ message: "Failed to download certificate" })
  }
})

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
router.get("/pdf/:certificateId", async (req, res) => {
  try {
    const { certificateId } = req.params

    const certificate = await Certificate.findOne({
      certificateId,
      isValid: true,
    })

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" })
    }

    const pdfUrl = await ensureCloudPdf(certificate)
    if (!pdfUrl) {
      return res.status(404).json({ message: "Certificate file not found" })
    }

    try {
      // Add transformation to force inline display in browser
      // Use fl_attachment=false to prevent download
      const separator = pdfUrl.includes("?") ? "&" : "?"
      const inlineUrl = `${pdfUrl}${separator}fl_attachment=false`
      
      return res.redirect(inlineUrl)
    } catch (fetchErr) {
      console.error("Failed to fetch PDF from Cloudinary:", fetchErr.message)
      res.status(500).json({ message: "Failed to serve certificate" })
    }
  } catch (error) {
    console.error("Certificate PDF serve error:", error)
    res.status(500).json({ message: "Failed to serve certificate" })
  }
})

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
