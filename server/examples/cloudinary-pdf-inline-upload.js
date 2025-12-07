/**
 * Example: Upload PDF to Cloudinary for Inline Viewing
 * 
 * This example demonstrates how to upload a PDF file to Cloudinary
 * and generate a URL that opens the PDF inline in the browser
 * instead of triggering a download.
 */

const { uploadToCloudinary, generateInlineUrl } = require('../utils/cloudinary');
const fs = require('fs');

async function uploadPdfInline(pdfFilePath) {
  try {
    console.log('📤 Uploading PDF for inline viewing...\n');
    
    // Read PDF file as buffer
    const pdfBuffer = fs.readFileSync(pdfFilePath);
    
    // Upload to Cloudinary with resource_type: 'raw'
    const cloudinaryUrl = await uploadToCloudinary(
      pdfBuffer, 
      'lms/certificates', // Folder in Cloudinary
      {
        resource_type: 'raw',  // REQUIRED for PDFs
        filename: 'sample-certificate.pdf',
        use_filename: true,
        unique_filename: true
      }
    );
    
    console.log('\n✅ Upload Complete!');
    console.log('📄 Inline View URL:', cloudinaryUrl);
    console.log('\nℹ️  The URL includes fl_attachment:false which makes the PDF open inline in browser');
    console.log('ℹ️  Instead of downloading, the PDF will display directly in the browser');
    
    return cloudinaryUrl;
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

/**
 * If you already have a Cloudinary URL and want to convert it to inline viewing:
 */
function convertToInlineUrl(existingUrl) {
  console.log('\n🔄 Converting existing URL to inline view...');
  console.log('Original URL:', existingUrl);
  
  const inlineUrl = generateInlineUrl(existingUrl);
  console.log('Inline URL:', inlineUrl);
  
  return inlineUrl;
}

// Example usage:
// uploadPdfInline('./path/to/your/certificate.pdf');

// Or convert an existing URL:
const exampleUrl = 'https://res.cloudinary.com/your-cloud/raw/upload/v123456/lms/certificates/cert.pdf';
convertToInlineUrl(exampleUrl);

module.exports = { uploadPdfInline, convertToInlineUrl };
