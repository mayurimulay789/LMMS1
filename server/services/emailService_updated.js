const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({

 
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || process.env.EMAIL_PORT || 587,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
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
      subject: 'Instructor Application Received - RYMAACADEMY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #e11d48; text-align: center;">Welcome to RYMAACADEMY Instructor Program!</h2>

          <p>Dear <strong>${applicantName}</strong>,</p>

          <p>Thank you for your interest in becoming an instructor at RYMAACADEMY! We have received your application and our team will review it shortly.</p>

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

          <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:support@RYMAACADEMY.com">support@RYMAACADEMY.com</a>.</p>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Team</strong></p>

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
          <strong>RYMAACADEMY System</strong></p>

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
      subject: 'Congratulations! Your Instructor Application is Approved - RYMAACADEMY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #10b981; text-align: center;">Congratulations! 🎉</h2>

          <p>Dear <strong>${applicantName}</strong>,</p>

          <p>Great news! Your application to become an instructor at RYMAACADEMY has been <strong>approved</strong>! Your instructor account has been created successfully.</p>

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

          <p>Welcome to the RYMAACADEMY instructor community! We're excited to have you on board.</p>

          <p>If you have any questions, please contact us at <a href="mailto:support@RYMAACADEMY.com">support@RYMAACADEMY.com</a>.</p>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Team</strong></p>

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
      subject: 'Update on Your Instructor Application - RYMAACADEMY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #6b7280; text-align: center;">Application Update</h2>

          <p>Dear <strong>${applicantName}</strong>,</p>

          <p>Thank you for your interest in becoming an instructor at RYMAACADEMY and for taking the time to submit your application.</p>

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

          <p>We appreciate your interest in RYMAACADEMY and wish you the best in your teaching journey.</p>

          <p>If you have any questions or would like feedback on your application, please contact us at <a href="mailto:support@RYMAACADEMY.com">support@RYMAACADEMY.com</a>.</p>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Team</strong></p>

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

const sendContactFormEmail = async (contactData) => {
  try {
    const { name, email, subject, message, category, contactId } = contactData;

    console.log('Sending contact form confirmation email to:', email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting RYMAACADEMY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #3b82f6; text-align: center;">Thank You for Contacting Us!</h2>

          <p>Dear <strong>${name}</strong>,</p>

          <p>Thank you for reaching out to RYMAACADEMY! We have received your message and our team will review it shortly.</p>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message Summary:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Category:</strong> ${category || 'General'}</p>
            <p><strong>Message ID:</strong> ${contactId}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our support team will review your message within 24 hours</li>
            <li>You will receive a response via email</li>
            <li>For urgent matters, we may contact you by phone</li>
          </ul>

          <div style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p><strong>Your Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <p>If you have any additional information or need to update your message, please reply to this email.</p>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Support Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated confirmation. For urgent matters, call us at 000000.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact form confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact form confirmation email:', error);
    throw error;
  }
};

const sendAdminContactNotification = async (contactData) => {
  try {
    const { name, email, subject, message, category, phone, contactId } = contactData;

    console.log('Sending admin contact notification from:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '...' : 'MISSING');
    console.log('To admin:', process.env.ADMIN_EMAIL || 'MISSING');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #ef4444; text-align: center;">New Contact Form Submission!</h2>

          <p>Dear Admin,</p>

          <p>A new contact form has been submitted on the RYMAACADEMY website. Please review the details below and respond promptly.</p>

          <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #333; margin-top: 0;">Contact Details:</h3>
            <p><strong>Contact ID:</strong> ${contactId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Category:</strong> ${category || 'General'}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Review the message and determine priority</li>
            <li>Respond to the user within 24 hours</li>
            <li>Update the contact status in the admin dashboard</li>
            <li>Escalate if needed based on urgency</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard?tab=contact"
               style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View in Admin Dashboard
            </a>
          </div>

          <p>For quick response, you can reply directly to this email or contact the user at ${email}${phone ? ` or ${phone}` : ''}.</p>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Automated System</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated notification. New contact submissions require your attention.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin contact notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin contact notification email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (userData) => {
  try {
    const { name, email, role } = userData;

    console.log('Sending welcome email to:', email);

    const mailOptions = {
      from: `"RYMAACADEMY" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to RYMAACADEMY! Your Account Has Been Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #10b981; text-align: center;">Welcome to RYMAACADEMY! 🎉</h2>

          <p>Dear <strong>${name}</strong>,</p>

          <p>Thank you for joining RYMAACADEMY! Your account has been successfully created and you are now ready to explore our learning platform.</p>

          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #333; margin-top: 0;">Account Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p><strong>What can you do now?</strong></p>
          <ul>
            <li>Browse and enroll in courses</li>
            <li>Access your personalized dashboard</li>
            <li>Track your learning progress</li>
            <li>Connect with instructors and fellow learners</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Start Learning Now
            </a>
          </div>

          <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@RYMAACADEMY.com">support@RYMAACADEMY.com</a>.</p>

          <p>Happy learning!</p>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};


const sendAdminSignupNotification = async (userData) => {
  try {
    const { name, email, role, userId } = userData;

    console.log('Sending admin signup notification from:', process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '...' : 'MISSING');
    console.log('To admin:', ADMIN_EMAIL || 'MISSING');

    if (!ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is not set in .env');
      return;
    }

    const mailOptions = {
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New User Registration - ${name} (${role})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #3b82f6; text-align: center;">New User Registration Alert!</h2>

          <p>Dear Admin,</p>

          <p>A new user has successfully registered on RYMAACADEMY. Here are the details:</p>

          <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #333; margin-top: 0;">User Details:</h3>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Email Verified:</strong> Yes</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard?tab=users"
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View User in Admin Dashboard
            </a>
          </div>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Automated System</strong></p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin signup notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending admin signup notification email:', error);
    throw error;
  }
};


const sendOTPEmail = async ({ email, name, otp }) => {
  try {
    console.log('Sending OTP email to:', email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Password Reset - RYMAACADEMY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #e11d48; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold;">
              SECURE OTP
            </div>
          </div>
          
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>

          <p>Hello <strong>${name}</strong>,</p>

          <p>You requested to reset your password. Use the OTP below to verify your identity:</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px dashed #e11d48;">
            <div style="font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #e11d48; margin: 10px 0;">
              ${otp}
            </div>
            <div style="color: #666; font-size: 14px; margin-top: 10px;">
              This OTP is valid for 10 minutes
            </div>
          </div>

          <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
            <h4 style="color: #f97316; margin-top: 0;">⚠️ Security Alert</h4>
            <p style="margin: 5px 0; font-size: 14px;">
              • Never share this OTP with anyone<br>
              • RYMAACADEMY will never ask for your OTP<br>
              • This OTP is for password reset only
            </p>
          </div>

          <p>If you didn't request this password reset, please ignore this email or contact our support team immediately.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?email=${encodeURIComponent(email)}"
               style="background-color: #e11d48; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password Now
            </a>
          </div>

          <p>Need help? Contact our support team at <a href="mailto:support@RYMAACADEMY.com" style="color: #e11d48;">support@RYMAACADEMY.com</a></p>

          <p>Stay secure,<br>
          <strong>The RYMAACADEMY Security Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated security message. Please do not reply to this email.<br>
            © ${new Date().getFullYear()} RYMAACADEMY. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Password Reset Success Email
const sendPasswordResetSuccessEmail = async ({ email, name, ipAddress, deviceInfo }) => {
  try {
    console.log('Sending password reset success email to:', email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Successfully Reset - RYMAACADEMY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #10b981; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold;">
              PASSWORD UPDATED
            </div>
          </div>
          
          <h2 style="color: #10b981; text-align: center;">✅ Password Reset Successful</h2>

          <p>Hello <strong>${name}</strong>,</p>

          <p>Your RYMAACADEMY password has been successfully reset.</p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h4 style="color: #333; margin-top: 0;">📋 Reset Details:</h4>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
            ${deviceInfo ? `<p><strong>Device:</strong> ${deviceInfo}</p>` : ''}
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h4 style="color: #f59e0b; margin-top: 0;">🔒 Security Notice</h4>
            <p style="margin: 5px 0; font-size: 14px;">
              If you did NOT perform this password reset:<br>
              1. Reset your password immediately<br>
              2. Contact our support team<br>
              3. Check your account for suspicious activity
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
               style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Login to Your Account
            </a>
          </div>

          <p>For security questions or to report suspicious activity, contact us immediately at <a href="mailto:security@RYMAACADEMY.com" style="color: #e11d48;">security@RYMAACADEMY.com</a></p>

          <p>Stay secure,<br>
          <strong>The RYMAACADEMY Security Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated security notification.<br>
            © ${new Date().getFullYear()} RYMAACADEMY. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset success email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset success email:', error);
    throw error;
  }
};

// Email Verification Email
const sendEmailVerificationEmail = async ({ email, name, verificationToken }) => {
  try {
    console.log('Sending email verification email to:', email);

    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email - RYMAACADEMY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #3b82f6; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold;">
              EMAIL VERIFICATION
            </div>
          </div>
          
          <h2 style="color: #3b82f6; text-align: center;">Welcome to RYMAACADEMY!</h2>

          <p>Hello <strong>${name}</strong>,</p>

          <p>Thank you for joining RYMAACADEMY! Please verify your email address to activate your account and get started with your learning journey.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}"
               style="background-color: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; word-break: break-all;">
            <code style="font-size: 12px;">${verificationLink}</code>
          </div>

          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h4 style="color: #3b82f6; margin-top: 0;">🎯 Why verify your email?</h4>
            <ul style="margin: 5px 0; padding-left: 20px;">
              <li>Secure your account</li>
              <li>Receive important notifications</li>
              <li>Reset your password if needed</li>
              <li>Access all platform features</li>
            </ul>
          </div>

          <p>This verification link will expire in 24 hours.</p>

          <p>If you didn't create an account with RYMAACADEMY, please ignore this email.</p>

          <p>Best regards,<br>
          <strong>The RYMAACADEMY Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated message. Please do not reply to this email.<br>
            © ${new Date().getFullYear()} RYMAACADEMY. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email verification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email verification email:', error);
    throw error;
  }
};

// Password Changed Notification
const sendPasswordChangedNotification = async ({ email, name }) => {
  try {
    console.log('Sending password changed notification to:', email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Password Has Been Changed - RYMAACADEMY',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; background-color: #6366f1; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold;">
              ACCOUNT SECURITY
            </div>
          </div>
          
          <h2 style="color: #6366f1; text-align: center;">🔐 Password Changed</h2>

          <p>Hello <strong>${name}</strong>,</p>

          <p>We're writing to confirm that your RYMAACADEMY account password was recently changed.</p>

          <div style="background-color: #eef2ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <h4 style="color: #333; margin-top: 0;">📅 Change Details:</h4>
            <p><strong>Date & Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Action:</strong> Password updated successfully</p>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h4 style="color: #f59e0b; margin-top: 0;">⚠️ Important Security Information</h4>
            <p style="margin: 5px 0; font-size: 14px;">
              If you made this change, no further action is needed.<br>
              If you did NOT make this change:<br>
              1. Reset your password immediately<br>
              2. Contact our security team<br>
              3. Review your account activity
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/security"
               style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Review Account Security
            </a>
          </div>

          <p>If you have any concerns about your account security, please contact us immediately at <a href="mailto:security@RYMAACADEMY.com" style="color: #e11d48;">security@RYMAACADEMY.com</a></p>

          <p>Stay secure,<br>
          <strong>The RYMAACADEMY Security Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated security notification.<br>
            © ${new Date().getFullYear()} RYMAACADEMY. All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password changed notification sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password changed notification:', error);
    throw error;
  }
};

// Test Email Function
const sendTestEmail = async ({ email, name }) => {
  try {
    console.log('Sending test email to:', email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Test Email - RYMAACADEMY Email Service',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #10b981; text-align: center;">✅ Email Service Working!</h2>

          <p>Hello <strong>${name || 'User'}</strong>,</p>

          <p>This is a test email from RYMAACADEMY's email service. If you're receiving this, our email system is working correctly!</p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <div style="font-size: 48px; color: #10b981;">✓</div>
            <h3>Email Service Status: <span style="color: #10b981;">OPERATIONAL</span></h3>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          </div>

          <p>All email notifications including:</p>
          <ul>
            <li>Account verification</li>
            <li>Password reset OTPs</li>
            <li>Course notifications</li>
            <li>Instructor communications</li>
          </ul>
          <p>...will be delivered to your email successfully.</p>

          <p>If you have any questions about our email service, please contact our support team.</p>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Technical Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is a test email. No action is required.<br>
            © ${new Date().getFullYear()} RYMAACADEMY.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId,
      message: 'Test email sent successfully. Check your inbox.'
    };
  } catch (error) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

module.exports = {
  sendInstructorApplicationEmail,
  sendAdminApplicationNotification,
  sendInstructorApprovalEmail,
  sendInstructorRejectionEmail,
  sendContactFormEmail,
  sendAdminContactNotification,
  sendWelcomeEmail,
  sendAdminSignupNotification,
  sendOTPEmail,
  sendPasswordResetSuccessEmail,
  sendEmailVerificationEmail,
  sendPasswordChangedNotification,
  sendTestEmail,
};
