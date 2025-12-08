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

// Upload file to Cloudinary from buffer
// const uploadToCloudinary = async (fileBuffer, folder = 'lms/course', options = {}) => {

// resourceType: 'image' | 'video' | 'raw' (for pdfs) - default 'image'
const uploadToCloudinary = async (fileBuffer, folder = 'lms/course', resourceType = 'image', mimeType = 'application/octet-stream') => {
  console.log(`☁️ Starting Cloudinary upload to folder: ${folder}`);
  console.log(`📊 Buffer size: ${fileBuffer.length} bytes`);
  console.log(`🔖 Resource type: ${resourceType}`);
  console.log(`📎 MIME type: ${mimeType}`);
  
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
    const options = { folder: folder };
    // Cloudinary expects resource_type when uploading videos or raw files
    if (resourceType && resourceType !== 'image') {
      options.resource_type = resourceType;
      // For larger non-image uploads, recommend a chunk size (6MB)
      options.chunk_size = 6 * 1024 * 1024;
    }

    console.log('☁️ Cloudinary upload options:', options);

    const uploadStream = cloudinary.uploader.upload_stream(

      uploadOptions,

      options,
      (error, result) => {
            if (error) {
              // Log full provider error server-side for debugging
              console.error('❌ Cloudinary upload failed (raw):', error);
              if (error.http_code) console.error('   http_code:', error.http_code);
              if (error.message) console.error('   message:', error.message);

              // If this was a video/raw upload and Cloudinary reported an "Invalid image file"
              // or similar, attempt a fallback using the uploader.upload with a data URI.
              if ((resourceType === 'video' || resourceType === 'raw') && /invalid image file|file size too large|Invalid image file/i.test(error.message || '')) {
                try {
                  console.log('☁️ Attempting fallback upload using data URI for non-image resource');
                  const b64 = fileBuffer.toString('base64');
                  const dataUri = `data:${mimeType};base64,${b64}`;
                  const fallbackOptions = { ...options, resource_type: resourceType };
                  cloudinary.uploader.upload(dataUri, fallbackOptions, (fbErr, fbRes) => {
                    if (fbErr) {
                      console.error('❌ Fallback upload failed:', fbErr);
                      const sanitized = new Error('Upload provider error');
                      sanitized.provider = 'cloudinary';
                      sanitized.code = fbErr?.http_code || fbErr?.code || 'CLOUDINARY_ERROR';
                      sanitized.raw = fbErr;
                      return reject(sanitized);
                    }
                    console.log('✅ Fallback Cloudinary upload successful: ', fbRes && fbRes.secure_url);
                    return resolve(fbRes.secure_url);
                  });
                  return; // avoid falling through to primary reject
                } catch (fallbackErr) {
                  console.error('❌ Exception during fallback upload:', fallbackErr);
                }
              }

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