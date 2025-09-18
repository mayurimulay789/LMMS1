const mongoose = require("mongoose")

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    watchTime: {
      type: Number, // for video lessons, in seconds
      default: 0,
    },
    interactions: [
      {
        type: {
          type: String,
          enum: ["play", "pause", "seek", "complete", "bookmark"],
        },
        timestamp: {
          type: Number, // video timestamp in seconds
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bookmarks: [
      {
        timestamp: {
          type: Number, // video timestamp in seconds
        },
        note: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Compound index for efficient querying
progressSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true })
progressSchema.index({ user: 1, course: 1 })

// Auto-complete when progress reaches 100%
progressSchema.pre("save", function (next) {
  if (this.progress >= 100 && !this.isCompleted) {
    this.isCompleted = true
    this.completedAt = new Date()
  }
  next()
})

module.exports = mongoose.model("Progress", progressSchema)
