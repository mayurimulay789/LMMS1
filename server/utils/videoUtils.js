const { cloudinary } = require("../config/cloudinary")
const axios = require("axios")

/**
 * Extract video duration from Cloudinary video URL
 * @param {string} videoUrl - Cloudinary video URL
 * @returns {Promise<number>} - Duration in seconds
 */
const getVideoDuration = async (videoUrl) => {
  try {
    // Check if it's a YouTube URL
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      console.log("YouTube URL detected - using YouTube API for duration calculation")
      return await getYouTubeVideoDuration(videoUrl)
    }

    // Handle Cloudinary URLs
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
 * Get duration from YouTube video URL using YouTube Data API v3
 * @param {string} videoUrl - YouTube video URL
 * @returns {Promise<number>} - Duration in seconds
 */
const getYouTubeVideoDuration = async (videoUrl) => {
  try {
    // Extract video ID from YouTube URL
    const videoId = extractYouTubeVideoId(videoUrl)

    if (!videoId) {
      console.error("Could not extract video ID from YouTube URL:", videoUrl)
      return 0
    }

    // Get YouTube API key from environment variables
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      console.error("YouTube API key not found in environment variables")
      console.log("Please set YOUTUBE_API_KEY in your .env file")
      console.log("YouTube video ID:", videoId, "- Using default duration (5 minutes)")
      return 300 // Default 5 minutes when API key is not available
    }

    // Make API request to YouTube Data API v3
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos`
    const params = {
      part: 'contentDetails',
      id: videoId,
      key: apiKey
    }

    console.log(`Fetching duration for YouTube video ID: ${videoId}`)

    const response = await axios.get(apiUrl, { params })

    if (response.data.items && response.data.items.length > 0) {
      const videoData = response.data.items[0]
      const duration = videoData.contentDetails.duration

      if (duration) {
        const seconds = parseISO8601Duration(duration)
        console.log(`YouTube video duration: ${seconds} seconds (${Math.floor(seconds / 60)} minutes)`)
        return seconds
      } else {
        console.warn("No duration found in YouTube API response for video:", videoId)
        return 0
      }
    } else {
      console.error("Video not found in YouTube API response for ID:", videoId)
      return 0
    }
  } catch (error) {
    console.error("Error getting YouTube video duration:", error.message)

    // Log specific error types for debugging
    if (error.response) {
      console.error("YouTube API Error:", error.response.status, error.response.data)
      if (error.response.status === 403) {
        console.error("YouTube API quota exceeded or API key invalid")
      } else if (error.response.status === 404) {
        console.error("YouTube video not found")
      }
    } else if (error.request) {
      console.error("Network error - no response received from YouTube API")
    }

    return 0
  }
}

/**
 * Parse ISO 8601 duration string to seconds
 * @param {string} duration - ISO 8601 duration (e.g., "PT1H25M5S")
 * @returns {number} - Duration in seconds
 */
const parseISO8601Duration = (duration) => {
  try {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

    if (!match) {
      console.error("Invalid ISO 8601 duration format:", duration)
      return 0
    }

    const hours = parseInt(match[1] || 0)
    const minutes = parseInt(match[2] || 0)
    const seconds = parseInt(match[3] || 0)

    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    return totalSeconds
  } catch (error) {
    console.error("Error parsing ISO 8601 duration:", error)
    return 0
  }
}

/**
 * Extract video ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
const extractYouTubeVideoId = (url) => {
  try {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return null
  } catch (error) {
    console.error("Error extracting YouTube video ID:", error)
    return null
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

/**
 * Calculate duration for a single lesson
 * @param {Object} lesson - Lesson object with videoUrl
 * @returns {Promise<number>} - Duration in minutes
 */
const calculateLessonDuration = async (lesson) => {
  try {
    if (!lesson.videoUrl) {
      console.log(`No video URL for lesson: ${lesson.title}`)
      return 0
    }

    console.log(`Calculating duration for lesson: ${lesson.title}`)
    const durationInSeconds = await getVideoDuration(lesson.videoUrl)
    const durationInMinutes = convertSecondsToMinutes(durationInSeconds)

    console.log(`Lesson "${lesson.title}" duration: ${durationInMinutes} minutes (${durationInSeconds} seconds)`)
    return durationInMinutes
  } catch (error) {
    console.error(`Error calculating duration for lesson "${lesson.title}":`, error.message)
    return 0
  }
}

/**
 * Calculate durations for multiple lessons
 * @param {Array} lessons - Array of lesson objects
 * @returns {Promise<Object>} - Object with updated lessons and total duration
 */
const calculateLessonsDurations = async (lessons) => {
  try {
    let totalDuration = 0
    const updatedLessons = []

    console.log(`Processing ${lessons.length} lessons for duration calculation...`)

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i]

      if (lesson.videoUrl) {
        const duration = await calculateLessonDuration(lesson)
        lesson.duration = duration
        totalDuration += duration
      } else {
        // Keep existing duration for lessons without video URLs
        totalDuration += lesson.duration || 0
      }

      updatedLessons.push(lesson)
    }

    return {
      lessons: updatedLessons,
      totalDuration: totalDuration
    }
  } catch (error) {
    console.error('Error calculating lessons durations:', error)
    throw error
  }
}

module.exports = {
  getVideoDuration,
  extractPublicIdFromUrl,
  extractYouTubeVideoId,
  getYouTubeVideoDuration,
  parseISO8601Duration,
  convertSecondsToMinutes,
  updateLessonDuration,
  calculateLessonDuration,
  calculateLessonsDurations,
}
