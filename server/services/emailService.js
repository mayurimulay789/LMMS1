const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

const sendInstructorApplicationEmail = async (applicationData) => {
  try {
    const { applicantName, email, phone, experience, qualifications, motivation } = applicationData;

    // Check if email configuration is available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email configuration missing. Skipping application confirmation email send.');
      console.log('SMTP_USER set:', !!process.env.SMTP_USER);
      console.log('SMTP_PASS set:', !!process.env.SMTP_PASS);
      return { success: false, message: 'Email configuration missing' };
    }

    console.log('Attempting to send email from:', process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '...' : 'MISSING');
    console.log('To:', email);
    console.log('Host:', process.env.SMTP_HOST || 'DEFAULT');
    console.log('Port:', process.env.SMTP_PORT || 'DEFAULT');

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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

const sendInstructorApprovalEmail = async ({ applicantName, email, loginLink }) => {
  try {
    console.log('Sending approval email to:', email);

    // Check if email configuration is available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email configuration missing. Skipping email send.');
      console.log('SMTP_USER set:', !!process.env.SMTP_USER);
      console.log('SMTP_PASS set:', !!process.env.SMTP_PASS);
      return { success: false, message: 'Email configuration missing' };
    }

    const linkToUse = loginLink || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Congratulations! Your Instructor Application is Approved - LearnHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #10b981; text-align: center;">Congratulations! 🎉</h2>

          <p>Dear <strong>${applicantName}</strong>,</p>

          <p>Great news! Your application to become an instructor at LearnHub has been <strong>approved</strong>! Your instructor account has been created successfully.</p>

          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p><strong>What happens next?</strong></p>
            <ol>
              <li>Login to your instructor account</li>
              <li>Access the instructor dashboard</li>
              <li>Start creating your first course</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <button onclick="window.location.href='${linkToUse}'" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; border: none; cursor: pointer;">
              Login to Your Account
            </button>
          </div>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">${linkToUse}</p>

          <p>Welcome to the LearnHub instructor community! We're excited to have you on board.</p>

          <p>If you have any questions, please contact us at <a href="mailto:support@learnhub.com">support@learnhub.com</a>.</p>

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
    console.log('Instructor approval email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending instructor approval email:', error);
    throw error;
  }
};

const sendInstructorRejectionEmail = async ({ applicantName, email }) => {
  try {
    console.log('Sending rejection email to:', email);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Update on Your Instructor Application - LearnHub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #6b7280; text-align: center;">Application Update</h2>

          <p>Dear <strong>${applicantName}</strong>,</p>

          <p>Thank you for your interest in becoming an instructor at LearnHub and for taking the time to submit your application.</p>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
          </div>

          <p><strong>Why was my application not approved?</strong></p>
          <p>Applications are evaluated based on various criteria including teaching experience, subject matter expertise, and platform fit. While your application didn't meet our current requirements, we encourage you to:</p>

          <ul>
            <li>Gain more teaching experience</li>
            <li>Build your expertise in your field</li>
            <li>Reapply in the future when you feel ready</li>
          </ul>

          <p>We appreciate your interest in LearnHub and wish you the best in your teaching journey.</p>

          <p>If you have any questions or would like feedback on your application, please contact us at <a href="mailto:support@learnhub.com">support@learnhub.com</a>.</p>

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
    console.log('Instructor rejection email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending instructor rejection email:', error);
    throw error;
  }
};

module.exports = {
  sendInstructorApplicationEmail,
  sendAdminApplicationNotification,
  sendInstructorApprovalEmail,
  sendInstructorRejectionEmail,
};
