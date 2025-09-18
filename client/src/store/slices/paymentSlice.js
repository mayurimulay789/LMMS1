import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

export const createPaymentOrder = createAsyncThunk(
  "payment/createOrder",
  async ({ courseId, amount, promoCode, billingInfo }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch("http://localhost:5000/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ courseId, amount, promoCode, billingInfo }),
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

export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async (paymentData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch("http://localhost:5000/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(paymentData),
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

export const fetchUserPayments = createAsyncThunk(
  "payment/fetchUserPayments",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch("http://localhost:5000/api/payments/history", {
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

export const validatePromoCode = createAsyncThunk(
  "payment/validatePromoCode",
  async ({ code, courseId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch("http://localhost:5000/api/payments/validate-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ code, courseId }),
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

export const requestRefund = createAsyncThunk(
  "payment/requestRefund",
  async ({ paymentId, reason }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState()
      const response = await fetch("http://localhost:5000/api/payments/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ paymentId, reason }),
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

const paymentSlice = createSlice({
  name: "payment",
  initialState: {
    orderId: null,
    paymentStatus: null,
    paymentHistory: [],
    promoCode: null,
    discount: 0,
    isLoading: false,
    isValidatingPromo: false,
    error: null,
  },
  reducers: {
    clearPaymentState: (state) => {
      state.orderId = null
      state.paymentStatus = null
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
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Verify Payment
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.paymentStatus = action.payload.status
      })
      // Fetch Payment History
      .addCase(fetchUserPayments.fulfilled, (state, action) => {
        state.paymentHistory = action.payload
      })
      // Validate Promo Code
      .addCase(validatePromoCode.pending, (state) => {
        state.isValidatingPromo = true
      })
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        state.isValidatingPromo = false
        state.promoCode = action.payload.code
        state.discount = action.payload.discount
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.isValidatingPromo = false
        state.promoCode = null
        state.discount = 0
        state.error = action.payload
      })
  },
})

export const { clearPaymentState } = paymentSlice.actions
export default paymentSlice.reducer
