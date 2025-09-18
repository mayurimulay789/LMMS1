import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Dashboard Stats
export const fetchAdminStats = createAsyncThunk("admin/fetchStats", async (_, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState()
    const response = await fetch("/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch admin stats")
    }

    const data = await response.json()
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// User Management
export const fetchUsers = createAsyncThunk("admin/fetchUsers", async (params, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState()
    const queryParams = new URLSearchParams(params).toString()
    const response = await fetch(`/api/admin/users?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    const data = await response.json()
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const updateUserStatus = createAsyncThunk(
  "admin/updateUserStatus",
  async ({ userId, status }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update user status")
      }

      const data = await response.json()
      return { userId, ...data }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const resetUserPassword = createAsyncThunk(
  "admin/resetUserPassword",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to reset password")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

// Course Management
export const fetchAdminCourses = createAsyncThunk(
  "admin/fetchCourses",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const queryParams = new URLSearchParams(params).toString()
      const response = await fetch(`/api/admin/courses?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch courses")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const createCourse = createAsyncThunk(
  "admin/createCourse",
  async (courseData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(courseData),
      })

      if (!response.ok) {
        throw new Error("Failed to create course")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const updateCourse = createAsyncThunk(
  "admin/updateCourse",
  async ({ courseId, courseData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(courseData),
      })

      if (!response.ok) {
        throw new Error("Failed to update course")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const uploadFile = createAsyncThunk("admin/uploadFile", async (formData, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState()
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload file")
    }

    const data = await response.json()
    return data
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

// Reports
export const fetchProgressStats = createAsyncThunk(
  "admin/fetchProgressStats",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const queryParams = new URLSearchParams(params).toString()
      const response = await fetch(`/api/admin/progress/stats?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch progress stats")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const exportReport = createAsyncThunk(
  "admin/exportReport",
  async ({ type, format, params }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const queryParams = new URLSearchParams({ ...params, format }).toString()
      const response = await fetch(`/api/admin/reports/${type}/export?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export report")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-report.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  stats: {
    totalUsers: 0,
    totalCourses: 0,
    totalPayments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    completionRate: 0,
  },
  users: [],
  courses: [],
  progressStats: [],
  isLoading: false,
  isUploading: false,
  isExporting: false,
  error: null,
}

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, status } = action.payload
        const user = state.users.find((u) => u.id === userId)
        if (user) {
          user.status = status
        }
      })
      // Courses
      .addCase(fetchAdminCourses.fulfilled, (state, action) => {
        state.courses = action.payload
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.push(action.payload)
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex((c) => c.id === action.payload.id)
        if (index !== -1) {
          state.courses[index] = action.payload
        }
      })
      // Upload
      .addCase(uploadFile.pending, (state) => {
        state.isUploading = true
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.isUploading = false
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isUploading = false
        state.error = action.payload
      })
      // Reports
      .addCase(fetchProgressStats.fulfilled, (state, action) => {
        state.progressStats = action.payload
      })
      .addCase(exportReport.pending, (state) => {
        state.isExporting = true
      })
      .addCase(exportReport.fulfilled, (state) => {
        state.isExporting = false
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.isExporting = false
        state.error = action.payload
      })
  },
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer
