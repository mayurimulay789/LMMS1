const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const multer = require("multer")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure Cloudinary storage for different file types
const createCloudinaryStorage = (folder, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `mern-lms/${folder}`,
      allowed_formats: allowedFormats,
        resource_type: "auto", // ADD THIS LINE
      transformation: [
        {
          width: 1920,
          height: 1080,
          crop: "limit",
          quality: "auto:good",
        },
      ],
    },
  })
}

// Storage configurations
const imageStorage = createCloudinaryStorage("images", ["jpg", "jpeg", "png", "gif", "webp"])
const videoStorage = createCloudinaryStorage("videos", ["mp4", "avi", "mov", "wmv", "flv"])
const documentStorage = createCloudinaryStorage("documents", ["pdf", "doc", "docx", "ppt", "pptx"])

// Storage for course thumbnails (supports both images and videos)
const thumbnailStorage = createCloudinaryStorage("thumbnails", ["jpg", "jpeg", "png", "gif", "webp", "mp4", "avi", "mov", "wmv", "flv"])

// Multer configurations
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
})

const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
})

const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
})

const uploadThumbnail = multer({
  storage: thumbnailStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for thumbnails (videos can be larger)
  },
})

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  uploadDocument,
  thumbnailStorage,
  uploadThumbnail,
}
