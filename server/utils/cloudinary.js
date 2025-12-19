const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary from buffer
const uploadToCloudinary = async (fileBuffer, folder = 'lms/course', options = {}) => {
  console.log(`☁️ Starting Cloudinary upload to folder: ${folder}`);
  console.log(`📊 Buffer size: ${fileBuffer.length} bytes`);
  
  // Determine resource type
  let resourceType = 'auto'; // Default to auto-detection
  if (options.resource_type) {
    resourceType = options.resource_type;
  } else if (options.filename) {
    const filename = options.filename.toLowerCase();
    if (filename.endsWith('.pdf')) {
      resourceType = 'raw';
    } else if (filename.endsWith('.mp4') || filename.endsWith('.mov') || 
               filename.endsWith('.avi') || filename.endsWith('.mkv')) {
      resourceType = 'video';
    }
  }
  
  const uploadOptions = {
    folder: folder,
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    ...options
  };

  console.log('📋 Upload options:', uploadOptions);
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          // Log full provider error server-side for debugging
          console.error('❌ Cloudinary upload failed (raw):', error);
          if (error.http_code) console.error('   http_code:', error.http_code);
          if (error.message) console.error('   message:', error.message);

          // Create a sanitized error to propagate up
          const sanitized = new Error('Upload provider error');
          sanitized.provider = 'cloudinary';
          sanitized.code = error?.http_code || error?.code || 'CLOUDINARY_ERROR';
          sanitized.raw = error; // keep raw error for server-side logging only
          reject(sanitized);
        } else {
          console.log(`✅ Cloudinary upload successful:`);
          console.log(`   📍 URL: ${result.secure_url}`);
          console.log(`   🆔 Public ID: ${result.public_id}`);
          console.log(`   📁 Folder: ${result.folder}`);
          console.log(`   📄 Resource Type: ${result.resource_type}`);
          console.log(`   📦 Format: ${result.format || 'N/A'}`);
          resolve(result.secure_url);
        }
      }
    );

    // Handle stream errors
    uploadStream.on('error', (error) => {
      console.error('❌ Upload stream error:', error);
      reject(error);
    });

    // Create buffer stream and pipe to Cloudinary
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (fileUrl) => {
  try {
    console.log(`🗑️ Deleting from Cloudinary: ${fileUrl}`);
    
    if (!fileUrl || !fileUrl.includes('cloudinary.com')) {
      throw new Error('Invalid Cloudinary URL');
    }
    
    // Determine resource type from URL
    let resourceType = 'image';
    if (fileUrl.includes('.pdf') || fileUrl.includes('/raw/')) {
      resourceType = 'raw';
    } else if (fileUrl.includes('/video/')) {
      resourceType = 'video';
    }
    
    // Extract public_id from URL
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    
    console.log(`✅ Cloudinary delete result: ${result.result}`);
    return result;
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary (raw):', error);
    const sanitized = new Error('Cloudinary delete failed');
    sanitized.provider = 'cloudinary';
    sanitized.code = error?.http_code || error?.code || 'CLOUDINARY_DELETE_ERROR';
    sanitized.raw = error;
    throw sanitized;
  }
};

// Special function for uploading certificates (PDFs)
const uploadCertificateToCloudinary = async (pdfBuffer, certificateId) => {
  return await uploadToCloudinary(pdfBuffer, 'lms/certificates', {
    resource_type: 'raw', // Explicitly raw for PDFs
    filename: `${certificateId}.pdf`,
    use_filename: true,
    unique_filename: true
  });
};

// Special function for uploading course images
const uploadCourseImageToCloudinary = async (imageBuffer, filename) => {
  return await uploadToCloudinary(imageBuffer, 'lms/course/images', {
    resource_type: 'auto', // Auto detect for images
    filename: filename,
    use_filename: true,
    unique_filename: true
  });
};

// Special function for uploading course videos
const uploadCourseVideoToCloudinary = async (videoBuffer, filename) => {
  return await uploadToCloudinary(videoBuffer, 'lms/course/videos', {
    resource_type: 'video',
    filename: filename,
    use_filename: true,
    unique_filename: true
  });
};

module.exports = {
  uploadToCloudinary,
  uploadCertificateToCloudinary,
  uploadCourseImageToCloudinary,
  uploadCourseVideoToCloudinary,
  deleteFromCloudinary
};