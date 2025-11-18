const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with proper error handling
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Test the configuration
  console.log('Cloudinary Config Check:');
  console.log('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
  console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
  console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');

} catch (error) {
  console.error('Cloudinary configuration error:', error);
}

// Storage configurations with better error handling
const createStorage = (folder, resourceType = 'image') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      resource_type: resourceType,
      allowed_formats: resourceType === 'image' 
        ? ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] 
        : resourceType === 'video' 
          ? ['mp4', 'mov', 'avi', 'wmv', 'flv', '3gp', 'webm']
          : ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx'],
      transformation: resourceType === 'image' ? [
        { width: 1920, height: 1080, crop: 'limit', quality: 'auto' }
      ] : []
    },
  });
};

// Create upload configurations
const uploadImage = multer({ 
  storage: createStorage('ryma-academy/images'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const uploadVideo = multer({ 
  storage: createStorage('ryma-academy/videos', 'video'),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

const uploadDocument = multer({ 
  storage: createStorage('ryma-academy/documents', 'raw'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Thumbnail upload that supports both images and videos
const uploadThumbnail = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      // Determine resource type based on file mimetype
      const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      
      const baseParams = {
        folder: 'ryma-academy/thumbnails',
        resource_type: resourceType,
      };

      if (resourceType === 'image') {
        return {
          ...baseParams,
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [
            { width: 800, height: 450, crop: 'limit', quality: 'auto' }
          ]
        };
      } else {
        return {
          ...baseParams,
          allowed_formats: ['mp4', 'mov', 'avi', 'wmv', 'webm'],
          transformation: [
            { width: 800, height: 450, crop: 'limit' }
          ]
        };
      }
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for thumbnails (videos can be larger)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed for thumbnails!'), false);
    }
  }
});

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  uploadDocument,
  uploadThumbnail
};