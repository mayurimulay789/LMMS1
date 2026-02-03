import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"


// Helper function to handle API responses
const handleApiResponse = async (response) => {
  const contentType = response.headers.get('content-type')
  
  if (!response.ok) {
    let errorMessage = 'Something went wrong'
    
    try {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`
      } else {
        const text = await response.text()
        errorMessage = `Server error: ${response.status} - ${text}`
      }
    } catch (e) {
      errorMessage = `Server error: ${response.status}`
    }
    
    throw new Error(errorMessage)
  }
  
  // Handle successful response
  if (contentType && contentType.includes('application/json')) {
    return await response.json()
  } else {
    return await response.text()
  }
}

// Async thunks for API calls
export const loginUser = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    console.log('Login request:', { email })
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await handleApiResponse(response)
    console.log('Login successful:', data)
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem("token", data.token)
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user))
    }




    
    return data
  } catch (error) {
    console.error('Login error:', error)
    return rejectWithValue(error.message)
  }
})

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, email, password, role = "student", referralCode = "" }, { rejectWithValue }) => {
    try {
      console.log('Registration request:', { name, email, role, referralCode })
      
      const requestBody = { 
        name, 
        email, 
        password, 
        role
      }
      
      // Only add referralCode if it's not empty
      if (referralCode && referralCode.trim() !== '') {
        requestBody.referralCode = referralCode
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Registration response status:', response.status)
      
      const data = await handleApiResponse(response)
      console.log('Registration successful:', data)
      
      // Store token and user data
      if (data.token) {
        localStorage.setItem("token", data.token)
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }
      
      return data
    } catch (error) {
      console.error('Registration error:', error)
      return rejectWithValue(error.message)
    }
  },
)

export const loadUser = createAsyncThunk("auth/loadUser", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No token found")
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await handleApiResponse(response)
    return data
  } catch (error) {
    // Clear invalid token
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return rejectWithValue(error.message)
  }
})

// Async thunk for uploading avatar
export const uploadAvatar = createAsyncThunk("auth/uploadAvatar", async (file, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No token found")
    }

    const formData = new FormData()
    formData.append("avatar", file)

    const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    const data = await handleApiResponse(response)
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.successMessage = null
    },
    clearError: (state) => {
      state.error = null
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem("user", JSON.stringify(state.user))
    },
    // Initialize auth state from localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem("token")
      const user = localStorage.getItem("user")
      
      if (token && user) {
        try {
          state.token = token
          state.user = JSON.parse(user)
          state.isAuthenticated = true
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
        state.successMessage = "Login successful!"
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.successMessage = null
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.successMessage = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
        state.successMessage = "Account created successfully! You are now logged in."
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.successMessage = null
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.error = null
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload
      })
      // Upload Avatar
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.user) {
          // Handle multiple possible response shapes from the upload endpoint
          const avatarUrl = action.payload?.data?.url || action.payload?.url || action.payload?.avatarUrl || null
          if (avatarUrl) {
            state.user.avatar = avatarUrl
            localStorage.setItem("user", JSON.stringify(state.user))
          }
        }
      })
  },
})

export const { logout, clearError, clearSuccessMessage, updateUser, initializeAuth } = authSlice.actions
export default authSlice.reducer