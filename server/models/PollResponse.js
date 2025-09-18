const mongoose = require("mongoose")

const pollResponseSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure one response per user per poll
pollResponseSchema.index({ poll: 1, user: 1 }, { unique: true })

module.exports = mongoose.model("PollResponse", pollResponseSchema)
