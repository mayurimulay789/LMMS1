const multer = require('multer');

// Memory storage
const storage = multer.memoryStorage();

// File filter for certificate (PDF only)
const certificateFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Certificate must be a PDF file'), false);
  }
};

// File filter for course preview (image or video)
const coursePreviewFilter = (req, file, cb) => {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Course preview must be image or video'), false);
  }
};

// Multer instances
const uploadCertificate = multer({
  storage: storage,
  fileFilter: certificateFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('certificate');

const uploadCoursePreview = multer({
  storage: storage,
  fileFilter: coursePreviewFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB for videos
}).single('coursePreview');

// Error handler
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Upload failed'
    });
  }
  next();
};

module.exports = {
  uploadCertificate,
  uploadCoursePreview,
  handleUploadErrors
};