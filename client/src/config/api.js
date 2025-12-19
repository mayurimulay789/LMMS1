// API Base URL - supports different environments with fallback
const getApiBaseUrl = () => {
  // Check for environment-specific URLs first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  // Fallback logic based on current location
  if (typeof window !== 'undefined') {
    const currentHost = window.location.host;
    const currentProtocol = window.location.protocol;

    // If we're on the production domain, use production API
    if (currentHost.includes('rymaacademy.cloud')) {
      return 'https://online.rymaacademy.cloud/api';
    }

    // If we're on localhost, use production API (for testing)
    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
      return 'https://online.rymaacademy.cloud/api';
    }

    // Dynamic API URL based on current host
    return `${currentProtocol}//${currentHost}/api`;
  }

  // Default fallback
  return import.meta.env.DEV
    ? 'https://online.rymaacademy.cloud/api'
    : 'https://online.rymaacademy.cloud/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create API configuration
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true' || import.meta.env.DEV
};

// API helper function
export const createApiUrl = (endpoint) => {
  // Remove leading slash and /api prefix from endpoint if present
  const cleanEndpoint = endpoint.replace(/^\/?(api\/)?/, '');
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Check if request body is FormData (for file uploads)
const isFormData = (body) => {
  return body && body instanceof FormData;
};

// Generic API fetch wrapper with enhanced error handling
export const apiRequest = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : createApiUrl(url);
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Prepare headers
  const headers = {
    Accept: 'application/json',
    ...options.headers
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // For FormData requests (file uploads), let browser set Content-Type
  if (isFormData(options.body)) {
    // Remove Content-Type header for FormData - browser will set it with boundary
    delete headers['Content-Type'];
  } else {
    // For non-FormData requests, set Content-Type to JSON
    headers['Content-Type'] = 'application/json';
  }

  try {
    console.log(`[API] ${options.method || 'GET'} ${fullUrl}`);
    const response = await fetch(fullUrl, {
      ...options,
      headers: headers,
      credentials: 'include' // Include credentials for CORS
    });

    console.log(`[API] Response status: ${response.status} for ${fullUrl}`); 
    if (!response.ok) {
      console.error(
        `[API] Request Failed: ${response.status} ${response.statusText} for ${fullUrl}`
      );
      
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('[API] Error data:', errorData);    
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If response is not JSON, get text
        try {
          const textError = await response.text();
          if (textError) {
            errorMessage = textError;
            console.error('[API] Error text:', textError);          
          }
          console.log(`Error ${e}`)
        } catch (textErr) {
          console.error(`[API] Could not parse error response ${textErr}`);        
        }
      }
      
      const err = new Error(errorMessage);
      err.response = {
        status: response.status,
        statusText: response.statusText,
        url: fullUrl
      };
      throw err;
    }

    let data = null;
    try {
      data = await response.json();
      console.log(`[API] Response data received for ${fullUrl}`);
    } catch (jsonErr) {
      console.warn('[API] Response is not JSON:', jsonErr);
    }
    return {
      ok: response.ok,
      status: response.status,
      data: data,
      json: () => Promise.resolve(data)
    };
  } catch (error) {
    console.error('[API] Request error:', error);
    if (apiConfig.enableLogging) {
      console.error('API Request Error:', {
        url: fullUrl,
        error: error.message,
        options: options
      });
    }
    throw error;
  }
};

// Specialized upload function for file uploads
export const uploadFile = async (file, endpoint, fieldName = 'file') => {
  const formData = new FormData();
  formData.append(fieldName, file);

  if (apiConfig.enableLogging) {
    console.log('📤 Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      endpoint: endpoint
    });
  }

  return apiRequest(endpoint, {
    method: 'POST',
    body: formData
  });
};

// Specialized upload functions for specific use cases
export const uploadCourseThumbnail = async (file) => {
  return uploadFile(file, 'upload/course-media', 'thumbnail');
};

export const uploadLessonVideo = async (file) => {
  return uploadFile(file, 'upload/lesson-video', 'video');
};

export const uploadCertificate = async (file) => {
  return uploadFile(file, 'upload/certificate', 'certificate');
};

export const uploadCoursePreview = async (file) => {
  return uploadFile(file, 'upload/course-preview', 'coursePreview');
};

// If axios is available, create an axios instance and export as default so
// components that expect `api.get/post/put` (axios-like) continue to work.
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: apiConfig.timeout,
  withCredentials: true
});

// Add request interceptor to include Authorization header
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // For FormData requests, let browser set Content-Type
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Optional: simple request/response logging when enabled
if (apiConfig.enableLogging) {
  axiosInstance.interceptors.request.use((cfg) => {
    console.debug('[API Request]', cfg.method?.toUpperCase(), cfg.url, cfg);
    return cfg;
  });
  axiosInstance.interceptors.response.use(
    (res) => {
      console.debug('[API Response]', res.status, res.config.url, res.data);
      return res;
    },
    (err) => {
      console.error('[API Response Error]', err?.response?.status, err?.config?.url, err?.message);
      return Promise.reject(err);
    }
  );
}

export default axiosInstance;