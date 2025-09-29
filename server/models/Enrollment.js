const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
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
  // 👇 make payment optional
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: false,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  // 👇 allow in-progress as valid status
  status: {
    type: String,
    enum: ["active", "completed", "suspended", "in-progress"], // add in-progress
    default: "in-progress",
  },
  progress: {
    completedLessons: [
      {
        lessonId: String,
        completedAt: Date,
      },
    ],
    totalLessons: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false,
    },
    issuedAt: Date,
    certificateId: String,
  },
});

// Ensure unique enrollment per user per course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
