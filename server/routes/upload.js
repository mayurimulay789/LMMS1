const express = require("express")
const { uploadImage, uploadVideo, uploadDocument, uploadThumbnail } = require("../config/cloudinary")
const auth = require("../middleware/auth")
const adminMiddleware = require("../middleware/AdminMiddleware")
const instructorMiddleware = require("../middleware/instructorMiddleware")
const { validateUrl, getYouTubeInfo } = require("../utils/urlValidator")

const router = express.Router()

// Upload course thumbnail (images only - legacy)
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

// Upload course thumbnail (supports both images and videos)
router.post("/course-media", auth, instructorMiddleware, uploadThumbnail.single("thumbnail"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    // Get video duration if it's a video file
    let durationInMinutes = 0
    let durationInSeconds = 0

    if (req.file.mimetype.startsWith('video/')) {
      try {
        const { getVideoDuration, convertSecondsToMinutes } = require("../utils/videoUtils")
        durationInSeconds = await getVideoDuration(req.file.path)
        durationInMinutes = convertSecondsToMinutes(durationInSeconds)
      } catch (error) {
        console.error("Error getting video duration:", error)
        // Continue without duration rather than failing the upload
      }
    }

    res.json({
      success: true,
      message: "Thumbnail uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        ...(req.file.mimetype.startsWith('video/') && {
          duration: durationInMinutes,
          durationInSeconds: durationInSeconds,
        }),
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

    const { getVideoDuration, convertSecondsToMinutes } = require("../utils/videoUtils")

    // Get actual duration from Cloudinary
    let durationInMinutes = 0
    let durationInSeconds = 0

    try {
      durationInSeconds = await getVideoDuration(req.file.path)
      durationInMinutes = convertSecondsToMinutes(durationInSeconds)
    } catch (error) {
      console.error("Error getting video duration:", error)
      // Continue without duration rather than failing the upload
    }

    res.json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        duration: durationInMinutes, // Return duration in minutes
        durationInSeconds: durationInSeconds,
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

// Upload instructor image
router.post("/instructor-image", auth, instructorMiddleware, uploadImage.single("instructorImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    // Update course with instructor image if courseId is provided
    if (req.body.courseId) {
      const Course = require("../models/Course")
      await Course.findByIdAndUpdate(req.body.courseId, {
        instructorImage: req.file.path,
        instructorImagePublicId: req.file.filename,
      })
    }

    res.json({
      success: true,
      message: "Instructor image uploaded successfully",
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Failed to upload instructor image" })
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

// Validate external URL for thumbnails
router.post("/validate-url", auth, async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: "URL is required" })
    }

    // Check if it's a YouTube URL
    const youtubeInfo = getYouTubeInfo(url)
    
    if (youtubeInfo.isYouTube) {
      return res.json({
        success: true,
        message: "YouTube URL validated successfully",
        data: {
          url: url,
          isValid: true,
          type: "youtube",
          ...youtubeInfo
        }
      })
    }

    // Validate other URLs
    const validation = await validateUrl(url)
    
    res.json({
      success: validation.isValid,
      message: validation.isValid ? "URL validated successfully" : "URL validation failed",
      data: {
        ...validation,
        type: validation.isImage ? "image" : validation.isVideo ? "video" : "unknown"
      }
    })
  } catch (error) {
    console.error("URL validation error:", error)
    res.status(500).json({ error: "Failed to validate URL" })
  }
})

module.exports = router
