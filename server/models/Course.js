const mongoose = require("mongoose")

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    videoUrl: String,
    videoPublicId: String, // Cloudinary public ID for video
    thumbnailUrl: String, // Auto-generated video thumbnail
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    order: {
      type: Number,
      required: true,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    resources: [
      {
        title: String,
        url: String,
        publicId: String, // Cloudinary public ID
        type: {
          type: String,
          enum: ["pdf", "video", "link", "document", "image"],
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },
    instructor: {
      type: String,
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    category: {
      type: String,
      required: true,
      enum: ["Programming", "Design", "Marketing", "Business", "Creative", "Technology", "Health", "Language"],
    },
    subcategory: String,
    level: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    thumbnail: {
      type: String,
      required: true,
    },
    thumbnailPublicId: String, // Cloudinary public ID for thumbnail
    previewVideo: String,
    previewVideoPublicId: String, // Cloudinary public ID for preview video
    images: [
      {
        url: String,
        publicId: String, // Cloudinary public ID
      },
    ],
    duration: {
      type: Number, // total duration in minutes
      default: 0,
    },
    lessons: [lessonSchema],
    totalLessons: {
      type: Number,
      default: 0,
    },
    requirements: [String],
    whatYouWillLearn: [String],
    targetAudience: [String],
    tags: [String],
    language: {
      type: String,
      default: "English",
    },
    subtitles: [String],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default:true,
    },
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to your User model
    required: true
  },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["draft", "review", "published", "archived"],
      default: "published",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    certificate: {
      available: {
        type: Boolean,
        default: true,
      },
      passingScore: {
        type: Number,
        default: 70,
      },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      
    },
    slug: {
  type: String,
  sparse: true,   // Remove unique: true here
},
    analytics: {
      views: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
      },
      averageWatchTime: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better performance
courseSchema.index({ category: 1, level: 1 })
courseSchema.index({ price: 1 })
courseSchema.index({ rating: -1 })
courseSchema.index({ enrollmentCount: -1 })
courseSchema.index({ isPublished: 1, status: 1 })
courseSchema.index({ "seo.slug": 1 }, { unique: true, sparse: true })
courseSchema.index({ tags: 1 })
courseSchema.index({ createdAt: -1 })

// Text search index
courseSchema.index({
  title: "text",
  description: "text",
  instructor: "text",
  tags: "text",
})

// Virtual for average rating calculation
courseSchema.virtual("averageRating").get(function () {
  if (this.reviews.length === 0) return 0
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / this.reviews.length) * 10) / 10
})

// Update rating and review count before saving
courseSchema.pre("save", function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0)
    this.rating = Math.round((sum / this.reviews.length) * 10) / 10
    this.reviewCount = this.reviews.length
  }

  // Update total lessons count
  if (this.lessons) {
    this.totalLessons = this.lessons.length
    this.duration = this.lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)
  }

  // Generate slug if not provided
  if (!this.seo.slug && this.title) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  next()
})

// Static method to get popular courses
courseSchema.statics.getPopularCourses = function (limit = 10) {
  return this.find({ isPublished: true, isPopular: true }).sort({ enrollmentCount: -1, rating: -1 }).limit(limit)
}

// Static method to get courses by category
courseSchema.statics.getCoursesByCategory = function (category, limit = 20) {
  return this.find({
    category: category,
    isPublished: true,
  })
    .sort({ rating: -1, enrollmentCount: -1 })
    .limit(limit)
}

// Instance method to add review
courseSchema.methods.addReview = function (userId, rating, comment, isVerifiedPurchase = false) {
  // Check if user already reviewed
  const existingReview = this.reviews.find((review) => review.user.toString() === userId.toString())

  if (existingReview) {
    // Update existing review
    existingReview.rating = rating
    existingReview.comment = comment
    existingReview.isVerifiedPurchase = isVerifiedPurchase
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      rating,
      comment,
      isVerifiedPurchase,
    })
  }

  return this.save()
}

// Instance method to remove review
courseSchema.methods.removeReview = function (userId) {
  this.reviews = this.reviews.filter((review) => review.user.toString() !== userId.toString())
  return this.save()
}

module.exports = mongoose.model("Course", courseSchema)
