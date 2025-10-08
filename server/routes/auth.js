const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../middleware/auth")
const { sendWelcomeEmail, sendAdminSignupNotification } = require("../services/emailService_updated")

// Register user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    let user = existingUser
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
      })
      await user.save()

      // Send welcome email and admin notification only for student role
      if (user.role === 'student') {
        sendWelcomeEmail({ name: user.name, email: user.email, role: user.role }).catch(err => console.error('Welcome email failed:', err))
        sendAdminSignupNotification({ name: user.name, email: user.email, role: user.role, userId: user._id, password }).catch(err => console.error('Admin notification failed:', err))
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
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error" })
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
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get current logged-in user
router.get("/me", auth, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Authentication required" })
    const user = await User.findById(req.user.id).select("-password")
    res.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
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
    console.error("Profile update error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
