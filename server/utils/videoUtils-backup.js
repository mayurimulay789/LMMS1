const { cloudinary } = require("../config/cloudinary")

/**
 * Extract video duration from Cloudinary video URL
 * @param {string} videoUrl - Cloudinary video URL
 * @returns {Promise<number>} - Duration in seconds
 */
const getVideoDuration = async (videoUrl) => {
  try {
    // Extract public ID from Cloudinary URL
    const publicId = extractPublicIdFromUrl(videoUrl)

    if (!publicId) {
      console.error("Could not extract public ID from video URL:", videoUrl)
      return 0
    }

    // Get video details from Cloudinary
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
    })

    return result.duration || 0
  } catch (error) {
    console.error("Error getting video duration:", error)
    return 0
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if not found
 */
const extractPublicIdFromUrl = (url) => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/video/upload/v{version}/{public_id}.{format}
    const matches = url.match(/\/v\d+\/(.+)\./)
    return matches ? matches[1] : null
  } catch (error) {
    console.error("Error extracting public ID:", error)
    return null
  }
}

/**
 * Convert seconds to minutes (rounded up)
 * @param {number} seconds - Duration in seconds
 * @returns {number} - Duration in minutes
 */
const convertSecondsToMinutes = (seconds) => {
  return Math.ceil(seconds / 60)
}

/**
 * Update lesson duration in database
 * @param {string} lessonId - Lesson ID
 * @param {number} durationInMinutes - Duration in minutes
 * @returns {Promise<boolean>} - Success status
 */
const updateLessonDuration = async (lessonId, durationInMinutes) => {
  try {
    const Course = require("../models/Course")

    // Find course containing the lesson and update it
    const course = await Course.findOneAndUpdate(
      { "lessons._id": lessonId },
      {
        $set: { "lessons.$.duration": durationInMinutes },
        $inc: { duration: durationInMinutes } // This might need adjustment based on existing duration
      },
      { new: true }
    )

    if (!course) {
      console.error("Course not found for lesson:", lessonId)
      return false
    }

    // Recalculate total course duration
    const totalDuration = course.lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)
    await Course.findByIdAndUpdate(course._id, { duration: totalDuration })

    return true
  } catch (error) {
    console.error("Error updating lesson duration:", error)
    return false
  }
}

module.exports = {
  getVideoDuration,
  extractPublicIdFromUrl,
  convertSecondsToMinutes,
  updateLessonDuration,
}
