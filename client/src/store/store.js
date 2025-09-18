import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import coursesReducer from "./slices/courseSlice"
import enrollmentReducer from "./slices/enrollmentSlice"
import assessmentReducer from "./slices/assesmentSlice"
import forumReducer from "./slices/forumSlice"
import paymentReducer from "./slices/paymentSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
    enrollment: enrollmentReducer,
    assessment: assessmentReducer,
    forum: forumReducer,
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
})

