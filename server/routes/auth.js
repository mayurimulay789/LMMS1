const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const Referral = require("../models/Referral");
const auth = require("../middleware/auth");
const {
  sendOTPEmail,
  sendPasswordResetSuccessEmail,
  sendWelcomeEmail,
  sendAdminSignupNotification,
  sendTestEmail,
  sendEmailVerificationSuccessEmail   // make sure this function exists
} = require("../services/emailService_updated");
const { uploadProfileImageToCloudinary } = require("../utils/cloudinary");
const { uploadProfileImage } = require("../middleware/uploadMiddleware");
const crypto = require("crypto");

// OTP rate limiter (10 requests per 10 minutes)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many OTP requests. Please try again after 10 minutes.",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    return ip + userAgent;
  }
});

// ==================== REGISTRATION WITH OTP ====================
// ==================== REGISTRATION WITH OTP ====================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, referralCode } = req.body;
    let referrer = null;
    console.log('📝 Registration request:', { name, email, role, referralCode });

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required"
      });
    }
    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }
    // Validate role
    const validRoles = ["student", "instructor", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "student";

    // Check if user already exists (ANY existing user, regardless of password presence)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      console.log('❌ Registration blocked – user already exists:', email);
      return res.status(400).json({
        success: false,
        message: "User already exists with this email address."
      });
    }

    // Validate referral code if provided
    if (referralCode) {
      let referrerUser;
      if (referralCode.includes('@')) {
        referrerUser = await User.findOne({ email: referralCode.toLowerCase().trim() });
      } else {
        referrerUser = await User.findOne({ referralCode });
      }
      if (!referrerUser) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code"
        });
      }
      referrer = referrerUser._id;
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      isOAuthUser: false,
      referredBy: referrer,
    });
    await user.save();
    console.log('✅ User created:', user._id);

    // Create referral code for new user
    if (!user.referralCode) {
      try {
        const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomNum = Math.floor(100 + Math.random() * 900);
        const userReferralCode = `${emailPrefix}${randomNum}`;
        const existingCode = await User.findOne({ referralCode: userReferralCode });
        user.referralCode = existingCode
          ? crypto.randomBytes(4).toString('hex').toUpperCase()
          : userReferralCode;
        await user.save();
        console.log('✅ Referral code created:', user.referralCode);
      } catch (referralError) {
        console.error('⚠️ Error creating referral code:', referralError.message);
      }
    }

    // Update referrer's referral record
    if (referrer) {
      try {
        await Referral.findOneAndUpdate(
          { referrer: referrer },
          {
            $push: {
              referred: {
                user: user._id,
                status: "pending"
              }
            }
          },
          { upsert: true, new: true }
        );
        console.log('✅ Referrer record updated');
      } catch (referralUpdateError) {
        console.error('⚠️ Error updating referrer record:', referralUpdateError.message);
      }
    }

    // Generate and send verification OTP
    if (!user.isOAuthUser) {
      const otp = user.generateOTP();
      await user.save();
      try {
        await sendOTPEmail({
          email: user.email,
          name: user.name,
          otp: otp,
          purpose: 'verification'
        });
        console.log('✅ Verification OTP email sent to:', user.email);
      } catch (emailError) {
        console.error('⚠️ Error sending verification OTP:', emailError.message);
        // Continue registration even if email fails (user can resend)
      }
    }

    // Admin notification for new student signups
    if (user.role === 'student') {
      try {
        await sendAdminSignupNotification({
          name: user.name,
          email: user.email,
          role: user.role,
          userId: user._id.toString()
        });
        console.log('✅ Admin notification sent');
      } catch (adminEmailError) {
        console.error('⚠️ Error sending admin notification:', adminEmailError.message);
      }
    }

    // Generate JWT token
    const token = jwt.sign({
      id: user._id,
      email: user.email,
      role: user.role
    }, process.env.JWT_SECRET || 'fallback-secret-key', {
      expiresIn: "7d"
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        referralCode: user.referralCode,
        profileImage: user.profile.avatar || ''
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== EMAIL VERIFICATION ====================

// Send OTP for email verification (can be used for initial or resend)
router.post("/send-verification-otp", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📧 Send verification OTP for:', email);

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // For security, don't reveal if email exists
    if (!user) {
      console.log('❌ User not found for verification OTP:', normalizedEmail);
      return res.status(200).json({
        success: true,
        message: "If your email exists in our system, you will receive a verification code",
        otpSent: false
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified. You can log in.",
        alreadyVerified: true
      });
    }

    // Generate new OTP using model method
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail({
        email: user.email,
        name: user.name,
        otp: otp,
        purpose: 'verification'
      });
      console.log('✅ Verification OTP sent to:', user.email);

      res.status(200).json({
        success: true,
        message: "Verification code sent to your email",
        otpSent: true,
        expiresIn: "10 minutes"
      });
    } catch (emailError) {
      console.error('❌ Error sending verification OTP email:', emailError.message);
      await user.clearOTP(); // clean up if email fails
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
        otpSent: false
      });
    }

  } catch (error) {
    console.error("🚨 Error in send-verification-otp:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify email OTP (for email verification after registration)
// Verify email OTP (for email verification after registration)
router.post("/verify-email-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔐 Email verification OTP request for:', email);

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }

    // Find user by email with OTP fields
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+otp +otpExpires +otpAttempts +otpBlockedUntil');

    if (!user) {
      console.log('❌ User not found for email verification:', email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP",
      });
    }

    // If already verified, return early (optional but user-friendly)
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified. You can log in.",
        alreadyVerified: true
      });
    }

    console.log('✅ User found for email verification');

    // Verify OTP using model method (should update user fields, but not save)
    const verificationResult = await user.verifyEmailOTP(otp);

    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
        blocked: verificationResult.blocked || false,
        expired: verificationResult.expired || false,
        attemptsLeft: verificationResult.attemptsLeft
      });
    }

    // Explicitly set emailVerified to true (if not already done by verifyEmailOTP)
    user.emailVerified = true;
    // Optionally clear OTP fields (verifyEmailOTP may already do this)
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpBlockedUntil = undefined;

    // Save the user with updated verification status
    await user.save();
    console.log('✅ Email verified and saved for:', user.email);

    // Send verification success email
    try {
      await sendEmailVerificationSuccessEmail({
        email: user.email,
        name: user.name
      });
      console.log('✅ Verification success email sent to:', user.email);
    } catch (emailError) {
      console.error('⚠️ Error sending verification success email:', emailError.message);
    }

    // Send welcome email now that email is verified
    try {
      await sendWelcomeEmail({
        name: user.name,
        email: user.email,
        role: user.role
      });
      console.log('✅ Welcome email sent after verification');
    } catch (welcomeEmailError) {
      console.error('⚠️ Error sending welcome email after verification:', welcomeEmailError.message);
    }

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now access all features.",
      emailVerified: true
    });

  } catch (error) {
    console.error("🚨 Error verifying email OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== PASSWORD RESET (existing endpoints) ====================

// ... (all password reset endpoints remain exactly as they were) ...

// Search user by email and send OTP for password reset
router.post("/searchuserbyemailandreset", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔍 Searching for email:', email);
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('❌ User not found with email:', normalizedEmail);
      return res.status(200).json({
        success: true,
        message: "If your email exists in our system, you will receive OTP instructions",
        otpSent: false
      });
    }
    console.log('✅ User found:', { email: user.email, id: user._id });
    const otp = user.generateOTP();
    await user.save();
    console.log('🔢 Generated OTP for', user.email, ':', otp);
    try {
      console.log('📧 Sending OTP email to:', user.email);
      await sendOTPEmail({
        email: user.email,
        name: user.name,
        otp: otp
      });
      console.log('✅ OTP email sent successfully');
      res.status(200).json({
        success: true,
        message: "OTP sent successfully to your email",
        otpSent: true,
        email: user.email,
        expiresIn: "10 minutes"
      });
    } catch (emailError) {
      console.error('❌ Error sending OTP email:', emailError.message);
      await user.clearOTP();
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
        otpSent: false
      });
    }
  } catch (error) {
    console.error("🚨 Error in search and send OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reset password with OTP (single step)
router.post("/resetpasswordwithotp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log('🔄 Password reset request for:', email);
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+otp +otpExpires +otpAttempts +otpBlockedUntil');
    if (!user) {
      console.log('❌ User not found for password reset:', email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP",
      });
    }
    console.log('✅ User found for password reset');
    const otpVerification = await user.verifyOTP(otp);
    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message,
        blocked: otpVerification.blocked || false,
        expired: otpVerification.expired || false
      });
    }
    console.log('✅ OTP verified successfully');
    user.password = newPassword;
    user.lastPasswordChange = Date.now();
    await user.save();
    console.log('✅ Password updated');
    try {
      await sendPasswordResetSuccessEmail({
        email: user.email,
        name: user.name
      });
      console.log('✅ Confirmation email sent');
    } catch (emailError) {
      console.error('⚠️ Error sending confirmation email:', emailError.message);
    }
    res.status(200).json({
      success: true,
      message: "Password reset successful! You can now login with your new password.",
      passwordChanged: true
    });
  } catch (error) {
    console.error("🚨 Error resetting password with OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify OTP (first step of two-step password reset)
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔐 OTP verification request for:', email);
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+otp +otpExpires +otpAttempts +otpBlockedUntil');
    if (!user) {
      console.log('❌ User not found for OTP verification:', email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP",
      });
    }
    console.log('✅ User found for OTP verification');
    const otpVerification = await user.verifyOTP(otp);
    if (!otpVerification.valid) {
      return res.status(400).json({
        success: false,
        message: otpVerification.message,
        blocked: otpVerification.blocked || false,
        expired: otpVerification.expired || false,
        attemptsLeft: otpVerification.attemptsLeft
      });
    }
    console.log('✅ OTP verified successfully');
    const resetToken = user.createPasswordResetToken();
    await user.save();
    console.log('🔑 Reset token generated for user:', user.email);
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      otpVerified: true,
      resetToken: resetToken,
      email: user.email,
      expiresIn: "10 minutes"
    });
  } catch (error) {
    console.error("🚨 Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Set new password (second step of two-step password reset)
router.post("/set-new-password", async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;
    console.log('🔄 Setting new password for:', email);
    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+passwordResetToken +passwordResetExpires');
    if (!user) {
      console.log('❌ User not found for password reset:', email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or reset token",
      });
    }
    console.log('✅ User found for password reset');
    if (!user.verifyPasswordResetToken(resetToken)) {
      console.log('❌ Invalid or expired reset token');
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new OTP.",
        tokenExpired: true
      });
    }
    console.log('✅ Reset token verified successfully');
    user.password = newPassword;
    user.lastPasswordChange = Date.now();
    user.clearPasswordResetToken();
    await user.save();
    console.log('✅ Password updated successfully');
    try {
      await sendPasswordResetSuccessEmail({
        email: user.email,
        name: user.name
      });
      console.log('✅ Confirmation email sent');
    } catch (emailError) {
      console.error('⚠️ Error sending confirmation email:', emailError.message);
    }
    res.status(200).json({
      success: true,
      message: "Password reset successful! You can now login with your new password.",
      passwordChanged: true
    });
  } catch (error) {
    console.error("🚨 Error setting new password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== AUTHENTICATION & PROFILE ====================

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Login attempt for:', email);
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }
    if (user.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Account is ${user.status}. Please contact support.`,
        status: user.status
      });
    }
    const isMatch = await user.comparePassword(password);
    await user.recordLoginAttempt(
      isMatch,
      req.ip || req.connection.remoteAddress,
      req.headers['user-agent']
    );
    if (!isMatch) {
      console.log('❌ Invalid password');
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
        failedAttempts: user.failedLoginAttempts,
        attemptsLeft: 5 - user.failedLoginAttempts
      });
    }
    console.log('✅ Login successful for:', email);
    const token = jwt.sign({
      id: user._id,
      email: user.email,
      role: user.role
    }, process.env.JWT_SECRET || 'fallback-secret-key', {
      expiresIn: "7d"
    });
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.profile?.bio || "",
        profileImage: user.profile.avatar || user.profileUrl || "",
        phone: user.phone || "",
        referralCode: user.referralCode || "",
        status: user.status,
        emailVerified: user.emailVerified
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const safeUser = user.toJSON();
    res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { bio, website, social, avatar } = req.body;
    const userId = req.user.id;
    const profileUpdate = {};
    if (bio !== undefined) profileUpdate.bio = bio;
    if (website !== undefined) profileUpdate.website = website;
    if (social !== undefined) profileUpdate.social = social;
    if (avatar !== undefined) profileUpdate.avatar = avatar;
    const user = await User.findByIdAndUpdate(
      userId,
      { profile: profileUpdate },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: user.toJSON()
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update instructor profile with image upload
router.put("/instructor-profile",
  auth,
  (req, res, next) => {
    uploadProfileImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: "Authentication required"
        });
      }
      const { name, phone, bio } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name is required"
        });
      }
      if (!phone || !phone.trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required"
        });
      }
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      user.name = name.trim();
      user.phone = phone.trim();
      if (bio !== undefined) {
        user.profile.bio = bio.trim();
      }
      if (req.file) {
        try {
          const profileImageUrl = await uploadProfileImageToCloudinary(
            req.file.buffer,
            `profile_${user._id}_${Date.now()}`
          );
          user.profile.avatar = profileImageUrl;
          console.log('✅ Profile image uploaded to:', profileImageUrl);
        } catch (uploadError) {
          console.error('❌ Profile image upload failed:', uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload profile image"
          });
        }
      }
      await user.save();
      const safeUser = user.toJSON();
      res.json({
        success: true,
        message: "Profile updated successfully",
        user: safeUser
      });
    } catch (error) {
      console.error("❌ Error updating instructor profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Validate referral code
router.get("/validate-referral", async (req, res) => {
  try {
    const { email, code } = req.query;
    let referrer;
    if (email) {
      referrer = await User.findOne({ email: email.toLowerCase().trim() })
        .select("name email referralCode");
    } else if (code) {
      referrer = await User.findOne({ referralCode: code })
        .select("name email referralCode");
    } else {
      return res.status(400).json({
        success: false,
        message: "Email or referral code is required"
      });
    }
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: "Invalid referral code"
      });
    }
    res.json({
      success: true,
      name: referrer.name,
      email: referrer.email,
      referralCode: referrer.referralCode
    });
  } catch (error) {
    console.error('❌ Referral validation error:', error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Logout
router.post("/logout", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.lastActiveAt = Date.now();
      await user.save();
    }
    res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;