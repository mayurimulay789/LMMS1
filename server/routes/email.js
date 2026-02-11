// routes/email.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configure nodemailer (using Gmail as example)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || process.env.EMAIL_PORT || 587,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

router.post('/send-enrollment', async (req, res) => {
  try {
    const { userEmail, courseTitle, amount, paymentMethod, paymentDate } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Enrollment Confirmation - ${courseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Welcome to Ryma Academy!</h2>
          <p>Thank you for enrolling in our course. Here are your enrollment details:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 10px;">Course Details</h3>
            <p><strong>Course:</strong> ${courseTitle}</p>
            <p><strong>Amount Paid:</strong> ₹${amount}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Enrollment Date:</strong> ${new Date(paymentDate).toLocaleDateString()}</p>
          </div>
          
          <p>You can now access the course content from your dashboard.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    res.json({ 
      success: true, 
      message: 'Enrollment email sent successfully' 
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send enrollment email' 
    });
  }
});

module.exports = router;