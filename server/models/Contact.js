const mongoose = require("mongoose")
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    category: {
      type: String,
      enum: ["general", "support", "billing", "technical", "partnership", "feedback"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed"],
      default: "new",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    response: {
      message: String,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: Date,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      referrer: String,
      source: {
        type: String,
        enum: ["website", "mobile", "api"],
        default: "website",
      },
    },
    tags: [String],
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)
// Indexes
contactSchema.index({ email: 1 })
contactSchema.index({ status: 1 })
contactSchema.index({ category: 1 })
contactSchema.index({ priority: 1 })
contactSchema.index({ createdAt: -1 })
contactSchema.index({ isRead: 1 })
// Text search index
contactSchema.index({
  name: "text",
  email: "text",
  subject: "text",
  message: "text",
})
// Mark as read method
contactSchema.methods.markAsRead = function (userId) {
  this.isRead = true
  this.readAt = new Date()
  this.readBy = userId
  return this.save()
}
// Add response method
contactSchema.methods.addResponse = function (message, respondedBy) {
  this.response = {
    message,
    respondedBy,
    respondedAt: new Date(),
  }
  this.status = "resolved"
  return this.save()
}
// Static method to get unread count
contactSchema.statics.getUnreadCount = function () {
  return this.countDocuments({ isRead: false })
}
// Static method to get contacts by status
contactSchema.statics.getByStatus = function (status) {
  return this.find({ status }).sort({ createdAt: -1 })
}
module.exports = mongoose.model("Contact", contactSchema)
