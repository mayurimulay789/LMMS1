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
  sendTestEmail 
} = require("../services/emailService_updated");
const { uploadProfileImageToCloudinary } = require("../utils/cloudinary");
const { uploadProfileImage } = require("../middleware/uploadMiddleware");
const crypto = require("crypto");

// ✅ FIXED: Proper rate limiter configuration for OTP
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many OTP requests. Please try again after 10 minutes.",
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use IP and user agent for identification
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    return ip + userAgent;
  }
});

// ✅ FIXED: Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ FIXED: Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour
  message: "Too many registration attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Test Email Route
router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for test"
      });
    }
    
    console.log('📧 Testing email to:', email);
    
    const result = await sendTestEmail({ email });
    
    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      data: result
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Simple test route
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Auth routes are working!",
    timestamp: new Date().toISOString()
  });
});

// Register user
router.post("/register", registerLimiter, async (req, res) => {
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

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    let user = existingUser;

    // Validate referral code if provided
    if (referralCode) {
      // Check if referralCode is an email or a referral code
      let referrerUser;
      if (referralCode.includes('@')) {
        // If it looks like an email
        referrerUser = await User.findOne({ email: referralCode.toLowerCase().trim() });
      } else {
        // If it's a referral code
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

    if (existingUser) {
      // If user exists but hasn't verified email
      if (!existingUser.isEmailVerified && !existingUser.password) {
        existingUser.name = name;
        existingUser.password = password;
        existingUser.role = userRole;
        existingUser.isEmailVerified = true;
        existingUser.isOAuthUser = false;
        await existingUser.save();
        user = existingUser;
        console.log('✅ Updated existing unverified user');
      } else {
        return res.status(400).json({ 
          success: false,
          message: "User already exists" 
        });
      }
    } else {
      // Create new user
      user = new User({
        name,
        email: email.toLowerCase().trim(),
        password,
        role: userRole,
        isEmailVerified: true,
        isOAuthUser: false,
        referredBy: referrer,
      });
      await user.save();

      console.log('✅ User created:', user._id);

      // Create referral code for new user (if not auto-generated in pre-save)
      if (!user.referralCode) {
        try {
          // Use email prefix + random number
          const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
          const randomNum = Math.floor(100 + Math.random() * 900);
          const userReferralCode = `${emailPrefix}${randomNum}`;
          
          // Check if referral code already exists
          const existingCode = await User.findOne({ referralCode: userReferralCode });
          if (existingCode) {
            // If exists, generate a random one
            user.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
          } else {
            user.referralCode = userReferralCode;
          }
          
          await user.save();
          console.log('✅ Referral code created:', user.referralCode);
        } catch (referralError) {
          console.error('⚠️ Error creating referral code:', referralError.message);
          // Continue even if referral fails
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

      // Send welcome email and admin notification for students
      if (user.role === 'student') {
        try {
          await sendWelcomeEmail({ 
            name: user.name, 
            email: user.email, 
            role: user.role 
          });
          console.log('✅ Welcome email sent');
        } catch (emailError) {
          console.error('⚠️ Error sending welcome email:', emailError.message);
        }
        
        try {
          // ✅ FIXED: Don't send password in admin notification
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
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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

// ✅ FIXED: Search user by email and send OTP for password reset
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

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    // For security, return same response whether user exists or not
    if (!user) {
      console.log('❌ User not found with email:', normalizedEmail);
      return res.status(200).json({
        success: true,
        message: "If your email exists in our system, you will receive OTP instructions",
        otpSent: false
      });
    }

    console.log('✅ User found:', {
      email: user.email,
      id: user._id,
      isEmailVerified: user.isEmailVerified
    });

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log('⚠️ Email not verified for:', user.email);
      return res.status(400).json({
        success: false,
        message: "Please verify your email first before resetting password",
        emailVerified: false
      });
    }
    // Generate OTP using model method
    const otp = user.generateOTP();
    await user.save();
    
    console.log('🔢 Generated OTP for', user.email, ':', otp);

    // Send OTP via email
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
      
      // Clear OTP if email fails
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

// ✅ FIXED: Reset password with OTP
router.post("/resetpasswordwithotp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    console.log('🔄 Password reset request for:', email);

    // Validation
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

    // Find user by email
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

    // Verify OTP using model method
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

    // Update password
    user.password = newPassword;
    user.lastPasswordChange = Date.now();
    await user.save();
    
    console.log('✅ Password updated');

    // Send confirmation email
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

// ✅ FIXED: Verify OTP (first step)
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔐 OTP verification request for:', email);

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
      console.log('❌ User not found for OTP verification:', email);
      return res.status(400).json({
        success: false,
        message: "Invalid email or OTP",
      });
    }

    console.log('✅ User found for OTP verification');

    // Verify OTP using model method
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

    // Generate a short-lived reset token for password reset step
    const resetToken = user.createPasswordResetToken();
    await user.save();

    console.log('🔑 Reset token generated for user:', user.email);

    // Return success with reset token (for next step)
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      otpVerified: true,
      resetToken: resetToken, // Send this token to frontend for password reset
      email: user.email,
      expiresIn: "10 minutes" // Token expiry time
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

// ✅ FIXED: Set new password (second step - requires reset token)
router.post("/set-new-password", async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    console.log('🔄 Setting new password for:', email);

    // Validation
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

    // Find user by email
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

    // Verify reset token
    if (!user.verifyPasswordResetToken(resetToken)) {
      console.log('❌ Invalid or expired reset token');
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new OTP.",
        tokenExpired: true
      });
    }

    console.log('✅ Reset token verified successfully');

    // Update password
    user.password = newPassword;
    user.lastPasswordChange = Date.now();
    
    // Clear reset token
    user.clearPasswordResetToken();
    
    await user.save();
    
    console.log('✅ Password updated successfully');

    // Send confirmation email
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

// Login user
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return res.status(400).json({
        success: false,
        message: "Account is temporarily locked due to too many failed attempts",
        locked: true,
        lockedUntil: user.accountLockedUntil
      });
    }

    // Check if account is active
    if (user.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Account is ${user.status}. Please contact support.`,
        status: user.status
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    // Record login attempt
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

    // Check if email is verified
    if (!user.isEmailVerified) {
      console.log('⚠️ Email not verified');
      return res.status(400).json({
        success: false,
        message: "Please verify your email before logging in",
        emailVerified: false
      });
    }

    console.log('✅ Login successful for:', email);

    // Generate JWT token
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
        isEmailVerified: user.isEmailVerified,
        status: user.status
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
    
    // Use toJSON method to get safe user object
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

    // Build profile update
    const profileUpdate = {};
    if (bio !== undefined) profileUpdate.bio = bio;
    if (website !== undefined) profileUpdate.website = website;
    if (social !== undefined) profileUpdate.social = social;
    if (avatar !== undefined) profileUpdate.avatar = avatar;

    // Update user
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
      
      // Validation
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

      // Update user data
      user.name = name.trim();
      user.phone = phone.trim();
      if (bio !== undefined) {
        user.profile.bio = bio.trim();
      }

      // Handle profile image
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

      // Response with safe user object
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
    
    // Support both email and referral code validation
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

// Logout (client-side token invalidation)
router.post("/logout", auth, async (req, res) => {
  try {
    // Update last active time
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