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

const moduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subcourses: [lessonSchema],
    order: {
      type: Number,
      required: true,
    },
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
      required: true,
    },
    instructorImage: {
      type: String, // URL to instructor image for this course
    },
    instructorImagePublicId: {
      type: String, // Cloudinary public ID for instructor image
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
      default: "https://via.placeholder.com/400x225?text=Course+Thumbnail",
    },
    thumbnailPublicId: String, // Cloudinary public ID for thumbnail
    thumbnailSource: {
      type: String,
      enum: ["upload", "link"],
      default: "upload"
    },
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
    modules: [moduleSchema],
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
    avgRating: {        // 🔹 add this
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
courseSchema.index({ category: 1, level: 1, status: 1 })
courseSchema.index({ price: 1, status: 1 })
courseSchema.index({ rating: -1, status: 1 })
courseSchema.index({ enrollmentCount: -1, status: 1 })
courseSchema.index({ isPublished: 1, status: 1 })
courseSchema.index({ "seo.slug": 1 }, { unique: true, sparse: true })
courseSchema.index({ tags: 1, status: 1 })
courseSchema.index({ createdAt: -1, status: 1 })
courseSchema.index({ title: 1, description: 1 })  // For text search performance
courseSchema.index({ status: 1, isPublished: 1, category: 1 }) // Compound index for main filters

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

// Pre-save hook to calculate lesson durations and total course duration
courseSchema.pre("save", async function (next) {
  try {
    // Calculate rating and review count
    if (this.reviews && this.reviews.length > 0) {
      const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0)
      this.rating = Math.round((sum / this.reviews.length) * 10) / 10
      this.reviewCount = this.reviews.length
    }

    // Update total lessons count
    if (this.modules) {
      this.totalLessons = this.modules.reduce((acc, module) => acc + module.subcourses.length, 0)

      // Calculate total duration from subcourses
      this.duration = this.modules.reduce((acc, module) =>
        acc + module.subcourses.reduce((modAcc, lesson) => modAcc + (lesson.duration || 0), 0), 0
      )
    }

    // Generate slug if not provided
    if (!this.seo.slug && this.title) {
      this.seo.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    }

    next()
  } catch (error) {
    console.error("Error in course pre-save hook:", error)
    next(error)
  }
})

// Pre-save hook specifically for calculating lesson durations from video URLs
courseSchema.pre("save", async function (next) {
  try {
    const { calculateLessonsDurations } = require("../utils/videoUtils")

    // Calculate durations for subcourses with video URLs
    if (this.modules && this.modules.length > 0) {
      try {
        let allSubcourses = []
        this.modules.forEach(module => {
          allSubcourses = [...allSubcourses, ...module.subcourses]
        })
        const totalSubcourses = allSubcourses.length
        console.log(`Calculating durations for ${totalSubcourses} subcourses in course: ${this.title}`)

        // Check if any subcourse has a video URL but duration is 0 or missing
        const needsDurationCalculation = allSubcourses.some(lesson =>
          lesson.videoUrl && (lesson.duration === 0 || lesson.duration === undefined || lesson.duration === null)
        )

        if (needsDurationCalculation) {
          const result = await calculateLessonsDurations(allSubcourses)
          // Update subcourses back into modules
          let subcourseIndex = 0
          this.modules.forEach(module => {
            module.subcourses = result.lessons.slice(subcourseIndex, subcourseIndex + module.subcourses.length)
            subcourseIndex += module.subcourses.length
          })
          this.duration = result.totalDuration
          console.log(`Successfully calculated durations. Total course duration: ${this.duration} minutes`)
        } else {
          // Recalculate total duration from existing subcourse durations
          this.duration = allSubcourses.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)
          console.log(`Recalculated total course duration: ${this.duration} minutes`)
        }
      } catch (durationError) {
        console.error("Error calculating subcourse durations in pre-save:", durationError)
        // Continue with save even if duration calculation fails
        // Recalculate total duration from existing subcourse durations as fallback
        let allSubcourses = []
        this.modules.forEach(module => {
          allSubcourses = [...allSubcourses, ...module.subcourses]
        })
        this.duration = allSubcourses.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)
      }
    }

    next()
  } catch (error) {
    console.error("Error in lesson duration pre-save hook:", error)
    next()
  }
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

// Instance method to recalculate durations
courseSchema.methods.recalculateDurations = async function () {
  try {
    const { calculateLessonsDurations } = require("../utils/videoUtils")

    if (this.modules && this.modules.length > 0) {
      let allSubcourses = []
      this.modules.forEach(module => {
        allSubcourses = [...allSubcourses, ...module.subcourses]
      })
      const result = await calculateLessonsDurations(allSubcourses)
      // Update subcourses back into modules
      let subcourseIndex = 0
      this.modules.forEach(module => {
        module.subcourses = result.lessons.slice(subcourseIndex, subcourseIndex + module.subcourses.length)
        subcourseIndex += module.subcourses.length
      })
      this.duration = result.totalDuration
      await this.save()
      console.log(`Recalculated durations for course: ${this.title}`)
      return true
    }
    return false
  } catch (error) {
    console.error("Error recalculating durations:", error)
    return false
  }
}

// Static method to recalculate durations for all courses
courseSchema.statics.recalculateAllDurations = async function () {
  try {
    const courses = await this.find({ "modules.subcourses.videoUrl": { $exists: true, $ne: "" } })
    console.log(`Found ${courses.length} courses with video URLs to recalculate`)

    const results = {
      success: 0,
      failed: 0,
      errors: []
    }

    for (const course of courses) {
      try {
        const updated = await course.recalculateDurations()
        if (updated) {
          results.success++
        } else {
          results.failed++
        }
      } catch (error) {
        console.error(`Error recalculating durations for course ${course.title}:`, error)
        results.failed++
        results.errors.push({
          courseId: course._id,
          courseTitle: course.title,
          error: error.message
        })
      }
    }

    console.log(`Duration recalculation completed: ${results.success} success, ${results.failed} failed`)
    return results
  } catch (error) {
    console.error("Error in recalculateAllDurations:", error)
    throw error
  }
}

module.exports = mongoose.model("Course", courseSchema)