// API Base URL - supports different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                    import.meta.env.VITE_BACKEND_URL || 
                    (import.meta.env.DEV ? "http://localhost:2000/api" : "/api")

// Create API configuration
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true' || import.meta.env.DEV
}

// API helper function
export const createApiUrl = (endpoint) => {
  // Remove leading slash and /api prefix from endpoint if present
  const cleanEndpoint = endpoint.replace(/^\/?(api\/)?/, '')
  return `${API_BASE_URL}/${cleanEndpoint}`
}

// Generic API fetch wrapper
export const apiRequest = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : createApiUrl(url)
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  } catch (error) {
    if (apiConfig.enableLogging) {
      console.error('API Request Error:', error)
    }
    throw error
  }
}

export default API_BASE_URL