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
          <strong>RYMAACADEMY Automated System</strong></p>

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
      from: process.env.EMAIL_USER,
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
    const { name, email, role, userId, password } = userData;

    console.log('Sending admin signup notification from:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '...' : 'MISSING');
    console.log('To admin:', process.env.ADMIN_EMAIL || 'MISSING');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
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
            <p><strong>Password:</strong> ${password}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Email Verified:</strong> Yes</p>
          </div>

          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Monitor user activity and engagement</li>
            <li>Check for any suspicious registrations</li>
            <li>Review user statistics in the admin dashboard</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard?tab=users"
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View User in Admin Dashboard
            </a>
          </div>

          <p>If you notice any unusual activity or need to take action, you can manage users through the admin panel.</p>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Automated System</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated notification for new user registrations.
          </p>
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

const sendCoursePurchaseEmail = async (purchaseData) => {
  try {
    const { userEmail, userName, courseTitle, coursePrice, amountPaid, discount, paymentDate, courseThumbnail, courseInstructor } = purchaseData;

    console.log('Sending course purchase confirmation email to:', userEmail);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🎉 Enrollment Successful - Welcome to ${courseTitle}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #10b981; text-align: center;">🎉 Congratulations on Your Enrollment!</h2>

          <p>Dear <strong>${userName}</strong>,</p>

          <p>Thank you for purchasing <strong>${courseTitle}</strong>! Your enrollment has been confirmed and you now have full access to the course content.</p>

          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #333; margin-top: 0;">📚 Course Details:</h3>
            <p><strong>Course:</strong> ${courseTitle}</p>
            <p><strong>Instructor:</strong> ${courseInstructor || 'RYMAACADEMY'}</p>
            <p><strong>Original Price:</strong> ₹${coursePrice.toFixed(2)}</p>
            ${discount > 0 ? `<p><strong>Discount:</strong> ₹${discount.toFixed(2)}</p>` : ''}
            <p><strong>Amount Paid:</strong> <span style="color: #10b981; font-weight: bold;">₹${amountPaid.toFixed(2)}</span></p>
            <p><strong>Purchase Date:</strong> ${new Date(paymentDate).toLocaleString()}</p>
          </div>

          <p><strong>What's Next?</strong></p>
          <ul style="color: #555;">
            <li>🔓 Access all course materials immediately</li>
            <li>📹 Watch high-quality video lectures</li>
            <li>📝 Download course resources and notes</li>
            <li>💬 Interact with instructors and peers</li>
            <li>✅ Complete assignments and quizzes</li>
            <li>🏆 Earn a certificate upon completion</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/learn/${courseTitle.toLowerCase().replace(/\\s+/g, '-')}"
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Start Learning Now
            </a>
          </div>

          <p><strong>Important Information:</strong></p>
          <ul style="color: #555; font-size: 14px;">
            <li>You can access this course anytime from your dashboard</li>
            <li>Your progress is automatically saved</li>
            <li>Need help? Contact our support team</li>
          </ul>

          <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:support@RYMAACADEMY.com">support@RYMAACADEMY.com</a>.</p>

          <p>Happy Learning!<br>
          <strong>RYMAACADEMY Team</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated confirmation email. Please do not reply to this email directly.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Course purchase confirmation email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending course purchase email:', error);
    throw error;
  }
};

const sendAdminCoursePurchaseNotification = async (purchaseData) => {
  try {
    const { userEmail, userName, userId, courseTitle, coursePrice, amountPaid, discount, paymentDate, courseId, paymentId } = purchaseData;

    console.log('Sending admin course purchase notification from:', process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '...' : 'MISSING');
    console.log('To admin:', process.env.ADMIN_EMAIL || 'MISSING');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `💰 New Course Purchase - ${courseTitle} by ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #3b82f6; text-align: center;">💰 New Course Purchase Alert!</h2>

          <p>Dear Admin,</p>

          <p>A new course purchase has been completed. Please review the transaction details below.</p>

          <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h3 style="color: #333; margin-top: 0;">Purchase Details:</h3>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
            <p><strong>User ID:</strong> ${userId}</p>
            <p><strong>Student Name:</strong> ${userName}</p>
            <p><strong>Student Email:</strong> <a href="mailto:${userEmail}">${userEmail}</a></p>
            <p><strong>Course ID:</strong> ${courseId}</p>
            <p><strong>Course Title:</strong> ${courseTitle}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">💵 Payment Details:</h3>
            <p><strong>Original Price:</strong> ₹${coursePrice.toFixed(2)}</p>
            ${discount > 0 ? `<p><strong>Discount Applied:</strong> ₹${discount.toFixed(2)}</p>` : ''}
            <p><strong>Amount Paid:</strong> <span style="color: #3b82f6; font-weight: bold; font-size: 16px;">₹${amountPaid.toFixed(2)}</span></p>
            <p><strong>Purchase Date & Time:</strong> ${new Date(paymentDate).toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">✓ Completed</span></p>
          </div>

          <p><strong>Summary:</strong></p>
          <ul style="color: #555;">
            <li>Student: ${userName} (${userEmail})</li>
            <li>Course: ${courseTitle}</li>
            <li>Revenue Generated: ₹${amountPaid.toFixed(2)}</li>
            <li>Transaction Time: ${new Date(paymentDate).toLocaleString()}</li>
          </ul>

          <p><strong>Next Steps:</strong></p>
          <ul style="color: #555;">
            <li>Verify the transaction in your payment gateway dashboard</li>
            <li>Monitor student engagement and progress</li>
            <li>Ensure the student has access to course materials</li>
            <li>Send course materials if applicable</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard?tab=payments&payment=${paymentId}"
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Payment Details
            </a>
          </div>

          <p>If you need to verify payment details or take any action, you can access the payment information through the admin dashboard.</p>

          <p>Best regards,<br>
          <strong>RYMAACADEMY Automated System</strong></p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            This is an automated notification for course purchases. New transactions require your review.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin course purchase notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending admin course purchase notification email:', error);
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
  sendCoursePurchaseEmail,
  sendAdminCoursePurchaseNotification,
};
