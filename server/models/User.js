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
      return !this.isOAuthUser;
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
        if (!v) return true
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

// Virtuals
userSchema.virtual('fullName').get(function() {
  return this.name
})

userSchema.virtual('profileUrl').get(function() {
  if (this.profile.avatar) {
    if (this.profile.avatar.startsWith('http')) {
      return this.profile.avatar
    }
    return `${process.env.APP_URL || ''}/uploads/profiles/${this.profile.avatar}`
  }
  const initials = this.name.split(' ').map(n => n[0]).join('').toUpperCase()
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff`
})

// Password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false
  return await bcrypt.compare(candidatePassword, this.password)
}

// Role checks
userSchema.methods.isAdmin = function() {
  return this.role === 'admin'
}
userSchema.methods.isInstructor = function() {
  return this.role === 'instructor'
}

// --- OTP Methods ---
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  this.otp = crypto.createHash('sha256').update(otp).digest('hex')
  this.otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
  this.otpAttempts = 0
  this.otpBlockedUntil = null
  return otp
}

userSchema.methods.verifyOTP = async function(candidateOTP) {
  if (this.otpBlockedUntil && this.otpBlockedUntil > Date.now()) {
    return {
      valid: false,
      message: `OTP verification is blocked until ${new Date(this.otpBlockedUntil).toLocaleString()}`,
      blocked: true
    }
  }
  
  if (!this.otp || !this.otpExpires || this.otpExpires < Date.now()) {
    return {
      valid: false,
      message: "OTP has expired or doesn't exist",
      expired: true
    }
  }
  
  const hashedOTP = crypto.createHash('sha256').update(candidateOTP).digest('hex')
  
  if (hashedOTP !== this.otp) {
    this.otpAttempts += 1
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
  
  // Valid OTP – clear fields
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

userSchema.methods.clearOTP = async function() {
  this.otp = undefined
  this.otpExpires = undefined
  this.otpAttempts = 0
  this.otpBlockedUntil = undefined
  return this.save()
}

// --- Password Reset Token ---
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
  return resetToken
}

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

userSchema.methods.clearPasswordResetToken = function() {
  this.passwordResetToken = undefined
  this.passwordResetExpires = undefined
  return this
}

// --- Account Locking ---
userSchema.methods.isAccountLocked = function() {
  return this.accountLockedUntil && this.accountLockedUntil > Date.now()
}

userSchema.methods.recordLoginAttempt = async function(success, ip, userAgent) {
  if (success) {
    this.failedLoginAttempts = 0
    this.accountLockedUntil = undefined
    this.lastLoginAt = Date.now()
    this.lastActiveAt = Date.now()
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

userSchema.methods.updateLastActive = function() {
  this.lastActiveAt = Date.now()
  return this.save({ validateBeforeSave: false })
}

// --- Remove sensitive data ---
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
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
  userObject.fullName = this.fullName
  userObject.profileUrl = this.profileUrl
  return userObject
}

// --- Static helpers ---
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() })
}
userSchema.statics.findByReferralCode = function(code) {
  return this.findOne({ referralCode: code })
}
userSchema.statics.verifyEmail = async function(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: Date.now() }
  })
  if (!user) return null
  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationTokenExpires = undefined
  await user.save()
  return user
}

// --- Indexes (TTL on otpExpires REMOVED) ---
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true })
userSchema.index({ createdAt: -1 })
userSchema.index({ role: 1 })
userSchema.index({ status: 1 })
userSchema.index({ 'preferences.emailNotifications': 1 })
userSchema.index({ oauthId: 1, oauthProvider: 1 }, { sparse: true })

// ❌ DANGEROUS TTL INDEX REMOVED – DO NOT REINTRODUCE
// userSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 600 })

module.exports = mongoose.model("User", userSchema)