// import PDFDocument from "pdfkit"
// import fs from "fs"
// import path from "path"
// import { fileURLToPath } from "url"
// import Enrollment from "../models/Enrollment.js"
// import Certificate from "../models/Certificate.js"

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// // Create certificate PDF
// const createCertificatePDF = async (certificateData) => {
//   return new Promise((resolve, reject) => {
//     try {
//       const doc = new PDFDocument({
//         layout: "landscape",
//         size: "A4",
//         margins: { top: 50, bottom: 50, left: 50, right: 50 },
//       })

//       const chunks = []
//       doc.on("data", (chunk) => chunks.push(chunk))
//       doc.on("end", () => resolve(Buffer.concat(chunks)))
//       doc.on("error", reject)

//       // Certificate dimensions
//       const pageWidth = doc.page.width
//       const pageHeight = doc.page.height
//       const centerX = pageWidth / 2
//       const centerY = pageHeight / 2

//       // Draw decorative border
//       doc
//         .rect(30, 30, pageWidth - 60, pageHeight - 60)
//         .lineWidth(8)
//         .strokeColor("#D4AF37") // Gold color
//         .stroke()

//       doc
//         .rect(40, 40, pageWidth - 80, pageHeight - 80)
//         .lineWidth(2)
//         .strokeColor("#D4AF37")
//         .stroke()

//       // Add background pattern (optional decorative elements)
//       doc.save()
//       doc.opacity(0.1)
//       for (let i = 0; i < 5; i++) {
//         doc
//           .circle(100 + i * 150, 100 + i * 50, 30)
//           .lineWidth(2)
//           .strokeColor("#D4AF37")
//           .stroke()
//       }
//       doc.restore()

//       // Header - Certificate Title
//       doc.fontSize(48).font("Helvetica-Bold").fillColor("#D4AF37").text("CERTIFICATE", 0, 100, { align: "center" })

//       doc.fontSize(24).font("Helvetica").fillColor("#666666").text("OF COMPLETION", 0, 160, { align: "center" })

//       // Decorative line
//       doc
//         .moveTo(centerX - 100, 200)
//         .lineTo(centerX + 100, 200)
//         .lineWidth(3)
//         .strokeColor("#D4AF37")
//         .stroke()

//       // Main content
//       doc
//         .fontSize(18)
//         .font("Helvetica")
//         .fillColor("#666666")
//         .text("This is to certify that", 0, 240, { align: "center" })

//       // Student name
//       doc
//         .fontSize(36)
//         .font("Helvetica-Bold")
//         .fillColor("#333333")
//         .text(certificateData.studentName, 0, 280, { align: "center" })

//       doc
//         .fontSize(18)
//         .font("Helvetica")
//         .fillColor("#666666")
//         .text("has successfully completed the course", 0, 340, { align: "center" })

//       // Course name
//       doc
//         .fontSize(28)
//         .font("Helvetica-Bold")
//         .fillColor("#D4AF37")
//         .text(certificateData.courseName, 0, 380, { align: "center" })

//       // Additional course info
//       if (certificateData.courseDuration) {
//         doc
//           .fontSize(14)
//           .font("Helvetica")
//           .fillColor("#666666")
//           .text(`Course Duration: {certificateData.courseDuration} hours`, 0, 430, { align: "center" })
//       }

//       if (certificateData.finalScore) {
//         doc
//           .fontSize(14)
//           .font("Helvetica")
//           .fillColor("#666666")
//           .text(`Final Score: ${certificateData.finalScore}%`, 0, 450, { align: "center" })
//       }

//       // Footer section
//       const footerY = pageHeight - 150

//       // Instructor signature
//       doc.fontSize(16).font("Helvetica-Bold").fillColor("#333333").text(certificateData.instructorName, 80, footerY)

//       doc
//         .moveTo(80, footerY - 10)
//         .lineTo(250, footerY - 10)
//         .lineWidth(1)
//         .strokeColor("#666666")
//         .stroke()

//       doc
//         .fontSize(12)
//         .font("Helvetica")
//         .fillColor("#666666")
//         .text("Course Instructor", 80, footerY + 20)

//       // Company logo/seal area (center)
//       doc
//         .circle(centerX, footerY - 20, 40)
//         .lineWidth(3)
//         .strokeColor("#D4AF37")
//         .stroke()

//       doc
//         .fontSize(16)
//         .font("Helvetica-Bold")
//         .fillColor("#D4AF37")
//         .text("LMS", centerX - 15, footerY - 25)

//       doc
//         .fontSize(10)
//         .font("Helvetica")
//         .fillColor("#666666")
//         .text("Learning Management System", centerX - 60, footerY + 30)

//       // Date and certificate info (right)
//       const completionDate = new Date(certificateData.completionDate).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })

//       doc
//         .fontSize(16)
//         .font("Helvetica-Bold")
//         .fillColor("#333333")
//         .text(completionDate, pageWidth - 250, footerY)

//       doc
//         .fontSize(12)
//         .font("Helvetica")
//         .fillColor("#666666")
//         .text("Date of Completion", pageWidth - 250, footerY + 20)

//       doc
//         .fontSize(10)
//         .font("Helvetica")
//         .fillColor("#999999")
//         .text(`Certificate ID: ${certificateData.certificateNumber}`, pageWidth - 250, footerY + 40)

//       // Verification URL
//       const verificationUrl = `${process.env.BASE_URL}/api/certificates/verify/${certificateData.certificateNumber}`
//       doc
//         .fontSize(8)
//         .font("Helvetica")
//         .fillColor("#999999")
//         .text(`Verify at: ${verificationUrl}`, 80, pageHeight - 40)

//       doc.end()
//     } catch (error) {
//       reject(error)
//     }
//   })
// }

// // Main certificate generation function
// export const generateCertificate = async (enrollmentId) => {
//   try {
//     // Get enrollment with populated data
//     const enrollment = await Enrollment.findById(enrollmentId)
//       .populate("user", "name email")
//       .populate({
//         path: "course",
//         select: "title duration",
//         populate: {
//           path: "instructor",
//           select: "name email profilePicture",
//         },
//       })

//     if (!enrollment) {
//       throw new Error("Enrollment not found")
//     }

//     if (enrollment.overallProgress < 100) {
//       throw new Error("Course not completed yet")
//     }

//     // Check if certificate already exists
//     const existingCertificate = await Certificate.findOne({
//       user: enrollment.user._id,
//       course: enrollment.course._id,
//     })

//     if (existingCertificate) {
//       return existingCertificate
//     }

//     // Create new certificate (certificateNumber will be auto-generated by pre-save hook)
//     const certificate = new Certificate({
//       user: enrollment.user._id,
//       course: enrollment.course._id,
//       enrollment: enrollment._id,
//       metadata: {
//         completionDate: enrollment.completedAt || new Date(),
//         finalScore: enrollment.finalScore || null,
//         courseDuration: enrollment.course.duration || null,
//         instructorName: enrollment.course.instructor.name,
//       },
//     })

//     // Save to generate certificate number
//     await certificate.save()

//     // Prepare certificate data for PDF generation
//     const certificateData = {
//       studentName: enrollment.user.name,
//       courseName: enrollment.course.title,
//       instructorName: enrollment.course.instructor.name,
//       completionDate: certificate.metadata.completionDate,
//       certificateNumber: certificate.certificateNumber,
//       courseDuration: certificate.metadata.courseDuration,
//       finalScore: certificate.metadata.finalScore,
//     }

//     // Generate PDF
//     const pdfBuffer = await createCertificatePDF(certificateData)

//     // Save certificate file
//     const certificatesDir = path.join(__dirname, "../uploads/certificates")
//     if (!fs.existsSync(certificatesDir)) {
//       fs.mkdirSync(certificatesDir, { recursive: true })
//     }

//     const fileName = `certificate-${certificate.certificateNumber}.pdf`
//     const filePath = path.join(certificatesDir, fileName)
//     fs.writeFileSync(filePath, pdfBuffer)

//     // Update certificate with file URLs
//     certificate.pdfUrl = `${process.env.BASE_URL}/uploads/certificates/${fileName}`
//     certificate.verificationUrl = `${process.env.BASE_URL}/api/certificates/verify/${certificate.certificateNumber}`
//     await certificate.save()

//     // Update enrollment
//     enrollment.certificateIssued = true
//     enrollment.certificateId = certificate._id
//     await enrollment.save()

//     return certificate
//   } catch (error) {
//     console.error("Certificate generation error:", error)
//     throw error
//   }
// }

// // Verify certificate
// export const verifyCertificate = async (certificateNumber) => {
//   try {
//     const certificate = await Certificate.findOne({
//       certificateNumber,
//     })
//       .populate("user", "name email")
//       .populate({
//         path: "course",
//         select: "title",
//         populate: {
//           path: "instructor",
//           select: "name",
//         },
//       })

//     if (!certificate) {
//       return null
//     }

//     return {
//       valid: true,
//       certificate: {
//         number: certificate.certificateNumber,
//         issuedTo: certificate.user.name,
//         email: certificate.user.email,
//         course: certificate.course.title,
//         issuedAt: certificate.issuedAt,
//         metadata: certificate.metadata,
//         verificationDate: new Date(),
//       },
//     }
//   } catch (error) {
//     console.error("Certificate verification error:", error)
//     throw error
//   }
// }

// // Get user certificates
// export const getUserCertificates = async (userId) => {
//   try {
//     const certificates = await Certificate.find({
//       user: userId,
//     })
//       .populate({
//         path: "course",
//         select: "title duration",
//         populate: {
//           path: "instructor",
//           select: "name email profilePicture",
//         },
//       })
//       .populate("user", "name email")
//       .sort({ issuedAt: -1 })

//     return certificates.map((cert) => ({
//       id: cert._id,
//       certificateNumber: cert.certificateNumber,
//       course: {
//         title: cert.course.title,
//         duration: cert.course.duration,
//         instructor: cert.course.instructor,
//       },
//       issuedAt: cert.issuedAt,
//       pdfUrl: cert.pdfUrl,
//       verificationUrl: cert.verificationUrl,
//       metadata: {
//         completionDate: cert.metadata.completionDate,
//         finalScore: cert.metadata.finalScore,
//       },
//     }))
//   } catch (error) {
//     console.error("Get user certificates error:", error)
//     throw error
//   }
// }

// // Download certificate
// export const downloadCertificate = async (certificateId, userId) => {
//   try {
//     const certificate = await Certificate.findOne({
//       _id: certificateId,
//       user: userId,
//     })
//       .populate("course", "title")
//       .populate("user", "name")

//     if (!certificate) {
//       throw new Error("Certificate not found")
//     }

//     if (!certificate.pdfUrl) {
//       throw new Error("Certificate PDF not available")
//     }

//     return {
//       certificate: {
//         certificateNumber: certificate.certificateNumber,
//         userName: certificate.user.name,
//         courseTitle: certificate.course.title,
//         issuedAt: certificate.issuedAt,
//         downloadUrl: certificate.pdfUrl,
//         verificationUrl: certificate.verificationUrl,
//       },
//     }
//   } catch (error) {
//     console.error("Download certificate error:", error)
//     throw error
//   }
// }

// export default {
//   generateCertificate,
//   verifyCertificate,
//   getUserCertificates,
//   downloadCertificate,
// }
