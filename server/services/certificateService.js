const PDFDocument = require("pdfkit")
const QRCode = require("qrcode")
const { v4: uuidv4 } = require("uuid")
const { uploadToCloudinary } = require("../utils/cloudinary")
const Certificate = require("../models/Certificate")

class CertificateService {
  constructor() {}

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
      const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-certificate/${certificateId}`

      // Generate QR code for verification
      const qrCodeData = await QRCode.toDataURL(verificationUrl)

      // Build PDF in-memory (no local file storage)
      const pdfBuffer = await this.createCertificatePdfBuffer({
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

      // Upload PDF to Cloudinary as a raw file (keeps it private to a single URL)
      const cloudFolder = process.env.CLOUDINARY_CERT_FOLDER || "lms/certificates"
      const pdfUrl = await uploadToCloudinary(pdfBuffer, cloudFolder, "raw", "application/pdf")

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
        pdfPath: pdfUrl,
        pdfUrl,
        verificationUrl,
        qrCodeData,
        metadata: {
          ...metadata,
          generatedAt: new Date(),
          fileSize: pdfBuffer.length,
        },
      })

      await certificate.save()

      return certificate
    } catch (error) {
      console.error("Certificate generation error:", error)
      throw new Error(`Failed to generate certificate: ${error.message}`)
    }
  }

  async createCertificatePdfBuffer(content) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          layout: "landscape",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        })

        const chunks = []
        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))
        doc.on("error", reject)

        await this.addCertificateContent(doc, content)
        doc.end()
      } catch (err) {
        reject(err)
      }
    })
  }

  // Regenerate a certificate PDF from an existing certificate record (used for migrations)
  async regenerateCertificateAsset(certificate) {
    const verificationUrl =
      certificate.verificationUrl ||
      `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-certificate/${certificate.certificateId}`

    const qrCodeData = await QRCode.toDataURL(verificationUrl)

    const pdfBuffer = await this.createCertificatePdfBuffer({
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      instructor: certificate.instructor,
      completionDate: certificate.completionDate,
      finalScore: certificate.finalScore,
      hoursCompleted: certificate.hoursCompleted,
      skills: certificate.skills,
      certificateId: certificate.certificateId,
      qrCodeData,
      verificationUrl,
    })

    const cloudFolder = process.env.CLOUDINARY_CERT_FOLDER || "lms/certificates"
    const pdfUrl = await uploadToCloudinary(pdfBuffer, cloudFolder, "raw", "application/pdf")

    certificate.pdfUrl = pdfUrl
    certificate.pdfPath = pdfUrl
    certificate.metadata = {
      ...certificate.metadata,
      regeneratedAt: new Date(),
      fileSize: pdfBuffer.length,
    }

    await certificate.save()

    return pdfUrl
  }

  // async addCertificateContent(doc, data) {
  //   const {
  //     studentName,
  //     courseName,
  //     instructor,
  //     completionDate,
  //     finalScore,
  //     hoursCompleted,
  //     skills,
  //     certificateId,
  //     qrCodeData,
  //     verificationUrl,
  //   } = data

  //   // Colors
  //   const primaryColor = "#1e40af"
  //   const secondaryColor = "#3b82f6"
  //   const goldColor = "#f59e0b"
  //   const textColor = "#1f2937"

  //   // Add background gradient
  //   doc.rect(0, 0, doc.page.width, doc.page.height).fillAndStroke("#f8fafc", "#e2e8f0")

  //   // Add decorative border
  //   doc
  //     .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
  //     .lineWidth(3)
  //     .stroke(primaryColor)

  //   doc
  //     .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
  //     .lineWidth(1)
  //     .stroke(secondaryColor)

  //   // Add header
  //   doc.fontSize(32).fillColor(primaryColor).font("Helvetica-Bold").text("CERTIFICATE OF COMPLETION", 0, 100, {
  //     align: "center",
  //     width: doc.page.width,
  //   })

  //   // Add decorative line
  //   doc
  //     .moveTo(200, 150)
  //     .lineTo(doc.page.width - 200, 150)
  //     .lineWidth(2)
  //     .stroke(goldColor)

  //   // Add "This is to certify that"
  //   doc.fontSize(16).fillColor(textColor).font("Helvetica").text("This is to certify that", 0, 180, {
  //     align: "center",
  //     width: doc.page.width,
  //   })

  //   // Add student name
  //   doc.fontSize(36).fillColor(primaryColor).font("Helvetica-Bold").text(studentName, 0, 220, {
  //     align: "center",
  //     width: doc.page.width,
  //   })

  //   // Add completion text
  //   doc.fontSize(16).fillColor(textColor).font("Helvetica").text("has successfully completed the course", 0, 280, {
  //     align: "center",
  //     width: doc.page.width,
  //   })

  //   // Add course name
  //   doc.fontSize(24).fillColor(secondaryColor).font("Helvetica-Bold").text(courseName, 0, 310, {
  //     align: "center",
  //     width: doc.page.width,
  //   })

  //   // Add instructor and completion details
  //   const detailsY = 360
  //   doc
  //     .fontSize(14)
  //     .fillColor(textColor)
  //     .font("Helvetica")
  //     .text(`Instructor: ${instructor}`, 100, detailsY)
  //     .text(`Completion Date: ${new Date(completionDate).toLocaleDateString()}`, 100, detailsY + 20)
  //     .text(`Final Score: ${finalScore}%`, 100, detailsY + 40)
  //     .text(`Hours Completed: ${hoursCompleted}`, 100, detailsY + 60)

  //   // Add skills if available
  //   if (skills && skills.length > 0) {
  //     doc
  //       .fontSize(12)
  //       .fillColor(textColor)
  //       .font("Helvetica-Bold")
  //       .text("Skills Acquired:", 100, detailsY + 90)

  //     skills.slice(0, 4).forEach((skill, index) => {
  //       doc
  //         .fontSize(11)
  //         .font("Helvetica")
  //         .text(`• ${skill}`, 120, detailsY + 110 + index * 15)
  //     })
  //   }

  //   // Add QR code
  //   if (qrCodeData) {
  //     const qrImage = qrCodeData.split(",")[1]
  //     const qrBuffer = Buffer.from(qrImage, "base64")
  //     doc.image(qrBuffer, doc.page.width - 150, detailsY, {
  //       width: 80,
  //       height: 80,
  //     })

  //     doc
  //       .fontSize(10)
  //       .fillColor(textColor)
  //       .text("Scan to verify", doc.page.width - 150, detailsY + 90, {
  //         width: 80,
  //         align: "center",
  //       })
  //   }

  //   // Add certificate ID
  //   doc
  //     .fontSize(10)
  //     .fillColor("#6b7280")
  //     .font("Helvetica")
  //     .text(`Certificate ID: ${certificateId}`, 100, doc.page.height - 100)

  //   // Add verification URL
  //   doc
  //     .fontSize(9)
  //     .fillColor("#6b7280")
  //     .text(`Verify at: ${verificationUrl}`, 100, doc.page.height - 80)

  //   // Add signature area
  //   doc
  //     .fontSize(12)
  //     .fillColor(textColor)
  //     .font("Helvetica-Bold")
  //     .text("LearnHub LMS", doc.page.width - 200, doc.page.height - 120)

  //   doc
  //     .moveTo(doc.page.width - 200, doc.page.height - 100)
  //     .lineTo(doc.page.width - 100, doc.page.height - 100)
  //     .stroke("#6b7280")

  //   doc
  //     .fontSize(10)
  //     .fillColor("#6b7280")
  //     .font("Helvetica")
  //     .text("Authorized Signature", doc.page.width - 200, doc.page.height - 90)

  //   // Add issue date
  //   doc
  //     .fontSize(10)
  //     .fillColor("#6b7280")
  //     .text(`Issued on: ${new Date().toLocaleDateString()}`, doc.page.width - 200, doc.page.height - 70)
  // }

  async  addCertificateContent(doc, data) {
  const {
    studentName,
    courseName,
    completionDate,
    certificateId,
    qrCodeData,
    verificationUrl,
  } = data

  const pageWidth = doc.page.width
  const pageHeight = doc.page.height

  /* ================= COLORS ================= */
  const primaryBlue = "#0f3c6e"
  const accentBlue = "#2563eb"
  const gold = "#c9b458"
  const darkText = "#111827"
  const mutedText = "#6b7280"
  const bgColor = "#fffdf7"

  /* ================= BACKGROUND ================= */
  doc.rect(0, 0, pageWidth, pageHeight).fill(bgColor)

  /* ================= RIGHT GOLD STRIP ================= */
  doc
    .rect(pageWidth - 70, 0, 70, pageHeight)
    .fill(gold)

  /* ================= TOP BRAND ================= */
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(primaryBlue)
    .text("RAYA Academy", 0, 50, {
      align: "center",
    })

  /* ================= TITLE ================= */
  doc
    .font("Helvetica-Bold")
    .fontSize(42)
    .fillColor(primaryBlue)
    .text("CERTIFICATE", 0, 130, {
      align: "center",
    })

  doc
    .font("Helvetica")
    .fontSize(18)
    .fillColor(primaryBlue)
    .text("OF COMPLETION", 0, 180, {
      align: "center",
    })

  /* ================= STUDENT NAME ================= */
  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor(darkText)
    .text(studentName, 0, 240, {
      align: "center",
    })

  // underline
  doc
    .moveTo(pageWidth / 2 - 200, 275)
    .lineTo(pageWidth / 2 + 200, 275)
    .lineWidth(1.5)
    .stroke(accentBlue)

  /* ================= COURSE DESCRIPTION ================= */
  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor(darkText)
    .text(
      `for successfully completing the course`,
      0,
      300,
      { align: "center" }
    )

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(accentBlue)
    .text(courseName, 0, 325, {
      align: "center",
    })


  /* ================= QR CODE ================= */
  if (qrCodeData) {
    const qrImage = qrCodeData.split(",")[1]
    const qrBuffer = Buffer.from(qrImage, "base64")

    doc.image(qrBuffer, pageWidth - 160, 380, {
      width: 90,
      height: 90,
    })

    doc
      .fontSize(9)
      .fillColor(mutedText)
      .text("Scan to verify", pageWidth - 160, 475, {
        width: 90,
        align: "center",
      })
  }

  /* ================= CERTIFICATE ID ================= */
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(mutedText)
    .text(`Certificate ID: ${certificateId}`, 60, pageHeight - 120)

  doc
    .fontSize(9)
    .text(`Verify at: ${verificationUrl}`, 60, pageHeight - 100)

  /* ================= SIGNATURE ================= */
  const signX = pageWidth - 300

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(darkText)
    .text("raya academy", signX, pageHeight - 160)

  doc
    .moveTo(signX, pageHeight - 140)
    .lineTo(signX + 150, pageHeight - 140)
    .stroke(mutedText)

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(mutedText)
    .text("Founder & Instructor", signX, pageHeight - 125)

  doc
    .fontSize(9)
    .text(
      `Issued on: ${new Date(completionDate).toLocaleDateString()}`,
      signX,
      pageHeight - 105
    )
}



  async getUserCertificates(userId) {
    try {
      const certificates = await Certificate.find({
        user: userId,
        isValid: true,
      })
        .populate("course", "title instructor category")
        .sort({ createdAt: -1 })

      return certificates.map((cert) => {
        const isCloudinary = cert.pdfUrl && cert.pdfUrl.includes("res.cloudinary.com")
        const isRaw = isCloudinary && cert.pdfUrl.includes("/raw/upload/")
        const apiProxyUrl = `${process.env.BACKEND_URL || "http://localhost:2000"}/api/certificates/pdf/${cert.certificateId}`

        // If the stored URL is a Cloudinary image upload, force the proxy so we can re-upload as raw.
        const resolvedPdfUrl = isCloudinary && !isRaw ? apiProxyUrl : isRaw ? cert.pdfUrl : apiProxyUrl

        return {
        id: cert._id,
        certificateId: cert.certificateId,
        certificateNumber: cert.certificateNumber,
        courseName: cert.courseName,
        instructor: cert.instructor,
        completionDate: cert.completionDate,
        issueDate: cert.issueDate,
        grade: cert.grade,
        finalScore: cert.finalScore,
        pdfUrl: resolvedPdfUrl,
        verificationUrl: cert.verificationUrl,
        skills: cert.skills,
        course: cert.course,
        }
      })
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
