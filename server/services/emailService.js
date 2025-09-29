const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInstructorApplicationEmail = async (applicationData) => {
  try {
    const { applicantName, email, phone, experience, qualifications, motivation } = applicationData;

    console.log('Attempting to send email from:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '...' : 'MISSING');
    console.log('To:', email);
    console.log('Host:', process.env.EMAIL_HOST || 'DEFAULT');
    console.log('Port:', process.env.EMAIL_PORT || 'DEFAULT');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Instructor Application Received - LearnHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #e11d48; text-align: center;">Welcome to LearnHub Instructor Program!</h2>

          <p>Dear <strong>${applicantName}</strong>,</p>

          <p>Thank you for your interest in becoming an instructor at LearnHub! We have received your application and our team will review it shortly.</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Application Summary:</h3>
            <p><strong>Name:</strong> ${applicantName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Experience:</strong> ${experience.substring(0, 100)}${experience.length > 100 ? '...' : ''}</p>
            <p><strong>Qualifications:</strong> ${qualifications.substring(0, 100)}${qualifications.length > 100 ? '...' : ''}</p>
          </div>

          <p><strong>What happens next?</strong></p>
          <ol>
            <li>Our team will review your application within 3-5 business days</li>
            <li>If shortlisted, we'll contact you for an interview</li>
            <li>Successful candidates will receive instructor onboarding materials</li>
          </ol>

          <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:support@learnhub.com">support@learnhub.com</a>.</p>

          <p>Best regards,<br>
          <strong>LearnHub Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Instructor application email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending instructor application email:', error);
    throw error;
  }
};

const sendAdminApplicationNotification = async (applicationData) => {
  try {
    const { applicantName, email, phone, experience, qualifications, motivation, applicationId } = applicationData;

    console.log('Sending admin notification from:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '...' : 'MISSING');
    console.log('To admin:', process.env.ADMIN_EMAIL || 'MISSING');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Instructor Application Received - ${applicantName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #e11d48; text-align: center;">New Instructor Application Alert!</h2>

          <p>Dear Admin,</p>

          <p>A new instructor application has been submitted. Please review the details below and take appropriate action.</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p><strong>Applicant Name:</strong> ${applicantName}</p>
            <p><strong>Applicant Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Experience:</strong> ${experience}</p>
            <p><strong>Qualifications:</strong> ${qualifications}</p>
            <p><strong>Motivation:</strong> ${motivation}</p>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Review the application details above</li>
            <li>Check the applicant's qualifications and experience</li>
            <li>Schedule an interview if shortlisted</li>
            <li>Update application status in the admin dashboard</li>
          </ul>

          <p>If you need more information, contact the applicant at ${email} or ${phone}.</p>

          <p>Best regards,<br>
          <strong>LearnHub Automated System</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated notification. New applications require your review.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
};

module.exports = {
  sendInstructorApplicationEmail,
  sendAdminApplicationNotification,
};
