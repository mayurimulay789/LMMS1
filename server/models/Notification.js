const mongoose = require("mongoose")
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "message",
        "enrollment",
        "assignment",
        "grade",
        "announcement",
        "reminder",
        "certificate",
        "payment",
        "course_update",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    actionUrl: {
      type: String,
    },
    actionText: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)
// Index for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, isRead: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
// Mark as read when accessed
notificationSchema.pre("findOne", function () {
  if (this.getQuery()._id) {
    this.updateOne({}, { isRead: true, readAt: new Date() })
  }
})
module.exports = mongoose.model("Notification", notificationSchema)
