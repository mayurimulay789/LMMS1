const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Course = require("../models/Course")
const Message = require("../models/Message")
const Notification = require("../models/Notification")

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error("Authentication error"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      return next(new Error("User not found"))
    }

    socket.userId = user._id.toString()
    socket.user = user
    next()
  } catch (error) {
    next(new Error("Authentication error"))
  }
}

// Initialize socket handlers
const initializeSocket = (io) => {
  // Authentication middleware
  io.use(authenticateSocket)

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.name} connected: ${socket.id}`)

    // Join user to their personal room
    socket.join(`user_${socket.userId}`)

    // Update user online status
    updateUserOnlineStatus(socket.userId, true)

    // Handle joining course rooms
    socket.on("join_course", async (courseId) => {
      try {
        const course = await Course.findById(courseId)
        if (!course) return

        // Check if user is enrolled
        const isEnrolled = await checkUserEnrollment(socket.userId, courseId)
        if (!isEnrolled && socket.user.role !== "admin" && socket.user.role !== "instructor") {
          return socket.emit("error", { message: "Not enrolled in this course" })
        }

        socket.join(`course_${courseId}`)
        socket.currentCourse = courseId

        // Send course activity data
        const activeUsers = await getActiveCourseUsers(courseId)
        socket.emit("course_activity", { activeUsers, courseId })

        // Notify others in the course
        socket.to(`course_${courseId}`).emit("user_joined_course", {
          userId: socket.userId,
          userName: socket.user.name,
          userAvatar: socket.user.avatar,
        })
      } catch (error) {
        socket.emit("error", { message: "Failed to join course" })
      }
    })

    // Handle real-time chat messages
    socket.on("send_message", async (data) => {
      try {
        const { courseId, message, type = "text", replyTo } = data

        // Validate user enrollment
        const isEnrolled = await checkUserEnrollment(socket.userId, courseId)
        if (!isEnrolled && socket.user.role !== "admin" && socket.user.role !== "instructor") {
          return socket.emit("error", { message: "Not authorized to send messages" })
        }

        // Create message
        const newMessage = new Message({
          sender: socket.userId,
          course: courseId,
          content: message,
          type,
          replyTo,
          timestamp: new Date(),
        })

        await newMessage.save()
        await newMessage.populate("sender", "name avatar role")

        // Send to all users in the course
        io.to(`course_${courseId}`).emit("new_message", {
          _id: newMessage._id,
          sender: newMessage.sender,
          content: newMessage.content,
          type: newMessage.type,
          replyTo: newMessage.replyTo,
          timestamp: newMessage.timestamp,
          courseId,
        })

        // Send push notification to offline users
        await sendMessageNotifications(courseId, socket.userId, message)
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    // Handle typing indicators
    socket.on("typing_start", (data) => {
      socket.to(`course_${data.courseId}`).emit("user_typing", {
        userId: socket.userId,
        userName: socket.user.name,
        courseId: data.courseId,
      })
    })

    socket.on("typing_stop", (data) => {
      socket.to(`course_${data.courseId}`).emit("user_stop_typing", {
        userId: socket.userId,
        courseId: data.courseId,
      })
    })

    // Handle quiz/poll responses
    socket.on("submit_poll_response", async (data) => {
      try {
        const { pollId, response, courseId } = data

        // Save response to database
        await savePollResponse(pollId, socket.userId, response)

        // Send real-time poll results to instructor
        const pollResults = await getPollResults(pollId)
        io.to(`course_${courseId}`).emit("poll_results_update", {
          pollId,
          results: pollResults,
          totalResponses: pollResults.totalResponses,
        })
      } catch (error) {
        socket.emit("error", { message: "Failed to submit poll response" })
      }
    })

    // Handle progress tracking
    socket.on("update_progress", async (data) => {
      try {
        const { courseId, lessonId, progress, timeSpent } = data

        await updateUserProgress(socket.userId, courseId, lessonId, progress, timeSpent)

        // Notify instructors of student progress
        socket.to(`course_${courseId}`).emit("student_progress_update", {
          studentId: socket.userId,
          studentName: socket.user.name,
          lessonId,
          progress,
          timeSpent,
        })
      } catch (error) {
        socket.emit("error", { message: "Failed to update progress" })
      }
    })

    // Handle real-time notifications
    socket.on("mark_notification_read", async (data) => {
      try {
        const { notificationId } = data
        await Notification.findByIdAndUpdate(notificationId, { isRead: true })

        socket.emit("notification_updated", { notificationId, isRead: true })
      } catch (error) {
        socket.emit("error", { message: "Failed to update notification" })
      }
    })

    // Handle course enrollment notifications
    socket.on("course_enrolled", async (data) => {
      try {
        const { courseId } = data
        const course = await Course.findById(courseId).populate("instructor", "name")

        // Notify instructor
        io.to(`user_${course.instructor._id}`).emit("new_enrollment", {
          studentId: socket.userId,
          studentName: socket.user.name,
          courseName: course.title,
          courseId,
        })
      } catch (error) {
        console.error("Failed to send enrollment notification:", error)
      }
    })

    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log(`User ${socket.user.name} disconnected: ${socket.id}`)

      // Update user offline status
      await updateUserOnlineStatus(socket.userId, false)

      // Leave current course
      if (socket.currentCourse) {
        socket.to(`course_${socket.currentCourse}`).emit("user_left_course", {
          userId: socket.userId,
          userName: socket.user.name,
        })
      }
    })
  })
}

// Helper functions
const checkUserEnrollment = async (userId, courseId) => {
  const Enrollment = require("../models/Enrollment")
  const enrollment = await Enrollment.findOne({ user: userId, course: courseId })
  return !!enrollment
}

const updateUserOnlineStatus = async (userId, isOnline) => {
  await User.findByIdAndUpdate(userId, {
    isOnline,
    lastSeen: new Date(),
  })
}

const getActiveCourseUsers = async (courseId) => {
  const Enrollment = require("../models/Enrollment")
  const enrollments = await Enrollment.find({ course: courseId }).populate("user", "name avatar isOnline lastSeen")

  return enrollments.map((e) => e.user).filter((user) => user.isOnline)
}

const sendMessageNotifications = async (courseId, senderId, message) => {
  // Implementation for push notifications to offline users
  const Enrollment = require("../models/Enrollment")
  const enrollments = await Enrollment.find({ course: courseId }).populate("user", "name email fcmToken isOnline")

  const offlineUsers = enrollments
    .map((e) => e.user)
    .filter((user) => !user.isOnline && user._id.toString() !== senderId)

  // Create notifications for offline users
  for (const user of offlineUsers) {
    const notification = new Notification({
      recipient: user._id,
      type: "message",
      title: "New Message",
      message: `New message in course chat: ${message.substring(0, 50)}...`,
      data: { courseId, senderId },
    })
    await notification.save()
  }
}

const savePollResponse = async (pollId, userId, response) => {
  const PollResponse = require("../models/PollResponse")
  await PollResponse.findOneAndUpdate(
    { poll: pollId, user: userId },
    { response, submittedAt: new Date() },
    { upsert: true },
  )
}

const getPollResults = async (pollId) => {
  const PollResponse = require("../models/PollResponse")
  const responses = await PollResponse.find({ poll: pollId })

  // Aggregate results based on poll type
  const results = {}
  responses.forEach((response) => {
    if (results[response.response]) {
      results[response.response]++
    } else {
      results[response.response] = 1
    }
  })

  return {
    results,
    totalResponses: responses.length,
  }
}

const updateUserProgress = async (userId, courseId, lessonId, progress, timeSpent) => {
  const Progress = require("../models/Progress")
  await Progress.findOneAndUpdate(
    { user: userId, course: courseId, lesson: lessonId },
    {
      progress,
      timeSpent,
      lastAccessed: new Date(),
    },
    { upsert: true },
  )
}

module.exports = { initializeSocket }
