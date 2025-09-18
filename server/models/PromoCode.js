const mongoose = require("mongoose")

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    discountType: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maximumDiscount: {
      type: Number,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    userUsageLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isGlobal: {
      type: Boolean,
      default: true,
    },
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    applicableCategories: [
      {
        type: String,
        enum: ["Programming", "Design", "Marketing", "Business", "Creative", "Technology", "Health", "Language"],
      },
    ],
    excludedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    userRestrictions: {
      newUsersOnly: {
        type: Boolean,
        default: false,
      },
      existingUsersOnly: {
        type: Boolean,
        default: false,
      },
      specificUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      excludedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metadata: {
      campaign: String,
      source: String,
      medium: String,
      notes: String,
    },
    analytics: {
      totalRevenue: {
        type: Number,
        default: 0,
      },
      totalSavings: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
promoCodeSchema.index({ code: 1 },{ unique: true })
promoCodeSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 })
promoCodeSchema.index({ validUntil: 1 })
promoCodeSchema.index({ createdBy: 1 })

// Validation: validUntil must be after validFrom
promoCodeSchema.pre("save", function (next) {
  if (this.validUntil <= this.validFrom) {
    next(new Error("Valid until date must be after valid from date"))
  }

  // Ensure maximum discount is set for percentage discounts
  if (this.discountType === "percentage" && this.discountValue > 100) {
    next(new Error("Percentage discount cannot exceed 100%"))
  }

  next()
})

// Check if promo code is valid for a specific course and user
promoCodeSchema.methods.isValidFor = function (courseId, userId, orderAmount = 0) {
  const now = new Date()

  // Basic validations
  if (!this.isActive) return { valid: false, reason: "Promo code is inactive" }
  if (now < this.validFrom) return { valid: false, reason: "Promo code is not yet valid" }
  if (now > this.validUntil) return { valid: false, reason: "Promo code has expired" }
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: "Promo code usage limit exceeded" }
  }
  if (orderAmount < this.minimumAmount) {
    return { valid: false, reason: `Minimum order amount is $${this.minimumAmount}` }
  }

  // Course-specific validations
  if (!this.isGlobal) {
    if (this.applicableCourses.length > 0 && !this.applicableCourses.includes(courseId)) {
      return { valid: false, reason: "Promo code not applicable to this course" }
    }
    if (this.excludedCourses.includes(courseId)) {
      return { valid: false, reason: "Promo code not applicable to this course" }
    }
  }

  // User-specific validations would require additional database queries
  // This would typically be handled in the route handler

  return { valid: true }
}

// Calculate discount amount
promoCodeSchema.methods.calculateDiscount = function (amount) {
  let discount = 0

  if (this.discountType === "percentage") {
    discount = (amount * this.discountValue) / 100
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount
    }
  } else {
    discount = Math.min(this.discountValue, amount)
  }

  return Math.round(discount * 100) / 100 // Round to 2 decimal places
}

// Static method to find valid promo codes
promoCodeSchema.statics.findValidCodes = function (courseId = null) {
  const now = new Date()
  const query = {
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [{ usageLimit: { $exists: false } }, { $expr: { $lt: ["$usedCount", "$usageLimit"] } }],
  }

  if (courseId) {
    query.$or = [{ isGlobal: true }, { applicableCourses: courseId }]
    query.excludedCourses = { $ne: courseId }
  }

  return this.find(query).sort({ discountValue: -1 })
}

// Increment usage count
promoCodeSchema.methods.incrementUsage = function (amount = 0) {
  this.usedCount += 1
  this.analytics.totalRevenue += amount
  this.analytics.totalSavings += this.calculateDiscount(amount)

  // Calculate conversion rate
  if (this.usedCount > 0) {
    this.analytics.conversionRate = (this.usedCount / (this.usedCount + 10)) * 100 // Simplified calculation
  }

  return this.save()
}

module.exports = mongoose.model("PromoCode", promoCodeSchema)
