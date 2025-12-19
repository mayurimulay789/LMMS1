import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiRequest } from "../../config/api"
import { updateUser } from "./authSlice"

// Async thunk for updating profile
export const updateProfile = createAsyncThunk(
  "profile/update",
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return rejectWithValue("No token found")
      }

      const response = await apiRequest("auth/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      // `apiRequest` returns an object: { data, status, ok }
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid API response')
      }

      // If backend returned updated user, update auth slice immediately
      if (response.data && response.data.user) {
        try {
          dispatch(updateUser(response.data.user))
          // Also update localStorage for consistency
          localStorage.setItem('user', JSON.stringify(response.data.user))
        } catch (e) {
          console.warn('Failed to dispatch updateUser from updateProfile:', e)
        }
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    isLoading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearProfileError: (state) => {
      state.error = null
    },
    clearProfileSuccess: (state) => {
      state.success = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = false
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.success = false
      })
  },
})

export const { clearProfileError, clearProfileSuccess } = profileSlice.actions
export default profileSlice.reducer
