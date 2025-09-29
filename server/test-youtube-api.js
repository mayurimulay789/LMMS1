const axios = require("axios")
const { extractYouTubeVideoId, parseISO8601Duration } = require("./utils/videoUtils")

/**
 * Test YouTube API integration
 * This script tests the YouTube Data API v3 integration
 */

// Test video URLs
const testUrls = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Roll (4:13)
  "https://youtu.be/dQw4w9WgXcQ", // Short YouTube URL
  "https://www.youtube.com/embed/dQw4w9WgXcQ", // Embed URL
  "https://www.youtube.com/watch?v=invalid123", // Invalid video ID
]

async function testYouTubeAPI() {
  console.log("🧪 Testing YouTube API Integration")
  console.log("=====================================")

  // Test video ID extraction
  console.log("\n1. Testing Video ID Extraction:")
  testUrls.forEach((url, index) => {
    const videoId = extractYouTubeVideoId(url)
    console.log(`   URL ${index + 1}: ${url}`)
    console.log(`   Video ID: ${videoId || "❌ Not found"}`)
    console.log("")
  })

  // Test ISO 8601 duration parsing
  console.log("\n2. Testing ISO 8601 Duration Parsing:")
  const testDurations = [
    "PT1H25M5S", // 1 hour, 25 minutes, 5 seconds
    "PT30M", // 30 minutes
    "PT45S", // 45 seconds
    "PT2H30M45S", // 2 hours, 30 minutes, 45 seconds
    "PT5M30S", // 5 minutes, 30 seconds
  ]

  testDurations.forEach((duration, index) => {
    const seconds = parseISO8601Duration(duration)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const secs = seconds % 60

    console.log(`   Duration ${index + 1}: ${duration}`)
    console.log(`   Parsed: ${seconds} seconds = ${hours}h ${mins}m ${secs}s`)
    console.log("")
  })

  // Test actual API call (requires API key)
  console.log("\n3. Testing YouTube Data API Call:")
  console.log("   ⚠️  This test requires a valid YOUTUBE_API_KEY in your .env file")

  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    console.log("   ❌ YOUTUBE_API_KEY not found in environment variables")
    console.log("   Please add YOUTUBE_API_KEY to your .env file")
    console.log("   You can get an API key from: https://console.cloud.google.com/")
    return
  }

  console.log("   ✅ API key found, testing with sample video...")

  try {
    const testVideoId = "dQw4w9WgXcQ" // Rick Roll
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos`
    const params = {
      part: 'contentDetails',
      id: testVideoId,
      key: apiKey
    }

    console.log(`   Fetching data for video ID: ${testVideoId}`)

    const response = await axios.get(apiUrl, { params })

    if (response.data.items && response.data.items.length > 0) {
      const videoData = response.data.items[0]
      const duration = videoData.contentDetails.duration

      console.log(`   ✅ API Response received`)
      console.log(`   Duration: ${duration}`)

      const seconds = parseISO8601Duration(duration)
      console.log(`   Parsed duration: ${seconds} seconds (${Math.floor(seconds / 60)} minutes)`)
    } else {
      console.log("   ❌ Video not found in API response")
    }
  } catch (error) {
    console.log("   ❌ API call failed:")
    if (error.response) {
      console.log(`   Status: ${error.response.status}`)
      console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`)

      if (error.response.status === 403) {
        console.log("   💡 This usually means:")
        console.log("      - API key is invalid")
        console.log("      - API key doesn't have YouTube Data API enabled")
        console.log("      - API quota exceeded")
      }
    } else {
      console.log(`   Error: ${error.message}`)
    }
  }

  console.log("\n4. Setup Instructions:")
  console.log("   1. Go to Google Cloud Console: https://console.cloud.google.com/")
  console.log("   2. Create a new project or select existing one")
  console.log("   3. Enable YouTube Data API v3")
  console.log("   4. Create credentials (API Key)")
  console.log("   5. Add YOUTUBE_API_KEY to your .env file")
  console.log("   6. Restart your server")

  console.log("\n5. API Limits:")
  console.log("   - Free quota: 10,000 units per day")
  console.log("   - Each API call costs 1 unit")
  console.log("   - Consider implementing caching for production use")
}

// Run the test
testYouTubeAPI().catch(console.error)
