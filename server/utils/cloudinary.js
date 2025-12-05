const cloudinary = require('cloudinary').v2;
const stream = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary from buffer
const uploadToCloudinary = async (fileBuffer, folder = 'lms/course') => {
  console.log(`☁️ Starting Cloudinary upload to folder: ${folder}`);
  console.log(`📊 Buffer size: ${fileBuffer.length} bytes`);
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload failed:', error);
          reject(error);
        } else {
          console.log(`✅ Cloudinary upload successful:`);
          console.log(`   📍 URL: ${result.secure_url}`);
          console.log(`   🆔 Public ID: ${result.public_id}`);
          console.log(`   📁 Folder: ${result.folder}`);
          resolve(result.secure_url);
        }
      }
    );

    // Create buffer stream and pipe to Cloudinary
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    console.log(`🗑️ Deleting from Cloudinary: ${imageUrl}`);
    // Extract public_id from URL
    const publicId = imageUrl.split('/').pop().split('.')[0];
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Cloudinary delete result: ${result.result}`);
    return result;
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};