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

const sendInstructorApprovalEmail = async ({ applicantName, email, loginLink }) => {
  try {
    console.log('Sending approval email to:', email);

    const linkToUse = loginLink || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
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
      from: process.env.EMAIL_USER,
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

const sendContactNotificationEmail = async (contactData) => {
  try {
    const { name, email, subject, message, phone, category, contactId } = contactData;

    console.log('Sending contact notification to admin:', process.env.ADMIN_EMAIL || 'MISSING');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #e11d48; text-align: center;">New Contact Form Submission!</h2>

          <p>Dear Admin,</p>

          <p>A new contact form has been submitted on the website. Please review the details below.</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Details:</h3>
            <p><strong>Contact ID:</strong> ${contactId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Submission Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">Message:</h4>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Review the contact details and message</li>
            <li>Respond to the inquiry if needed</li>
            <li>Update the contact status in the admin dashboard</li>
          </ul>

          <p>You can reply directly to this email or use the admin panel to manage this contact.</p>

          <p>Best regards,<br>
          <strong>Ryma Academy Automated System</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated notification. New contact submissions require your attention.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact notification email:', error);
    throw error;
  }
};

const sendContactAutoReplyEmail = async (contactData) => {
  try {
    const { name, email, subject, message } = contactData;

    console.log('Sending auto-reply email to:', email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Ryma Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #e11d48; text-align: center;">Thank You for Contacting Us!</h2>

          <p>Dear <strong>${name}</strong>,</p>

          <p>Thank you for reaching out to Ryma Academy! We have received your message and our team will review it shortly.</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message Summary:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="color: #856404; margin-top: 0;">Your Message:</h4>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <p><strong>What happens next?</strong></p>
          <ol>
            <li>Our team will review your inquiry within 24 hours</li>
            <li>We'll respond to your email with more details</li>
            <li>If urgent, we'll contact you directly</li>
          </ol>

          <p>If you have any additional information or questions, please don't hesitate to reply to this email.</p>

          <p>You can also reach us at:</p>
          <ul>
            <li><strong>Email:</strong> info@rymaacademy.com</li>
            <li><strong>Phone:</strong> +0000000000</li>
            <li><strong>Office:</strong> Pune, Maharashtra, India</li>
          </ul>

          <p>Best regards,<br>
          <strong>Ryma Academy Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated response. Please do not reply to this email directly for support inquiries.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact auto-reply email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact auto-reply email:', error);
    throw error;
  }
};

module.exports = {
  sendInstructorApplicationEmail,
  sendAdminApplicationNotification,
  sendInstructorApprovalEmail,
  sendInstructorRejectionEmail,
  sendContactNotificationEmail,
  sendContactAutoReplyEmail,
};
