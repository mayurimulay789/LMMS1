import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiRequest } from "../../config/api"

export const fetchUserEnrollments = createAsyncThunk(
  "enrollment/fetchUserEnrollments",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await apiRequest("enrollments/me", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchUserProgress = createAsyncThunk(
  "enrollment/fetchUserProgress",
  async (courseId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await apiRequest(`enrollments/progress/${courseId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      const data = await response.json()
      return { courseId, progress: data.progress }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchUserCertificates = createAsyncThunk(
  "enrollment/fetchUserCertificates",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await apiRequest("certificates/me", {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const updateProgress = createAsyncThunk(
  "enrollment/updateProgress",
  async ({ courseId, lessonId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await apiRequest("enrollments/progress", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ courseId, lessonId }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState: {
    enrollments: [],
    progress: {},
    certificates: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Enrollments
      .addCase(fetchUserEnrollments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserEnrollments.fulfilled, (state, action) => {
        state.isLoading = false
        state.enrollments = action.payload
      })
      .addCase(fetchUserEnrollments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Progress
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        const { courseId, progress } = action.payload
        state.progress[courseId] = progress
      })
      // Fetch Certificates
      .addCase(fetchUserCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload
      })
      // Update Progress
      .addCase(updateProgress.fulfilled, (state, action) => {
        const { courseId, progress } = action.payload
        state.progress[courseId] = progress
      })
  },
})

export const { clearError } = enrollmentSlice.actions
export default enrollmentSlice.reducer
