const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  referralCode: {
    type: String,
    sparse: true,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  referralRewards: {
    earned: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: {
    type: String,
    required: function() {
      return !this.isOAuthUser; // Password not required for OAuth users
    },
    minlength: 6,
    select: false
  },
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  oauthProvider: {
    type: String,
    enum: ["google", "github", null],
    default: null
  },
  oauthId: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: String,
    website: String,
    social: {
      linkedin: String,
      twitter: String,
      github: String,
    },
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    marketingEmails: {
      type: Boolean,
      default: false,
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true // Optional field
        const digits = v.replace(/\D/g, '');
        return digits.length >= 10;
      },
      message: props => `${props.value} is not a valid phone number! Must have at least 10 digits.`
    }
  },
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date,
  
  // Password Reset Fields
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // OTP Fields
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  otpBlockedUntil: {
    type: Date,
    select: false
  },
  
  // Account Status
  status: {
    type: String,
    enum: ["active", "suspended", "deactivated"],
    default: "active",
  },
  
  // Security
  lastPasswordChange: {
    type: Date,
    default: Date.now,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  accountLockedUntil: Date,
  
  // Activity Tracking
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: Date,
  lastActiveAt: Date,
})

// Middleware to update updatedAt timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  
  // Generate referral code if not exists
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase()
  }
  
  next()
})

// Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
  // Skip password hashing for OAuth users or if password not modified
  if (this.isOAuthUser || !this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    this.lastPasswordChange = Date.now()
    next()
  } catch (error) {
    next(error)
  }
})

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name
})

// Virtual for profile URL
userSchema.virtual('profileUrl').get(function() {
  if (this.profile.avatar) {
    // Handle both absolute URLs and relative paths
    if (this.profile.avatar.startsWith('http')) {
      return this.profile.avatar
    }
    return `${process.env.APP_URL || ''}/uploads/profiles/${this.profile.avatar}`
  }
  // Generate default avatar based on name
  const initials = this.name.split(' ').map(n => n[0]).join('').toUpperCase()
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff`
})

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin'
}

// Method to check if user is instructor
userSchema.methods.isInstructor = function() {
  return this.role === 'instructor'
}

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Hash the OTP before saving
  this.otp = crypto.createHash('sha256').update(otp).digest('hex')
  this.otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
  this.otpAttempts = 0
  this.otpBlockedUntil = null
  
  return otp
}

// Method to verify OTP
userSchema.methods.verifyOTP = async function(candidateOTP) {
  // Check if OTP is blocked
  if (this.otpBlockedUntil && this.otpBlockedUntil > Date.now()) {
    return {
      valid: false,
      message: `OTP verification is blocked until ${new Date(this.otpBlockedUntil).toLocaleString()}`,
      blocked: true
    }
  }
  
  // Check if OTP exists and is not expired
  if (!this.otp || !this.otpExpires || this.otpExpires < Date.now()) {
    return {
      valid: false,
      message: "OTP has expired or doesn't exist",
      expired: true
    }
  }
  
  // Hash the candidate OTP and compare
  const hashedOTP = crypto.createHash('sha256').update(candidateOTP).digest('hex')
  
  if (hashedOTP !== this.otp) {
    // Increment failed attempts
    this.otpAttempts += 1
    
    // Block after 5 failed attempts for 15 minutes
    if (this.otpAttempts >= 5) {
      this.otpBlockedUntil = Date.now() + 15 * 60 * 1000 // 15 minutes
      await this.save()
      return {
        valid: false,
        message: "Too many failed attempts. OTP verification is blocked for 15 minutes.",
        blocked: true
      }
    }
    
    await this.save()
    return {
      valid: false,
      message: `Invalid OTP. ${5 - this.otpAttempts} attempts remaining.`,
      attemptsLeft: 5 - this.otpAttempts
    }
  }
  
  // OTP is valid, clear OTP data
  this.otp = undefined
  this.otpExpires = undefined
  this.otpAttempts = 0
  this.otpBlockedUntil = undefined
  
  await this.save()
  return {
    valid: true,
    message: "OTP verified successfully"
  }
}

// Method to clear OTP
userSchema.methods.clearOTP = async function() {
  this.otp = undefined
  this.otpExpires = undefined
  this.otpAttempts = 0
  this.otpBlockedUntil = undefined
  return this.save()
}

// Method to generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex')
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex')
    
  this.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  
  return verificationToken
}

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex')
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
  
  return resetToken
}

// Method to verify password reset token
userSchema.methods.verifyPasswordResetToken = function(token) {
  if (!this.passwordResetToken || !this.passwordResetExpires) return false
  
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
    
  return (
    this.passwordResetToken === hashedToken &&
    this.passwordResetExpires > Date.now()
  )
}

// Method to clear password reset token
userSchema.methods.clearPasswordResetToken = function() {
  this.passwordResetToken = undefined
  this.passwordResetExpires = undefined
  return this
}

// Method to check if account is locked
userSchema.methods.isAccountLocked = function() {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now()
}

// Method to record login attempt
userSchema.methods.recordLoginAttempt = async function(success, ip, userAgent) {
  if (success) {
    this.failedLoginAttempts = 0
    this.accountLockedUntil = undefined
    this.lastLoginAt = Date.now()
    this.lastActiveAt = Date.now()
    
    // Add to login history (keep last 10 logins)
    this.loginHistory.unshift({ 
      ip: ip || 'Unknown', 
      userAgent: userAgent || 'Unknown', 
      timestamp: Date.now() 
    })
    if (this.loginHistory.length > 10) {
      this.loginHistory = this.loginHistory.slice(0, 10)
    }
  } else {
    this.failedLoginAttempts += 1
    if (this.failedLoginAttempts >= 5) {
      this.accountLockedUntil = Date.now() + 15 * 60 * 1000 // 15 minutes
    }
  }
  
  return this.save()
}

// Method to update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActiveAt = Date.now()
  return this.save({ validateBeforeSave: false })
}

// Method to get user data without sensitive information
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  
  // Remove sensitive data
  delete userObject.password
  delete userObject.otp
  delete userObject.otpExpires
  delete userObject.otpAttempts
  delete userObject.otpBlockedUntil
  delete userObject.emailVerificationToken
  delete userObject.emailVerificationTokenExpires
  delete userObject.passwordResetToken
  delete userObject.passwordResetExpires
  delete userObject.failedLoginAttempts
  delete userObject.accountLockedUntil
  delete userObject.__v
  
  // Add virtuals
  userObject.fullName = this.fullName
  userObject.profileUrl = this.profileUrl
  
  return userObject
}

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() })
}

// Static method to find by referral code
userSchema.statics.findByReferralCode = function(code) {
  return this.findOne({ referralCode: code })
}

// Static method to verify and mark email
userSchema.statics.verifyEmail = async function(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  
  const user = await this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() }
  })
  
  if (!user) {
    return null
  }
  
  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationTokenExpires = undefined
  
  await user.save()
  return user
}

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true })
userSchema.index({ createdAt: -1 })
userSchema.index({ role: 1 })
userSchema.index({ status: 1 })
userSchema.index({ 'preferences.emailNotifications': 1 })
userSchema.index({ oauthId: 1, oauthProvider: 1 }, { sparse: true })

// Create a TTL index for OTP expiry
userSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 600 })

module.exports = mongoose.model("User", userSchema)