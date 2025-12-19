const express = require("express");
const multer = require("multer");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const auth = require("../middleware/auth");
const adminMiddleware = require("../middleware/AdminMiddleware");
const instructorMiddleware = require("../middleware/instructorMiddleware");
const { validateUrl, getYouTubeInfo } = require("../utils/urlValidator");

const router = express.Router();

// Configure multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB max for large videos
  },
  fileFilter: (req, file, cb) => {
    console.log('Processing file:', {
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    });
    
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      console.log('File type rejected:', file.mimetype);
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Enhanced error handling middleware
const handleUploadError = (error, req, res, next) => {
  console.error('Upload error handler:', {
    message: error.message,
    code: error.code,
    name: error.name
  });

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File too large', 
        message: 'File size exceeds the 150MB limit. Please use a smaller file or compress your video.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false,
        error: 'Unexpected file field', 
        message: 'Please check the file field name' 
      });
    }
  }

  if (error.message.includes('Only image')) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid file type', 
      message: error.message 
    });
  }

  res.status(500).json({ 
    success: false,
    error: 'Upload failed', 
    message: error.message || 'Something went wrong during file upload' 
  });
};

// Upload course media (thumbnail/image) to Cloudinary
// router.post("/course-media", auth, instructorMiddleware, upload.single("thumbnail"), async (req, res, next) => {
//   try {
//     console.log('=== UPLOAD COURSE MEDIA TO CLOUDINARY START / course-media ===');
    
//     if (!req.file) {
//       console.log('No file received in request');
//       return res.status(400).json({ 
//         success: false,
//         error: "No file uploaded", 
//         message: "Please select a file to upload" 
//       });
//     }

//     console.log('File received for Cloudinary upload:', {
//       name: req.file.originalname,
//       type: req.file.mimetype,
//       size: (req.file.size / (1024 * 1024)).toFixed(2) + 'MB'
//     });

//     // Upload to Cloudinary
//     const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
//     const folder = `lms/course/${fileType}s`;
    
//     const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, folder);

//     console.log('File uploaded to Cloudinary successfully:', {
//       cloudinaryUrl: cloudinaryUrl,
//       folder: folder,
//       type: fileType
//     });

//     res.json({
//       success: true,
//       message: "File uploaded to Cloudinary successfully",
//       data: {
//         url: cloudinaryUrl,
//         publicId: req.file.originalname,
//         originalName: req.file.originalname,
//         size: req.file.size,
//         type: fileType,
//         resourceType: fileType,
//         storage: 'cloudinary',
//         isLargeFile: req.file.size > 50 * 1024 * 1024
//       },
//     });

//     console.log('=== UPLOAD COURSE MEDIA END ===');
//   } catch (error) {
//     console.error("Cloudinary upload error:", error);
//     next(error);
//   }
// });

// In the course-media route, add debugging:

router.post("/course-media", auth, instructorMiddleware, upload.single("thumbnail"), async (req, res, next) => {
  try {
    console.log('=== UPLOAD COURSE MEDIA TO CLOUDINARY START ===');
    
    // Debug: Check what's in the request
    console.log('📥 Request received');
    console.log('📋 Content-Type header:', req.headers['content-type']);
    console.log('📋 Content-Length header:', req.headers['content-length']);
    console.log('📋 Request method:', req.method);
    
    // Check if multer processed the file
    console.log('📎 Multer file object:', req.file);
    console.log('📎 Multer files object:', req.files);
    console.log('📎 Request body keys:', Object.keys(req.body));
    
    if (!req.file) {
      console.log('❌ No file found by multer');
      console.log('ℹ️ Request headers:', JSON.stringify(req.headers, null, 2));
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded", 
        message: "Please select a file to upload. Multer did not receive any file."
      });
    }

    console.log('✅ File received:', {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: (req.file.size / (1024 * 1024)).toFixed(2) + 'MB',
      bufferLength: req.file.buffer ? req.file.buffer.length : 'No buffer'
    });

    // Upload to Cloudinary
    const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    const folder = `lms/course/${fileType}s`;
    
    console.log('☁️ Uploading to Cloudinary folder:', folder);
    
    const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, folder);

    console.log('✅ File uploaded to Cloudinary:', cloudinaryUrl);

    res.json({
      success: true,
      message: "File uploaded to Cloudinary successfully",
      data: {
        url: cloudinaryUrl,
        publicId: req.file.originalname,
        originalName: req.file.originalname,
        size: req.file.size,
        type: fileType,
        resourceType: fileType,
        storage: 'cloudinary',
        isLargeFile: req.file.size > 50 * 1024 * 1024
      },
    });

    console.log('=== UPLOAD COURSE MEDIA END ===');
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    console.error("❌ Error stack:", error.stack);
    next(error);
  }
});

// Upload lesson video to Cloudinary
router.post("/lesson-video", auth, instructorMiddleware, upload.single("video"), async (req, res, next) => {
  try {
    console.log('=== UPLOAD LESSON VIDEO TO CLOUDINARY START ===');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded", 
        message: "Please select a video file to upload" 
      });
    }

    console.log('Lesson video received for Cloudinary upload:', {
      name: req.file.originalname,
      type: req.file.mimetype,
      size: (req.file.size / (1024 * 1024)).toFixed(2) + 'MB'
    });

    // Upload video to Cloudinary in videos folder
    const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, 'lms/course/videos');

    console.log('Lesson video uploaded to Cloudinary:', {
      cloudinaryUrl: cloudinaryUrl,
      size: (req.file.size / (1024 * 1024)).toFixed(2) + 'MB'
    });

    res.json({
      success: true,
      message: "Video uploaded to Cloudinary successfully",
      data: {
        url: cloudinaryUrl,
        publicId: req.file.originalname,
        originalName: req.file.originalname,
        size: req.file.size,
        type: 'video',
        resourceType: 'video',
        storage: 'cloudinary',
        isLargeFile: req.file.size > 50 * 1024 * 1024
      },
    });

    console.log('=== UPLOAD LESSON VIDEO END ===');
  } catch (error) {
    console.error("Video upload error:", error);
    next(error);
  }
});

// Upload certificate PDF to Cloudinary (admin only)
router.post("/certificate", auth, adminMiddleware, upload.single("certificate"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded", 
        message: "Please select a PDF file to upload" 
      });
    }

    // Check if it's a PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ 
        success: false,
        error: "Invalid file type", 
        message: "Certificate must be a PDF file" 
      });
    }

    console.log('Certificate PDF received for Cloudinary upload:', {
      name: req.file.originalname,
      size: (req.file.size / 1024).toFixed(2) + 'KB'
    });

    // Upload PDF to Cloudinary in certificates folder
    const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, 'lms/certificates');

    res.json({
      success: true,
      message: "Certificate uploaded to Cloudinary successfully",
      data: {
        url: cloudinaryUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        type: 'pdf',
        resourceType: 'raw',
        storage: 'cloudinary'
      },
    });
  } catch (error) {
    console.error("Certificate upload error:", error);
    next(error);
  }
});

// Upload course preview (image or video) to Cloudinary
router.post("/course-preview", auth, instructorMiddleware, upload.single("coursePreview"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded", 
        message: "Please select an image or video file to upload" 
      });
    }

    // Check if it's image or video
    const isImage = req.file.mimetype.startsWith('image/');
    const isVideo = req.file.mimetype.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid file type", 
        message: "Course preview must be an image or video file" 
      });
    }

    console.log('Course preview received for Cloudinary upload:', {
      name: req.file.originalname,
      type: isImage ? 'image' : 'video',
      size: isVideo ? (req.file.size / (1024 * 1024)).toFixed(2) + 'MB' : (req.file.size / 1024).toFixed(2) + 'KB'
    });

    // Upload to appropriate folder
    const fileType = isImage ? 'image' : 'video';
    const folder = `lms/course/previews/${fileType}s`;
    
    const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, folder);

    res.json({
      success: true,
      message: "Course preview uploaded to Cloudinary successfully",
      data: {
        url: cloudinaryUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        type: fileType,
        resourceType: fileType,
        storage: 'cloudinary'
      },
    });
  } catch (error) {
    console.error("Course preview upload error:", error);
    next(error);
  }
});

// Delete file from Cloudinary
router.delete("/delete", auth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: "URL required", 
        message: "Please provide the file URL to delete" 
      });
    }

    // Check if it's a Cloudinary URL
    if (!url.includes('cloudinary.com')) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid URL", 
        message: "Only Cloudinary URLs can be deleted via this endpoint" 
      });
    }

    const result = await deleteFromCloudinary(url);

    res.json({
      success: true,
      message: "File deleted from Cloudinary successfully",
      data: result
    });
  } catch (error) {
    console.error("Delete from Cloudinary error:", error);
    res.status(500).json({ 
      success: false,
      error: "Delete failed", 
      message: error.message || "Failed to delete file from Cloudinary" 
    });
  }
});

// Quick upload status check
router.get("/upload-status", auth, (req, res) => {
  res.json({
    success: true,
    data: {
      maxFileSize: "150MB",
      allowedTypes: ["images", "videos", "pdfs (certificates only)"],
      storageProvider: "Cloudinary",
      status: "Ready"
    }
  });
});

// Validate external URL for thumbnails
router.post("/validate-url", auth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: "URL is required", 
        message: "Please provide a URL to validate" 
      });
    }

    // Check if it's a YouTube URL
    const youtubeInfo = getYouTubeInfo(url);
    
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
      });
    }

    // Validate other URLs
    const validation = await validateUrl(url);
    
    res.json({
      success: validation.isValid,
      message: validation.isValid ? "URL validated successfully" : "URL validation failed",
      data: {
        ...validation,
        type: validation.isImage ? "image" : validation.isVideo ? "video" : "unknown"
      }
    });
  } catch (error) {
    console.error("URL validation error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to validate URL", 
      message: "URL validation service unavailable" 
    });
  }
});

// Test Cloudinary connection
router.get("/cloudinary-test", auth, (req, res) => {
  const isConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

  res.json({
    success: true,
    data: {
      cloudinaryConfigured: isConfigured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not set',
      maxFileSize: "150MB",
      folders: {
        courseImages: "lms/course/images",
        courseVideos: "lms/course/videos",
        certificates: "lms/certificates",
        coursePreviews: "lms/course/previews"
      }
    }
  });
});

// Use error handling middleware
router.use(handleUploadError);

module.exports = router;