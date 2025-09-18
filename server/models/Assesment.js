// import mongoose from "mongoose"

// const questionSchema = new mongoose.Schema({
//   question: {
//     type: String,
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ["multiple-choice", "true-false", "short-answer"],
//     required: true,
//   },
//   options: [String], // For multiple choice questions
//   correctAnswer: {
//     type: String,
//     required: true,
//   },
//   explanation: String,
//   points: {
//     type: Number,
//     default: 1,
//   },
// })

// const assessmentSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     description: String,
//     course: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Course",
//       required: true,
//     },
//     moduleId: mongoose.Schema.Types.ObjectId,
//     questions: [questionSchema],
//     timeLimit: {
//       type: Number, // in minutes
//       default: 30,
//     },
//     passingScore: {
//       type: Number,
//       default: 70,
//       min: 0,
//       max: 100,
//     },
//     maxAttempts: {
//       type: Number,
//       default: 3,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     order: {
//       type: Number,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   },
// )

// const attemptSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     assessment: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Assessment",
//       required: true,
//     },
//     answers: [
//       {
//         questionId: mongoose.Schema.Types.ObjectId,
//         answer: String,
//         isCorrect: Boolean,
//         points: Number,
//       },
//     ],
//     score: {
//       type: Number,
//       min: 0,
//       max: 100,
//     },
//     passed: {
//       type: Boolean,
//       default: false,
//     },
//     startedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     completedAt: Date,
//     timeSpent: Number, // in seconds
//   },
//   {
//     timestamps: true,
//   },
// )

// export const Assessment = mongoose.model("Assessment", assessmentSchema)
// export const AssessmentAttempt = mongoose.model("AssessmentAttempt", attemptSchema)
