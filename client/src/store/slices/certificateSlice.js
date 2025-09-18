import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const generateCertificate = createAsyncThunk(
  "certificates/generate",
  async ({ courseId, userId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ courseId, userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate certificate")
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const downloadCertificate = createAsyncThunk(
  "certificates/download",
  async (certificateId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch(`/api/certificates/${certificateId}/download`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to download certificate")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `certificate-${certificateId}.pdf`
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
  certificates: [],
  isGenerating: false,
  isDownloading: false,
  error: null,
}

const certificateSlice = createSlice({
  name: "certificates",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateCertificate.pending, (state) => {
        state.isGenerating = true
        state.error = null
      })
      .addCase(generateCertificate.fulfilled, (state, action) => {
        state.isGenerating = false
        state.certificates.push(action.payload)
      })
      .addCase(generateCertificate.rejected, (state, action) => {
        state.isGenerating = false
        state.error = action.payload
      })
      .addCase(downloadCertificate.pending, (state) => {
        state.isDownloading = true
      })
      .addCase(downloadCertificate.fulfilled, (state) => {
        state.isDownloading = false
      })
      .addCase(downloadCertificate.rejected, (state, action) => {
        state.isDownloading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = certificateSlice.actions
export default certificateSlice.reducer
