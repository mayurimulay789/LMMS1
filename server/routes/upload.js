const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const auth = require("../middleware/auth")
const adminMiddleware = require("../middleware/AdminMiddleware")
const instructorMiddleware = require("../middleware/instructorMiddleware")
const { validateUrl, getYouTubeInfo } = require("../utils/urlValidator")

const router = express.Router()

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  }
  return uploadsDir;
};

// Optimized storage configuration for large files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a safe filename with timestamp and random string
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const safeName = `${timestamp}-${random}${extension}`;
    console.log('Saving file as:', safeName);
    cb(null, safeName);
  }
});

// Optimized multer configuration for large video files
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB max (slightly above 100MB for safety)
  },
  fileFilter: (req, file, cb) => {
    console.log('Processing file:', {
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    });
    
    // Allow images and videos with specific optimizations
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      // Additional validation for large files
      if (file.mimetype.startsWith('video/') && file.size > 100 * 1024 * 1024) {
        console.log('Large video file detected:', {
          size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
          type: file.mimetype
        });
      }
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

// Upload course thumbnail (optimized for large videos)
router.post("/course-media", auth, instructorMiddleware, upload.single("thumbnail"), async (req, res, next) => {
  try {
    console.log('=== UPLOAD COURSE MEDIA START ===');
    console.log('File upload initiated:', {
      hasFile: !!req.file,
      fileSize: req.file ? (req.file.size / (1024 * 1024)).toFixed(2) + 'MB' : 'No file',
      fileType: req.file ? req.file.mimetype : 'No file'
    });
    
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded", 
        message: "Please select a file to upload" 
      });
    }

    // Construct URL for the uploaded file
    const fileUrl = `/api/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: (req.file.size / (1024 * 1024)).toFixed(2) + 'MB',
      url: fullUrl
    });

    // For large video files, provide optimization tips
    let optimizationTip = '';
    if (req.file.mimetype.startsWith('video/') && req.file.size > 50 * 1024 * 1024) {
      optimizationTip = 'Large video uploaded successfully. Consider compressing future videos for faster loading.';
    }

    res.json({
      success: true,
      message: "File uploaded successfully" + (optimizationTip ? '. ' + optimizationTip : ''),
      data: {
        url: fullUrl,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
        resourceType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
        storage: 'local',
        isLargeFile: req.file.size > 50 * 1024 * 1024
      },
    });

    console.log('=== UPLOAD COURSE MEDIA END ===');
  } catch (error) {
    console.error("Upload processing error:", error);
    next(error);
  }
});

// Serve uploaded files statically with optimized settings
router.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d', // Cache for 1 day
  setHeaders: (res, path) => {
    // Set CORS headers for uploaded files
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Optimize caching for video files
    if (path.endsWith('.mp4') || path.endsWith('.mov') || path.endsWith('.avi')) {
      res.set('Cache-Control', 'public, max-age=86400'); // 24 hours for videos
    }
  }
}));

// Upload lesson video (separate endpoint for even larger files if needed)
router.post("/lesson-video", auth, instructorMiddleware, upload.single("video"), async (req, res, next) => {
  try {
    console.log('=== UPLOAD LESSON VIDEO START ===');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded", 
        message: "Please select a video file to upload" 
      });
    }

    const fileUrl = `/api/uploads/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    console.log('Lesson video uploaded:', {
      size: (req.file.size / (1024 * 1024)).toFixed(2) + 'MB',
      type: req.file.mimetype
    });

    res.json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: fullUrl,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        type: 'video',
        resourceType: 'video',
        storage: 'local',
        isLargeFile: req.file.size > 50 * 1024 * 1024
      },
    });

    console.log('=== UPLOAD LESSON VIDEO END ===');
  } catch (error) {
    console.error("Video upload error:", error);
    next(error);
  }
});

// Quick upload status check
router.get("/upload-status", auth, (req, res) => {
  res.json({
    success: true,
    data: {
      maxFileSize: "150MB",
      allowedTypes: ["images", "videos"],
      optimizedFor: "Large file uploads",
      status: "Ready"
    }
  });
});

// Validate external URL for thumbnails
router.post("/validate-url", auth, async (req, res) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: "URL is required", 
        message: "Please provide a URL to validate" 
      })
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
    res.status(500).json({ 
      success: false,
      error: "Failed to validate URL", 
      message: "URL validation service unavailable" 
    })
  }
})

// Clean up old files (optional maintenance endpoint)
router.delete("/cleanup-old", auth, adminMiddleware, async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000); // 24 hours ago
    let cleanedCount = 0;

    for (const file of files) {
      if (file === '.gitkeep') continue;
      
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      // Delete files older than 24 hours
      if (stats.mtimeMs < oneDayAgo) {
        fs.unlinkSync(filePath);
        cleanedCount++;
      }
    }

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} old files`,
      data: { cleanedCount }
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    res.status(500).json({
      success: false,
      error: "Cleanup failed",
      message: error.message
    });
  }
});

// Use error handling middleware
router.use(handleUploadError);

module.exports = router