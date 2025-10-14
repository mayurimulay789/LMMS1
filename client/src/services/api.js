// API Base URL - supports different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                    import.meta.env.VITE_BACKEND_URL || 
                    (import.meta.env.DEV ? "http://localhost:2000/api" : "/api")

// Profile API functions
export const profileAPI = {
  // Update user profile
  updateProfile: async (profileData) => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update profile")
    }

    return response.json()
  },

  // Get current user profile
  getCurrentUser: async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch user data")
    }

    return response.json()
  },
}

export default profileAPI
