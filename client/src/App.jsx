"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Provider } from "react-redux"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { store } from "./store/store"
import { loadUser } from "./store/slices/authSlice"

import Navbar from "./Components/Navbar"
import Footer from "./Components/Footer"
import ProtectedRoute from "./Components/ProtectedRoute"
import ProtectedAdminRoute from "../src/Components/ProtectedAdminRoute.jsx"
import ProtectedInstructorRoute from "./Components/ProtectedInstructorRoute"

// Public Pages
import HomePage from "./Pages/HomePage"
import CoursesPage from "./Pages/CoursesPage"
import ReferEarn from './Pages/ReferEarn';
import CourseDetailPage from "./Pages/CourseDetailPage";

import ContactUsPage from "./Pages/ContactUsPage"
import AboutUsPage from "./Pages/AboutUsPage"
import LoginPage from "./Pages/LoginPage"
import RegisterPage from "./Pages/RegisterPage"

// Protected Pages
import DashboardPage from "./Pages/DashboardPage"
import MyEnrollmentsPage from "./Pages/MyEnrollmentsPage"
import LearnPage from "./Pages/LearnPage"
import AssessmentsPage from "./Pages/AssesmentsPage"
import CheckoutPage from "./Pages/CheckoutPage"
import CertificatesPage from "./Pages/CertificatesPage"
import CertificateVerificationPage from "./Pages/CertificateVerificationPage"
import AdminDashboardPage from "./Pages/AdminDashboardPage"
import InstructorDashboardPage from "./Pages/InstructorDashboardPage"

// Payment Pages
import PaymentSuccessPage from "./Pages/PaymentSucessPage"
import PaymentFailedPage from "./Pages/PaymentFailedPage"
import MyCoursesPage from "./Pages/MyCoursesPage.jsx"


function AppContent() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Load user on app start if token exists
    const token = localStorage.getItem("token")
    if (token) {
      dispatch(loadUser())
    }
  }, [dispatch])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/refer-earn" element={<ReferEarn />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-enrollments"
            element={
              <ProtectedRoute>
                <MyEnrollmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <MyCoursesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/learn"
            element={
              <ProtectedRoute>
                <LearnPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/assessments"
            element={
              <ProtectedRoute>
                <AssessmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:courseId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />

          {/* Certificate Routes */}
          <Route
            path="/certificates"
            element={
              <ProtectedRoute>
                <CertificatesPage />
              </ProtectedRoute>
            }
          />
          <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />
          <Route
              path="/instructor"
              element={
                <ProtectedInstructorRoute>
                  <InstructorDashboardPage />
                </ProtectedInstructorRoute>
              }
            />
             {/* <Route
              path="/courses/:courseId/forum"
              element={
                <ProtectedRoute>
                  <ForumPage />
                </ProtectedRoute>
              }
            /> */}
          <Route path="/verify-certificate/:certificateId" element={<CertificateVerificationPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  )
}

export default App
