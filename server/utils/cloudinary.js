// const cloudinary = require('cloudinary').v2;
// const stream = require('stream');

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Upload file to Cloudinary from buffer
// const uploadToCloudinary = async (fileBuffer, folder = 'lms/course') => {
//   console.log(`☁️ Starting Cloudinary upload to folder: ${folder}`);
//   console.log(`📊 Buffer size: ${fileBuffer.length} bytes`);
  
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: folder
//       },
//       (error, result) => {
//         if (error) {
//           console.error('❌ Cloudinary upload failed:', error);
//           reject(error);
//         } else {
//           console.log(`✅ Cloudinary upload successful:`);
//           console.log(`   📍 URL: ${result.secure_url}`);
//           console.log(`   🆔 Public ID: ${result.public_id}`);
//           console.log(`   📁 Folder: ${result.folder}`);
//           resolve(result.secure_url);
//         }
//       }
//     );

//     // Create buffer stream and pipe to Cloudinary
//     const bufferStream = new stream.PassThrough();
//     bufferStream.end(fileBuffer);
//     bufferStream.pipe(uploadStream);
//   });
// };

// // Delete file from Cloudinary
// const deleteFromCloudinary = async (imageUrl) => {
//   try {
//     console.log(`🗑️ Deleting from Cloudinary: ${imageUrl}`);
//     // Extract public_id from URL
//     const publicId = imageUrl.split('/').pop().split('.')[0];
//     const result = await cloudinary.uploader.destroy(publicId);
//     console.log(`✅ Cloudinary delete result: ${result.result}`);
//     return result;
//   } catch (error) {
//     console.error('❌ Error deleting from Cloudinary:', error);
//     throw error;
//   }
// };

// module.exports = {
//   uploadToCloudinary,
//   deleteFromCloudinary
// };

const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to generate inline viewing URL for PDFs
const generateInlineUrl = (cloudinaryUrl) => {
  // For raw PDFs, add fl_attachment:false to make them open inline
  // Example: https://res.cloudinary.com/xxx/raw/upload/v123/file.pdf
  // Becomes: https://res.cloudinary.com/xxx/raw/upload/fl_attachment:false/v123/file.pdf
  
  if (cloudinaryUrl.includes('/raw/upload/')) {
    return cloudinaryUrl.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
  }
  
  return cloudinaryUrl;
};

// Upload file to Cloudinary from buffer
const uploadToCloudinary = async (fileBuffer, folder = 'lms/course', options = {}) => {
  console.log(`☁️ Starting Cloudinary upload to folder: ${folder}`);
  console.log(`📊 Buffer size: ${fileBuffer.length} bytes`);
  
  // Determine resource type based on filename or explicit option
  let resourceType = options.resource_type || 'auto';
  
  // If filename ends with .pdf, force raw type
  if (options.filename && options.filename.toLowerCase().endsWith('.pdf')) {
    resourceType = 'raw';
  }
  
  const uploadOptions = {
    folder: folder,
    resource_type: resourceType, // 'raw' for PDFs, 'auto' for images/videos
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    ...options
  };

  console.log('📋 Upload options:', {
    folder: uploadOptions.folder,
    resource_type: uploadOptions.resource_type,
    filename: options.filename || 'Not specified',
    use_filename: uploadOptions.use_filename
  });
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload failed:', error);
          reject(error);
        } else {
          console.log(`✅ Cloudinary upload successful:`);
          console.log(`   📍 URL: ${result.secure_url}`);
          console.log(`   🆔 Public ID: ${result.public_id}`);
          console.log(`   📁 Folder: ${result.folder}`);
          console.log(`   📄 Resource Type: ${result.resource_type}`);
          console.log(`   📦 Format: ${result.format || 'N/A'}`);
          
          // For raw files (PDFs), generate inline viewing URL
          let finalUrl = result.secure_url;
          if (result.resource_type === 'raw' && result.format === 'pdf') {
            finalUrl = generateInlineUrl(result.secure_url);
            console.log(`   🔗 Inline URL: ${finalUrl}`);
          }
          
          resolve(finalUrl);
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
    console.error('❌ Error deleting from Cloudinary:', error);
    throw error;
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
  deleteFromCloudinary,
  generateInlineUrl
};