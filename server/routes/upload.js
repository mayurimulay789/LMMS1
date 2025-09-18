const express = require("express")
const { uploadImage, uploadVideo, uploadDocument } = require("../config/cloudinary")
const auth = require("../middleware/auth")
const adminMiddleware = require("../middleware/AdminMiddleware")
const instructorMiddleware = require("../middleware/instructorMiddleware")

const router = express.Router()

// Upload course thumbnail
router.post("/course-thumbnail", auth, instructorMiddleware, uploadImage.single("thumbnail"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    res.json({
      success: true,
      message: "Thumbnail uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload thumbnail" })
  }
})

// Upload lesson video
router.post("/lesson-video", auth, instructorMiddleware, uploadVideo.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    res.json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        duration: req.file.duration || null,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload video" })
  }
})

// Upload course materials
router.post("/course-material", auth, instructorMiddleware, uploadDocument.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    res.json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload document" })
  }
})

// Upload user avatar
router.post("/avatar", auth, uploadImage.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    // Update user avatar in database
    const User = require("../models/User")
    await User.findByIdAndUpdate(req.user.id, {
      avatar: req.file.path,
    })

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload avatar" })
  }
})

// Upload chat files
router.post("/chat-file", auth, uploadDocument.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload file" })
  }
})

// Multiple file upload for course gallery
router.post("/course-gallery", auth, instructorMiddleware, uploadImage.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" })
    }

    const uploadedFiles = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
    }))

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: uploadedFiles,
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload files" })
  }
})

module.exports = router
