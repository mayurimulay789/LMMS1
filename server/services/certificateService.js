const PDFDocument = require("pdfkit")
const QRCode = require("qrcode")
const fs = require("fs")
const path = require("path")
const { v4: uuidv4 } = require("uuid")
const Certificate = require("../models/Certificate")

class CertificateService {
  constructor() {
    this.certificatesDir = path.join(__dirname, "../public/certificates")
    this.ensureDirectoryExists()
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.certificatesDir)) {
      fs.mkdirSync(this.certificatesDir, { recursive: true })
    }
  }

  async generateCertificate(data) {
    try {
      const {
        user,
        course,
        enrollment,
        studentName,
        courseName,
        instructor,
        completionDate,
        finalScore = 85,
        hoursCompleted = 0,
        skills = [],
        metadata = {},
      } = data

      // Generate unique certificate ID
      const certificateId = `CERT_${Date.now()}_${uuidv4().substr(0, 8).toUpperCase()}`
      const filename = `${certificateId}.pdf`
      const filePath = path.join(this.certificatesDir, filename)
      const publicUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/certificates/${filename}`
      const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-certificate/${certificateId}`

      // Generate QR code for verification
      const qrCodeData = await QRCode.toDataURL(verificationUrl)

      // Create PDF document
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      })

      // Pipe to file
      doc.pipe(fs.createWriteStream(filePath))

      // Add certificate content
      await this.addCertificateContent(doc, {
        studentName,
        courseName,
        instructor,
        completionDate,
        finalScore,
        hoursCompleted,
        skills,
        certificateId,
        qrCodeData,
        verificationUrl,
      })

      // Finalize PDF
      doc.end()

      // Wait for PDF to be written
      await new Promise((resolve, reject) => {
        doc.on("end", resolve)
        doc.on("error", reject)
      })

      // Generate certificate number
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, "0")
      const random = Math.random().toString(36).substr(2, 6).toUpperCase()
      const certificateNumber = `CERT-${year}${month}-${random}`

      // Create certificate record in database
      const certificate = new Certificate({
        certificateId,
        certificateNumber,
        user: user._id,
        course: course._id,
        enrollment: enrollment._id,
        studentName,
        courseName,
        instructor,
        completionDate,
        finalScore,
        hoursCompleted,
        skills,
        pdfPath: filePath,
        pdfUrl: publicUrl,
        verificationUrl,
        qrCodeData,
        metadata: {
          ...metadata,
          generatedAt: new Date(),
          fileSize: fs.statSync(filePath).size,
        },
      })

      try {
        await certificate.save()
      } catch (saveError) {
        console.error("Certificate DB save error:", saveError)
        // Cleanup: Delete the generated PDF if DB save fails
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log(`Cleaned up orphaned PDF: ${filePath}`)
        }
        throw new Error(`Failed to save certificate to database: ${saveError.message}`)
      }

      return certificate
    } catch (error) {
      console.error("Certificate generation error:", error)
      throw new Error(`Failed to generate certificate: ${error.message}`)
    }
  }

  async addCertificateContent(doc, data) {
    const {
      studentName,
      courseName,
      instructor,
      completionDate,
      finalScore,
      hoursCompleted,
      skills,
      certificateId,
      qrCodeData,
      verificationUrl,
    } = data

    // Colors
    const primaryColor = "#1e40af"
    const secondaryColor = "#3b82f6"
    const goldColor = "#f59e0b"
    const textColor = "#1f2937"

    // Add background gradient
    doc.rect(0, 0, doc.page.width, doc.page.height).fillAndStroke("#f8fafc", "#e2e8f0")

    // Add decorative border
    doc
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(3)
      .stroke(primaryColor)

    doc
      .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
      .lineWidth(1)
      .stroke(secondaryColor)

    // Add header
    doc.fontSize(32).fillColor(primaryColor).font("Helvetica-Bold").text("CERTIFICATE OF COMPLETION", 0, 100, {
      align: "center",
      width: doc.page.width,
    })

    // Add decorative line
    doc
      .moveTo(200, 150)
      .lineTo(doc.page.width - 200, 150)
      .lineWidth(2)
      .stroke(goldColor)

    // Add "This is to certify that"
    doc.fontSize(16).fillColor(textColor).font("Helvetica").text("This is to certify that", 0, 180, {
      align: "center",
      width: doc.page.width,
    })

    // Add student name
    doc.fontSize(36).fillColor(primaryColor).font("Helvetica-Bold").text(studentName, 0, 220, {
      align: "center",
      width: doc.page.width,
    })

    // Add completion text
    doc.fontSize(16).fillColor(textColor).font("Helvetica").text("has successfully completed the course", 0, 280, {
      align: "center",
      width: doc.page.width,
    })

    // Add course name
    doc.fontSize(24).fillColor(secondaryColor).font("Helvetica-Bold").text(courseName, 0, 310, {
      align: "center",
      width: doc.page.width,
    })

    // Add instructor and completion details
    const detailsY = 360
    doc
      .fontSize(14)
      .fillColor(textColor)
      .font("Helvetica")
      .text(`Instructor: ${instructor}`, 100, detailsY)
      .text(`Completion Date: ${new Date(completionDate).toLocaleDateString()}`, 100, detailsY + 20)
      .text(`Final Score: ${finalScore}%`, 100, detailsY + 40)
      .text(`Hours Completed: ${hoursCompleted}`, 100, detailsY + 60)

    // Add skills if available
    if (skills && skills.length > 0) {
      doc
        .fontSize(12)
        .fillColor(textColor)
        .font("Helvetica-Bold")
        .text("Skills Acquired:", 100, detailsY + 90)

      skills.slice(0, 4).forEach((skill, index) => {
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(`• ${skill}`, 120, detailsY + 110 + index * 15)
      })
    }

    // Add QR code
    if (qrCodeData) {
      const qrImage = qrCodeData.split(",")[1]
      const qrBuffer = Buffer.from(qrImage, "base64")
      doc.image(qrBuffer, doc.page.width - 150, detailsY, {
        width: 80,
        height: 80,
      })

      doc
        .fontSize(10)
        .fillColor(textColor)
        .text("Scan to verify", doc.page.width - 150, detailsY + 90, {
          width: 80,
          align: "center",
        })
    }

    // Add certificate ID
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .font("Helvetica")
      .text(`Certificate ID: ${certificateId}`, 100, doc.page.height - 100)

    // Add verification URL
    doc
      .fontSize(9)
      .fillColor("#6b7280")
      .text(`Verify at: ${verificationUrl}`, 100, doc.page.height - 80)

    // Add signature area
    doc
      .fontSize(12)
      .fillColor(textColor)
      .font("Helvetica-Bold")
      .text("LearnHub LMS", doc.page.width - 200, doc.page.height - 120)

    doc
      .moveTo(doc.page.width - 200, doc.page.height - 100)
      .lineTo(doc.page.width - 100, doc.page.height - 100)
      .stroke("#6b7280")

    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .font("Helvetica")
      .text("Authorized Signature", doc.page.width - 200, doc.page.height - 90)

    // Add issue date
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(`Issued on: ${new Date().toLocaleDateString()}`, doc.page.width - 200, doc.page.height - 70)
  }

  async getUserCertificates(userId) {
    try {
      const certificates = await Certificate.find({
        user: userId,
        isValid: true,
      })
        .populate("course", "title instructor category")
        .sort({ createdAt: -1 })

      return certificates.map((cert) => ({
        id: cert._id,
        certificateId: cert.certificateId,
        certificateNumber: cert.certificateNumber,
        courseName: cert.courseName,
        instructor: cert.instructor,
        completionDate: cert.completionDate,
        issueDate: cert.issueDate,
        grade: cert.grade,
        finalScore: cert.finalScore,
        pdfUrl: cert.pdfUrl,
        verificationUrl: cert.verificationUrl,
        skills: cert.skills,
        course: cert.course,
      }))
    } catch (error) {
      console.error("Get user certificates error:", error)
      throw new Error("Failed to fetch user certificates")
    }
  }

  async verifyCertificate(certificateId) {
    try {
      const certificate = await Certificate.findOne({
        certificateId,
        isValid: true,
      }).populate("user", "name email")

      if (!certificate) {
        console.log("Verification failed for ID:", certificateId)
        return null
      }

      // Update verification count and last verified date
      certificate.metadata.verificationCount = (certificate.metadata.verificationCount || 0) + 1
      certificate.metadata.lastVerifiedAt = new Date()
      await certificate.save()

      return certificate
    } catch (error) {
      console.error("Certificate verification error:", error)
      throw new Error("Failed to verify certificate")
    }
  }

  async revokeCertificate(certificateId, reason) {
    try {
      const certificate = await Certificate.findOne({ certificateId })

      if (!certificate) {
        throw new Error("Certificate not found")
      }

      certificate.isValid = false
      certificate.metadata.revokedAt = new Date()
      certificate.metadata.revokeReason = reason

      await certificate.save()

      return certificate
    } catch (error) {
      console.error("Certificate revocation error:", error)
      throw new Error("Failed to revoke certificate")
    }
  }

  async getCertificateStats() {
    try {
      const stats = {
        total: await Certificate.countDocuments(),
        valid: await Certificate.countDocuments({ isValid: true }),
        revoked: await Certificate.countDocuments({ isValid: false }),
        thisMonth: await Certificate.countDocuments({
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        }),
      }

      return stats
    } catch (error) {
      console.error("Certificate stats error:", error)
      throw new Error("Failed to get certificate statistics")
    }
  }
}

module.exports = new CertificateService()
