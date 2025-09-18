import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const fetchAssessments = createAsyncThunk(
  "assessment/fetchAssessments",
  async (courseId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`http://localhost:5000/api/assessments/${courseId}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message)
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const submitAssessment = createAsyncThunk(
  "assessment/submitAssessment",
  async ({ assessmentId, answers }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`http://localhost:5000/api/assessments/${assessmentId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        const error = await response.json()
        return rejectWithValue(error.message)
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

const assessmentSlice = createSlice({
  name: "assessment",
  initialState: {
    assessments: [],
    currentAssessment: null,
    results: {},
    isLoading: false,
    isSubmitting: false,
    error: null,
  },
  reducers: {
    setCurrentAssessment: (state, action) => {
      state.currentAssessment = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assessments
      .addCase(fetchAssessments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.isLoading = false
        state.assessments = action.payload
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Submit Assessment
      .addCase(submitAssessment.pending, (state) => {
        state.isSubmitting = true
        state.error = null
      })
      .addCase(submitAssessment.fulfilled, (state, action) => {
        state.isSubmitting = false
        const { assessmentId, score, feedback, passed } = action.payload
        state.results[assessmentId] = { score, feedback, passed }
      })
      .addCase(submitAssessment.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload
      })
  },
})

export const { setCurrentAssessment, clearError } = assessmentSlice.actions
export default assessmentSlice.reducer
