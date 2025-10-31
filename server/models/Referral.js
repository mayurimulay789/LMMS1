const mongoose = require("mongoose")

const referralSchema = new mongoose.Schema(
  {
    referralCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referred: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      reward: {
        type: Number,  // Reward amount in INR
        default: 0,
      },
      status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending",
      }
    }],
    rewardAmount: {
      type: Number,
      default: 100,  // Default reward amount in INR
    },
    totalRewardsEarned: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true,
  }
)

// Generate unique referral code based on user's name
referralSchema.statics.generateReferralCode = async function(userName) {
  const baseCode = userName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 6)
  
  const randomNum = Math.floor(Math.random() * 10000)
  const referralCode = `${baseCode}${randomNum}`
  
  // Check if code already exists
  const exists = await this.findOne({ referralCode })
  if (exists) {
    return this.generateReferralCode(userName) // Try again with different number
  }
  
  return referralCode
}

module.exports = mongoose.model("Referral", referralSchema)