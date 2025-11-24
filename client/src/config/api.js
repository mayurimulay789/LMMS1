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

// Generic API fetch wrapper with enhanced error handling
export const apiRequest = async (url, options = {}) => {
  const fullUrl = url.startsWith('http') ? url : createApiUrl(url);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers
      },
      credentials: 'include' // Include credentials for CORS
    });

    if (!response.ok) {
      console.error(
        `API Request Failed: ${response.status} ${response.statusText} for ${fullUrl}`
      );
      const errBody = await response.text().catch(() => null);
      const err = new Error(`HTTP error! status: ${response.status}`);
      err.response = { status: response.status, statusText: response.statusText, body: errBody };
      throw err;
    }

    const data = await response.json().catch(() => null);
    return { data, status: response.status, ok: response.ok };
  } catch (error) {
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