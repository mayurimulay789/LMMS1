const https = require('https')
const http = require('http')
const { URL } = require('url')

/**
 * Validates if a URL is accessible and returns basic metadata
 * @param {string} url - The URL to validate
 * @returns {Promise<object>} - Returns validation result with metadata
 */
const validateUrl = async (url) => {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url)
      const protocol = urlObj.protocol === 'https:' ? https : http
      
      const req = protocol.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
        resolve({
          isValid: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'] || '',
          contentLength: res.headers['content-length'] || 0,
          isImage: (res.headers['content-type'] || '').startsWith('image/'),
          isVideo: (res.headers['content-type'] || '').startsWith('video/'),
          url: url
        })
      })

      req.on('error', () => {
        resolve({
          isValid: false,
          error: 'Network error or invalid URL',
          url: url
        })
      })

      req.on('timeout', () => {
        req.destroy()
        resolve({
          isValid: false,
          error: 'Request timeout',
          url: url
        })
      })

      req.end()
    } catch (error) {
      resolve({
        isValid: false,
        error: 'Invalid URL format',
        url: url
      })
    }
  })
}

/**
 * Checks if a URL is a YouTube URL and extracts video ID
 * @param {string} url - The URL to check
 * @returns {object} - Returns YouTube info
 */
const getYouTubeInfo = (url) => {
  if (!url) return { isYouTube: false }
  
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/
  const isYouTube = youtubeRegex.test(url)
  
  if (!isYouTube) return { isYouTube: false }
  
  let videoId = null
  
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0]
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0]
  }
  
  return {
    isYouTube: true,
    videoId,
    thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
    embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }
}

module.exports = {
  validateUrl,
  getYouTubeInfo
}