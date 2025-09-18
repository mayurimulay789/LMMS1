import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchEnrolledCourses = createAsyncThunk(
  "courses/fetchEnrolled",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch("/api/enrollments/me", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch enrolled courses")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchUserProgress = createAsyncThunk(
  "courses/fetchProgress",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/progress/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch progress")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const updateProgress = createAsyncThunk(
  "courses/updateProgress",
  async ({ courseId, lessonId, progress }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch("/api/progress/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ courseId, lessonId, progress }),
      })

      if (!response.ok) {
        throw new Error("Failed to update progress")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchCertificates = createAsyncThunk(
  "courses/fetchCertificates",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/certificates/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch certificates")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const initialState = {
  enrolledCourses: [],
  userProgress: {},
  certificates: [],
  isLoading: false,
  error: null,
}

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Enrolled Courses
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.isLoading = false
        state.enrolledCourses = action.payload
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Progress
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.userProgress = action.payload
      })
      // Update Progress
      .addCase(updateProgress.fulfilled, (state, action) => {
        const { courseId, progress } = action.payload
        state.userProgress[courseId] = progress
      })
      // Fetch Certificates
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload
      })
  },
})

export const { clearError } = courseSlice.actions
export default courseSlice.reducer
