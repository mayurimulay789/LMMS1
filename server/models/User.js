const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

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
  },
  password: {
    type: String,
    required: function() {
      return this.isEmailVerified; // Password required only when email is verified
    },
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student",
  },
  profile: {
    avatar: String,
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
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: Date,
})

// Hash password before saving (only if modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", userSchema)
