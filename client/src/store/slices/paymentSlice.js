import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiRequest } from "../../config/api"

export const createPaymentOrder = createAsyncThunk(
  "payment/createOrder",
  async ({ courseId, amount, promoCode, billingInfo }, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return rejectWithValue("No authentication token found")
      }

      const response = await apiRequest("payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, amount, promoCode, billingInfo }),
      })

      if (!response.ok) {
        return rejectWithValue(response.data?.message || "Failed to create payment order")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return rejectWithValue("No authentication token found")
      }

      const response = await apiRequest("payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        return rejectWithValue(response.data?.message || "Payment verification failed")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const fetchUserPayments = createAsyncThunk(
  "payment/fetchUserPayments",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return rejectWithValue("No authentication token found")
      }

      const response = await apiRequest("payments/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return rejectWithValue(response.data?.message || "Failed to fetch payment history")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const validatePromoCode = createAsyncThunk(
  "payment/validatePromoCode",
  async ({ code, courseId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return rejectWithValue("No authentication token found")
      }

      const response = await apiRequest("payments/validate-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, courseId }),
      })

      if (!response.ok) {
        return rejectWithValue(response.data?.message || "Invalid promo code")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const fetchAvailableOffers = createAsyncThunk(
  "payment/fetchAvailableOffers",
  async (courseId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return rejectWithValue("No authentication token found")
      }

      const response = await apiRequest(`payments/available-offers?courseId=${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return rejectWithValue(response.data?.message || "Failed to fetch offers")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

export const requestRefund = createAsyncThunk(
  "payment/requestRefund",
  async ({ paymentId, reason }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return rejectWithValue("No authentication token found")
      }

      const response = await apiRequest("payments/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentId, reason }),
      })

      if (!response.ok) {
        return rejectWithValue(response.data?.message || "Refund request failed")
      }

      return response.data
    } catch (error) {
      return rejectWithValue(error.message || "Network error")
    }
  },
)

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    orderId: null,
    paymentStatus: null,
    paymentHistory: [],
    promoCode: null,
    discount: 0,
    discountType: null,
    availableOffers: [],
    isLoading: false,
    isValidatingPromo: false,
    isFetchingOffers: false,
    error: null,
  },
  reducers: {
    clearPaymentState: (state) => {
      state.orderId = null
      state.paymentStatus = null
      state.error = null
      state.promoCode = null
      state.discount = 0
      state.discountType = null
    },
    clearPromo: (state) => {
      state.promoCode = null
      state.discount = 0
      state.discountType = null
      state.error = null
      state.isValidatingPromo = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Payment Order
      .addCase(createPaymentOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.orderId = action.payload.orderId
        state.error = null
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false
        state.paymentStatus = action.payload.status
        state.error = null
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Payment History
      .addCase(fetchUserPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.paymentHistory = action.payload
        state.error = null
      })
      .addCase(fetchUserPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Validate Promo Code
      .addCase(validatePromoCode.pending, (state) => {
        state.isValidatingPromo = true
        state.error = null
      })
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        state.isValidatingPromo = false
        state.promoCode = action.payload.code
        state.discount = action.payload.discount
        state.discountType = action.payload.discountType || null
        state.error = null
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.isValidatingPromo = false
        state.promoCode = null
        state.discount = 0
        state.discountType = null
        state.error = action.payload
      })
      // Fetch Available Offers
      .addCase(fetchAvailableOffers.pending, (state) => {
        state.isFetchingOffers = true
        state.error = null
      })
      .addCase(fetchAvailableOffers.fulfilled, (state, action) => {
        state.isFetchingOffers = false
        state.availableOffers = action.payload.offers || []
        state.error = null
      })
      .addCase(fetchAvailableOffers.rejected, (state, action) => {
        state.isFetchingOffers = false
        state.availableOffers = []
        state.error = action.payload
      })
      // Request Refund
      .addCase(requestRefund.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestRefund.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(requestRefund.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearPaymentState, clearPromo, clearError } = paymentSlice.actions
export default paymentSlice.reducer