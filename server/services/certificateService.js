const PDFDocument = require("pdfkit")
const QRCode = require("qrcode")
const { v4: uuidv4 } = require("uuid")
const { uploadToCloudinary } = require("../utils/cloudinary")
const Certificate = require("../models/Certificate")
const path = require("path")
const fs = require("fs")

class CertificateService {
  constructor() {
    this.fontsRegistered = false
    this.template = null
    this.logoPath = path.join(__dirname, "../assets/logo.png")
    this.footerLogoPath = path.join(__dirname, "../assets/footerlogo.png")
  }

  /**
   * Initialize and register custom fonts if available
   * @param {PDFDocument} doc - PDFKit document instance
   */
  registerFonts(doc) {
    try {
      // Check if custom font files exist in the project
      const fontPaths = {
        signature: path.join(__dirname, "../fonts/signature.ttf"),
        cursive: path.join(__dirname, "../fonts/cursive.ttf"),
        times: path.join(__dirname, "../fonts/times.ttf"),
      }

      // Register signature font if file exists
      if (fs.existsSync(fontPaths.signature)) {
        doc.registerFont('Signature', fontPaths.signature)
        console.log("✅ Signature font registered successfully")
      } else {
        console.log("⚠️ Signature font file not found, using system fonts")
      }

      // Register cursive font if file exists
      if (fs.existsSync(fontPaths.cursive)) {
        doc.registerFont('Cursive', fontPaths.cursive)
        console.log("✅ Cursive font registered successfully")
      }

      this.fontsRegistered = true
    } catch (error) {
      console.error("Font registration error:", error.message)
      this.fontsRegistered = false
    }
  }

  /**
   * Check if logo exists in assets folder
   * @returns {boolean} Whether logo exists
   */
  logoExists() {
    return fs.existsSync(this.logoPath)
  }

  /**
   * Check if footer logo exists in assets folder
   * @returns {boolean} Whether footer logo exists
   */
  footerLogoExists() {
    return fs.existsSync(this.footerLogoPath)
  }

  /**
   * Generate a new certificate
   * @param {Object} data - Certificate data
   * @returns {Promise<Object>} Generated certificate
   */
  async generateCertificate(data) {
    try {
      // Validate required fields
      this.validateCertificateData(data)

      const {
        user,
        course,
        enrollment,
        studentName,
        courseName,
        instructor = "Raya Academy",
        completionDate = new Date(),
        finalScore = 85,
        hoursCompleted = 0,
        skills = [],
        metadata = {},
      } = data

      // Generate unique certificate ID
      const certificateId = this.generateCertificateId()
      const certificateNumber = this.generateCertificateNumber()
      
      // Create verification URL
      const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000"
      const verificationUrl = `${baseUrl}/verify-certificate/${certificateId}`

      // Generate QR code
      const qrCodeData = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 200,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })

      // Build PDF
      const pdfBuffer = await this.createCertificatePdfBuffer({
        studentName,
        courseName,
        instructor,
        completionDate,
        finalScore,
        hoursCompleted,
        skills,
        certificateId,
        certificateNumber,
        qrCodeData,
        verificationUrl,
      })

      // Upload to Cloudinary
      const cloudFolder = process.env.CLOUDINARY_CERT_FOLDER || "lms/certificates"
      const pdfUrl = await uploadToCloudinary(
        pdfBuffer, 
        cloudFolder, 
        "raw", 
        "application/pdf",
        { 
          public_id: `certificate_${certificateId}`,
          resource_type: "raw"
        }
      )

      // Create certificate record
      const certificate = new Certificate({
        certificateId,
        certificateNumber,
        user: user._id || user,
        course: course._id || course,
        enrollment: enrollment._id || enrollment,
        studentName,
        courseName,
        instructor,
        completionDate,
        issueDate: new Date(),
        finalScore,
        hoursCompleted,
        skills,
        pdfPath: pdfUrl,
        pdfUrl,
        verificationUrl,
        qrCodeData,
        isValid: true,
        metadata: {
          ...metadata,
          generatedAt: new Date(),
          fileSize: pdfBuffer.length,
          fileType: "application/pdf",
          version: "1.0.0",
        },
      })

      await certificate.save()
      
      console.log(`✅ Certificate generated successfully: ${certificateId}`)
      return certificate
    } catch (error) {
      console.error("❌ Certificate generation error:", error)
      throw new Error(`Failed to generate certificate: ${error.message}`)
    }
  }

  /**
   * Validate certificate generation data
   * @param {Object} data - Certificate data
   * @throws {Error} If required fields are missing
   */
  validateCertificateData(data) {
    const requiredFields = ['user', 'course', 'enrollment', 'studentName', 'courseName']
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    if (data.finalScore && (data.finalScore < 0 || data.finalScore > 100)) {
      throw new Error("Final score must be between 0 and 100")
    }

    if (data.hoursCompleted && data.hoursCompleted < 0) {
      throw new Error("Hours completed cannot be negative")
    }
  }

  /**
   * Generate unique certificate ID
   * @returns {string} Unique certificate ID
   */
  generateCertificateId() {
    const timestamp = Date.now()
    const unique = uuidv4().substring(0, 8).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `CERT-${timestamp}-${unique}-${random}`
  }

  /**
   * Generate certificate number
   * @returns {string} Certificate number
   */
  generateCertificateNumber() {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, "0")
    const day = String(new Date().getDate()).padStart(2, "0")
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `CERT-${year}${month}${day}-${random}`
  }

 
  async createCertificatePdfBuffer(content) {
    return new Promise(async (resolve, reject) => {
      try {
        // Create PDF document with custom settings
        const doc = new PDFDocument({
          size: "A4",
          layout: "landscape",
          margins: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40,
          },
          info: {
            Title: `Certificate - ${content.studentName}`,
            Author: "Raya Academy",
            Subject: "Course Completion Certificate",
            Keywords: "certificate, course completion, raya academy",
            CreationDate: new Date(),
          },
          bufferPages: true,
        })

        // Register custom fonts
        this.registerFonts(doc)

        // Collect PDF chunks
        const chunks = []
        doc.on("data", (chunk) => chunks.push(chunk))
        doc.on("end", () => resolve(Buffer.concat(chunks)))
        doc.on("error", (err) => reject(err))

        // Add certificate content
        await this.addCertificateContent(doc, content)

        // Finalize PDF
        doc.end()
      } catch (err) {
        reject(err)
      }
    })
  }

   /**
   * Add content to certificate PDF
   * @param {PDFDocument} doc - PDFKit document
   * @param {Object} data - Certificate data
   */
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
    certificateNumber,
    qrCodeData,
    verificationUrl,
  } = data

  const pageWidth = doc.page.width
  const pageHeight = doc.page.height

  const colors = {
    gold: "#d4af37",
    darkGold: "#b8860b",
    lightGold: "#f5e6b3",
    cream: "#fff9e6",
    darkBrown: "#2c1810",
    darkBlue: "#1e3a5f",
    crimson: "#9b1b30",
    gray: "#6b7280",
  }

  /* ================= BACKGROUND ================= */

  doc.rect(0, 0, pageWidth, pageHeight).fill(colors.cream)

  for (let i = 0; i < pageWidth; i += 20) {
    doc.moveTo(i, 0).lineTo(i + 10, pageHeight).lineWidth(0.2).stroke(colors.lightGold)
  }

  /* ================= BORDER ================= */

  const borderX = 30
  const borderY = 30
  const borderW = pageWidth - 60
  const borderH = pageHeight - 60

  doc.rect(borderX, borderY, borderW, borderH).lineWidth(12).stroke(colors.gold)

  doc.rect(borderX + 6, borderY + 6, borderW - 12, borderH - 12)
    .lineWidth(2)
    .stroke(colors.darkGold)

  doc.rect(borderX + 12, borderY + 12, borderW - 24, borderH - 24)
    .lineWidth(1)
    .stroke(colors.crimson)

  /* ================= LOGO WITH DESIGN ================= */

  const logoX = 100
  const logoY = 70
  const logoWidth = 90
  const centerX = logoX + logoWidth/2
  const centerY = logoY + logoWidth/2

  // Add decorative circles around logo
  doc
    .circle(centerX, centerY, logoWidth/2 + 8)
    .lineWidth(2)
    .stroke(colors.gold)

  doc
    .circle(centerX, centerY, logoWidth/2 + 4)
    .lineWidth(1.5)
    .stroke(colors.crimson)

  // Add small decorative dots around the circle
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8
    const dotX = centerX + Math.cos(angle) * (logoWidth/2 + 15)
    const dotY = centerY + Math.sin(angle) * (logoWidth/2 + 15)
    
    doc
      .circle(dotX, dotY, 2)
      .fill(colors.gold)
  }

  if (this.logoExists()) {
    doc.image(this.logoPath, logoX, logoY, {
      width: logoWidth,
      height: logoWidth,
    })
  }

  /* ================= TITLE ================= */

  doc.font("Times-Bold").fontSize(52).fillColor(colors.darkBrown)
    .text("CERTIFICATE", 0, 70, { align: "center" })

  doc.font("Times-Italic").fontSize(24).fillColor(colors.crimson)
    .text("of Completion", 0, 130, { align: "center" })

  // doc.moveTo(pageWidth / 2 - 150, 165)
  //   .lineTo(pageWidth / 2 + 150, 165)
  //   .lineWidth(2)
  //   .stroke(colors.gold)

  /* ================= STUDENT ================= */

  doc.font("Times-Roman").fontSize(14).fillColor(colors.gray)
    .text("This is to certify that", 0, 185, { align: "center" })

  doc.font("Helvetica-Bold").fontSize(35).fillColor(colors.darkBrown)
    .text(studentName.toUpperCase(), 0, 215, { align: "center" })

  doc.moveTo(pageWidth / 2 - 200, 270)
    .lineTo(pageWidth / 2 + 200, 270)
    .lineWidth(1.5)
    .stroke(colors.gold)

  doc.font("Times-Roman").fontSize(14).fillColor(colors.gray)
    .text("has successfully completed the course", 0, 290, { align: "center" })

  doc.font("Helvetica-Bold").fontSize(28).fillColor(colors.darkBlue)
    .text(courseName, 0, 320, { align: "center" })

  doc.font("Helvetica-Bold").fontSize(13).fillColor(colors.darkBrown)
    .text(
      new Date(completionDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      0,
      360,
      { align: "center" }
    )

  /* ================= QR CODE (MOVED UP) ================= */

  const qrY = pageHeight - 220

  if (qrCodeData) {
    const qrImage = qrCodeData.split(",")[1]
    const qrBuffer = Buffer.from(qrImage, "base64")

    doc.image(qrBuffer, 60, qrY, {
      width: 70,
      height: 70,
    })

    doc.font("Times-Roman").fontSize(8).fillColor(colors.darkBlue)
      .text("Scan to verify", 60, qrY + 75, {
        width: 70,
        align: "center",
      })
  }

  /* ================= SIGNATURE WITH FOOTER LOGO ================= */

  const signatureX = pageWidth - 210
  const signatureY = pageHeight - 230

  // Replace with footer logo
  if (this.footerLogoExists()) {
    doc.image(this.footerLogoPath, signatureX, signatureY, {
      width: 90,
      height: 80,
    })
  }

  doc.moveTo(signatureX - 15, signatureY + 65)
    .lineTo(signatureX + 130, signatureY + 65)
    .lineWidth(1.2)
    .stroke(colors.gray)

  doc.font("Times-Roman").fontSize(10).fillColor(colors.gray)
    .text("Authorized Signatory", signatureX + 10, signatureY + 75)

  doc.fontSize(9)
    .text(`Issued: ${new Date().toLocaleDateString()}`, signatureX + 20, signatureY + 95)

  /* ================= METADATA (NOW FITS) ================= */

  const metadataY = pageHeight - 80

  doc.font("Times-Roman").fontSize(7).fillColor(colors.gray)
    .text(`Certificate ID: ${certificateId}`, 60, metadataY)

  doc.text(`Certificate No: ${certificateNumber || certificateId}`, 60, metadataY - 12)

  doc.text(`Verify at: ${verificationUrl}`, 60, metadataY - 24)

  /* ================= FOOTER ================= */

  // doc.font("Times-Roman").fontSize(8).fillColor(colors.gray)
  //   .text(
  //     "© Raya Academy - Empowering Excellence in Education",
  //     pageWidth / 2 - 150,
  //     pageHeight - 40,
  //     { width: 300, align: "center" }
  //   )

  /* ================= WATERMARK ================= */

  doc.save()

  doc.fontSize(60)
    .fillColor(colors.lightGold)
    .opacity(0.1)
    .rotate(-45, { origin: [pageWidth / 2, pageHeight / 2] })
    .text("RAYA ACADEMY", pageWidth / 2 - 200, pageHeight / 2, {
      width: 400,
      align: "center",
    })

  doc.restore()
}

  addTextLogoFallback(doc, x, y, colors) {
    const logoRadius = 35
    const centerX = x + 35
    const centerY = y + 35

    // Outer crimson circle with gold border
    doc
      .circle(centerX, centerY, logoRadius)
      .lineWidth(3)
      .stroke(colors.crimson)

    doc
      .circle(centerX, centerY, logoRadius - 3)
      .lineWidth(2)
      .stroke(colors.gold)

    // Inner decorative circle
    doc
      .circle(centerX, centerY, logoRadius - 6)
      .lineWidth(1.5)
      .stroke(colors.darkGold)

    // Background
    doc
      .circle(centerX, centerY, logoRadius - 8)
      .fill(colors.cream)

    // Decorative star pattern around logo
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      const starX = centerX + Math.cos(angle) * (logoRadius - 10)
      const starY = centerY + Math.sin(angle) * (logoRadius - 10)
      
      doc
        .circle(starX, starY, 2)
        .fill(colors.gold)
    }

    // Logo text - RY monogram
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor(colors.crimson)
      .text("R", centerX - 12, centerY - 12, { width: 12, align: "right" })
      .text("Y", centerX, centerY - 12, { width: 12, align: "left" })

    // RAYA text
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(colors.darkBrown)
      .text("RAYA", centerX - 15, centerY + 2, { width: 30, align: "center" })

    // ACADEMY text
    doc
      .fontSize(6)
      .fillColor(colors.gold)
      .text("ACADEMY", centerX - 15, centerY + 12, { width: 30, align: "center" })
  }

  /**
   * Regenerate certificate asset
   * @param {Object} certificate - Certificate document
   * @returns {Promise<string>} New PDF URL
   */
  async regenerateCertificateAsset(certificate) {
    try {
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
        certificateNumber: certificate.certificateNumber,
        qrCodeData,
        verificationUrl,
      })

      const cloudFolder = process.env.CLOUDINARY_CERT_FOLDER || "lms/certificates"
      const pdfUrl = await uploadToCloudinary(
        pdfBuffer, 
        cloudFolder, 
        "raw", 
        "application/pdf",
        { 
          public_id: `certificate_${certificate.certificateId}_regenerated`,
          resource_type: "raw"
        }
      )

      certificate.pdfUrl = pdfUrl
      certificate.pdfPath = pdfUrl
      certificate.metadata = {
        ...certificate.metadata,
        regeneratedAt: new Date(),
        regeneratedFileSize: pdfBuffer.length,
        regenerationCount: (certificate.metadata.regenerationCount || 0) + 1,
      }

      await certificate.save()

      console.log(`✅ Certificate regenerated successfully: ${certificate.certificateId}`)
      return pdfUrl
    } catch (error) {
      console.error("❌ Certificate regeneration error:", error)
      throw new Error(`Failed to regenerate certificate: ${error.message}`)
    }
  }

  /**
   * Get user certificates
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User certificates
   */
  async getUserCertificates(userId) {
    try {
      const certificates = await Certificate.find({
        user: userId,
        isValid: true,
      })
        .populate("course", "title instructor category thumbnail")
        .sort({ createdAt: -1 })

      return certificates.map((cert) => {
        const isCloudinary = cert.pdfUrl && cert.pdfUrl.includes("res.cloudinary.com")
        const isRaw = isCloudinary && cert.pdfUrl.includes("/raw/upload/")
        const apiProxyUrl = `${process.env.BACKEND_URL || "http://localhost:2000"}/api/certificates/pdf/${cert.certificateId}`

        // If the stored URL is a Cloudinary image upload, force the proxy
        const resolvedPdfUrl = isCloudinary && !isRaw ? apiProxyUrl : isRaw ? cert.pdfUrl : apiProxyUrl

        return {
          id: cert._id,
          certificateId: cert.certificateId,
          certificateNumber: cert.certificateNumber,
          studentName: cert.studentName,
          courseName: cert.courseName,
          instructor: cert.instructor,
          completionDate: cert.completionDate,
          issueDate: cert.issueDate,
          finalScore: cert.finalScore,
          hoursCompleted: cert.hoursCompleted,
          skills: cert.skills,
          pdfUrl: resolvedPdfUrl,
          verificationUrl: cert.verificationUrl,
          isValid: cert.isValid,
          metadata: cert.metadata,
          course: cert.course,
          createdAt: cert.createdAt,
        }
      })
    } catch (error) {
      console.error("❌ Get user certificates error:", error)
      throw new Error("Failed to fetch user certificates")
    }
  }

  /**
   * Verify certificate
   * @param {string} certificateId - Certificate ID
   * @returns {Promise<Object>} Verified certificate
   */
  async verifyCertificate(certificateId) {
    try {
      const certificate = await Certificate.findOne({
        certificateId,
        isValid: true,
      }).populate("user", "name email")

      if (!certificate) {
        console.log("❌ Verification failed for ID:", certificateId)
        return null
      }

      // Update verification metadata
      certificate.metadata.verificationCount = (certificate.metadata.verificationCount || 0) + 1
      certificate.metadata.lastVerifiedAt = new Date()
      certificate.metadata.lastVerifiedIp = null // Would need IP from request
      
      await certificate.save()

      console.log(`✅ Certificate verified successfully: ${certificateId}`)
      
      return {
        id: certificate._id,
        certificateId: certificate.certificateId,
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        instructor: certificate.instructor,
        completionDate: certificate.completionDate,
        issueDate: certificate.issueDate,
        finalScore: certificate.finalScore,
        isValid: certificate.isValid,
        user: certificate.user ? {
          name: certificate.user.name,
          email: certificate.user.email,
        } : null,
        verificationCount: certificate.metadata.verificationCount,
        lastVerifiedAt: certificate.metadata.lastVerifiedAt,
      }
    } catch (error) {
      console.error("❌ Certificate verification error:", error)
      throw new Error("Failed to verify certificate")
    }
  }

  /**
   * Revoke certificate
   * @param {string} certificateId - Certificate ID
   * @param {string} reason - Revocation reason
   * @returns {Promise<Object>} Revoked certificate
   */
  async revokeCertificate(certificateId, reason) {
    try {
      const certificate = await Certificate.findOne({ certificateId })

      if (!certificate) {
        throw new Error("Certificate not found")
      }

      certificate.isValid = false
      certificate.metadata.revokedAt = new Date()
      certificate.metadata.revokeReason = reason
      certificate.metadata.revokedBy = null // Would need admin user ID

      await certificate.save()

      console.log(`✅ Certificate revoked successfully: ${certificateId}`)
      return certificate
    } catch (error) {
      console.error("❌ Certificate revocation error:", error)
      throw new Error("Failed to revoke certificate")
    }
  }

  /**
   * Get certificate statistics
   * @returns {Promise<Object>} Certificate statistics
   */
  async getCertificateStats() {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfYear = new Date(now.getFullYear(), 0, 1)

      const [
        total,
        valid,
        revoked,
        issuedThisMonth,
        issuedThisYear,
        avgScore,
        totalHours,
      ] = await Promise.all([
        Certificate.countDocuments(),
        Certificate.countDocuments({ isValid: true }),
        Certificate.countDocuments({ isValid: false }),
        Certificate.countDocuments({
          createdAt: { $gte: startOfMonth },
        }),
        Certificate.countDocuments({
          createdAt: { $gte: startOfYear },
        }),
        Certificate.aggregate([
          { $match: { finalScore: { $exists: true, $ne: null } } },
          { $group: { _id: null, avg: { $avg: "$finalScore" } } },
        ]),
        Certificate.aggregate([
          { $match: { hoursCompleted: { $exists: true, $ne: null } } },
          { $group: { _id: null, total: { $sum: "$hoursCompleted" } } },
        ]),
      ])

      const stats = {
        total,
        valid,
        revoked,
        issuedThisMonth,
        issuedThisYear,
        averageScore: avgScore.length > 0 ? Math.round(avgScore[0].avg * 10) / 10 : 0,
        totalHoursCompleted: totalHours.length > 0 ? Math.round(totalHours[0].total) : 0,
        validityRate: total > 0 ? Math.round((valid / total) * 100) : 0,
      }

      return stats
    } catch (error) {
      console.error("❌ Certificate stats error:", error)
      throw new Error("Failed to get certificate statistics")
    }
  }

  /**
   * Search certificates
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Matching certificates
   */
  async searchCertificates(filters = {}) {
    try {
      const {
        studentName,
        courseName,
        certificateId,
        fromDate,
        toDate,
        isValid,
        limit = 50,
        skip = 0,
      } = filters

      const query = {}

      if (studentName) {
        query.studentName = { $regex: studentName, $options: "i" }
      }

      if (courseName) {
        query.courseName = { $regex: courseName, $options: "i" }
      }

      if (certificateId) {
        query.certificateId = certificateId
      }

      if (fromDate || toDate) {
        query.completionDate = {}
        if (fromDate) query.completionDate.$gte = new Date(fromDate)
        if (toDate) query.completionDate.$lte = new Date(toDate)
      }

      if (isValid !== undefined) {
        query.isValid = isValid === "true" || isValid === true
      }

      const certificates = await Certificate.find(query)
        .populate("user", "name email")
        .populate("course", "title")
        .sort({ completionDate: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))

      const total = await Certificate.countDocuments(query)

      return {
        certificates: certificates.map(cert => ({
          id: cert._id,
          certificateId: cert.certificateId,
          certificateNumber: cert.certificateNumber,
          studentName: cert.studentName,
          courseName: cert.courseName,
          completionDate: cert.completionDate,
          isValid: cert.isValid,
          user: cert.user,
        })),
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      }
    } catch (error) {
      console.error("❌ Certificate search error:", error)
      throw new Error("Failed to search certificates")
    }
  }

  /**
   * Get certificate by ID
   * @param {string} certificateId - Certificate ID
   * @returns {Promise<Object>} Certificate
   */
  async getCertificateById(certificateId) {
    try {
      const certificate = await Certificate.findOne({ certificateId })
        .populate("user", "name email")
        .populate("course", "title instructor category")

      if (!certificate) {
        return null
      }

      return certificate
    } catch (error) {
      console.error("❌ Get certificate error:", error)
      throw new Error("Failed to get certificate")
    }
  }

  /**
   * Delete certificate (admin only)
   * @param {string} certificateId - Certificate ID
   * @returns {Promise<boolean>} Deletion success
   */
  async deleteCertificate(certificateId) {
    try {
      const result = await Certificate.deleteOne({ certificateId })
      return result.deletedCount > 0
    } catch (error) {
      console.error("❌ Certificate deletion error:", error)
      throw new Error("Failed to delete certificate")
    }
  }

  /**
   * Bulk generate certificates
   * @param {Array} certificatesData - Array of certificate data
   * @returns {Promise<Array>} Generated certificates
   */
  async bulkGenerateCertificates(certificatesData) {
    try {
      const results = []
      const errors = []

      for (const data of certificatesData) {
        try {
          const certificate = await this.generateCertificate(data)
          results.push(certificate)
        } catch (error) {
          errors.push({
            data,
            error: error.message,
          })
        }
      }

      return {
        successful: results,
        failed: errors,
        totalSuccess: results.length,
        totalFailed: errors.length,
      }
    } catch (error) {
      console.error("❌ Bulk certificate generation error:", error)
      throw new Error("Failed to bulk generate certificates")
    }
  }
}

module.exports = new CertificateService()