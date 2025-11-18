const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Referral = require("../models/Referral") // Add this import
const auth = require("../middleware/auth")
const { sendWelcomeEmail, sendAdminSignupNotification } = require("../services/emailService_updated")

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, referralCode } = req.body
    let referrer = null;

    console.log('Registration request:', { name, email, role, referralCode })

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    let user = existingUser

    // Validate referral code if provided
    if (referralCode) {
      // Find user by email for referral
      const referrerUser = await User.findOne({ email: referralCode })
      if (!referrerUser) {
        return res.status(400).json({ message: "Invalid referral code - user not found" })
      }
      referrer = referrerUser._id;
    }

    if (existingUser) {
      // If user exists but hasn't verified email (created via instructor approval), allow setting password
      if (!existingUser.isEmailVerified && !existingUser.password) {
        existingUser.name = name
        existingUser.password = password
        existingUser.role = role || existingUser.role
        existingUser.isEmailVerified = true
        await existingUser.save()
        user = existingUser
      } else {
        return res.status(400).json({ message: "User already exists" })
      }
    } else {
      // Create new user (password will be hashed by pre-save hook)
      user = new User({
        name,
        email,
        password,
        role: role || "student", // Use provided role or default to student
        isEmailVerified: true, // New registrations are verified
        referredBy: referrer, // Add referrer if referral code was used
      });
      await user.save();

      // Create referral code for the new user
      try {
        const newUserReferral = new Referral({
          referralCode: await Referral.generateReferralCode(name),
          referrer: user._id,
        });
        await newUserReferral.save();
      } catch (referralError) {
        console.error('Error creating referral code:', referralError)
        // Continue with registration even if referral creation fails
      }

      // Update referrer's referral record if referral code was used
      if (referrer) {
        try {
          await Referral.findOneAndUpdate(
            { referrer },
            { 
              $push: { 
                referred: {
                  user: user._id,
                  status: "pending"
                }
              }
            }
          );
        } catch (referralUpdateError) {
          console.error('Error updating referrer record:', referralUpdateError)
          // Continue with registration even if referral update fails
        }
      }

      // Send welcome email and admin notification only for student role
      if (user.role === 'student') {
        try {
          await sendWelcomeEmail({ name: user.name, email: user.email, role: user.role })
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError)
        }
        
        try {
          await sendAdminSignupNotification({ name: user.name, email: user.email, role: user.role, userId: user._id, password })
        } catch (adminEmailError) {
          console.error('Error sending admin notification:', adminEmailError)
        }
      }
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: "Server error" })
  }
})

// Validate referral code (email)
router.get("/validate-referral", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const referrer = await User.findOne({ email }).select("name email");
    
    if (!referrer) {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    res.json({
      name: referrer.name,
      email: referrer.email
    });
  } catch (error) {
    console.error('Referral validation error:', error)
    res.status(500).json({ message: "Server error" });
  }
});

// Get current logged-in user
router.get("/me", auth, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Authentication required" })
    const user = await User.findById(req.user.id).select("-password")
    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { bio, website, social, avatar } = req.body
    if (!req.user) return res.status(401).json({ message: "Authentication required" })
    const userId = req.user.id

    // Build profile object with only provided fields
    const profileUpdate = {}
    if (bio !== undefined) profileUpdate.bio = bio
    if (website !== undefined) profileUpdate.website = website
    if (social !== undefined) profileUpdate.social = social
    if (avatar !== undefined) profileUpdate.avatar = avatar

    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      { profile: profileUpdate },
      { new: true, runValidators: true }
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      message: "Profile updated successfully",
      user
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router