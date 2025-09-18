"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { CheckCircle, Play, Download, Users, Clock, Award, ArrowRight } from "lucide-react"
import { verifyPayment } from "../store/slices/paymentSlice"
import { fetchUserEnrollments } from "../store/slices/enrollmentSlice"

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [verificationStatus, setVerificationStatus] = useState("verifying") // verifying, success, error
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [course, setCourse] = useState(null)

  const { user } = useSelector((state) => state.auth)
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (sessionId) {
      verifyPaymentAndEnroll()
    } else {
      setVerificationStatus("error")
    }
  }, [sessionId])

  const verifyPaymentAndEnroll = async () => {
    try {
      const result = await dispatch(verifyPayment(sessionId))

      if (result.type === "payment/verifyPayment/fulfilled") {
        setPaymentDetails(result.payload.payment)
        setCourse(result.payload.course)
        setVerificationStatus("success")

        // Refresh user enrollments
        dispatch(fetchUserEnrollments())
      } else {
        setVerificationStatus("error")
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      setVerificationStatus("error")
    }
  }

  const nextSteps = [
    {
      icon: Play,
      title: "Start Learning",
      description: "Begin your first lesson and start your learning journey",
      action: "Start Course",
      link: course ? `/courses/${course._id}/learn` : "#",
    },
    {
      icon: Users,
      title: "Join Community",
      description: "Connect with other students in the course discussion forum",
      action: "Join Discussion",
      link: course ? `/courses/${course._id}/forum` : "#",
    },
    {
      icon: Download,
      title: "Download Resources",
      description: "Access downloadable materials and course resources",
      action: "View Resources",
      link: course ? `/courses/${course._id}/resources` : "#",
    },
  ]

  if (verificationStatus === "verifying") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment and set up your course access...</p>
        </div>
      </div>
    )
  }

  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-6">
            We couldn't verify your payment. Please contact support if you believe this is an error.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-600">
            Welcome to your new course, {user?.name}! You now have lifetime access.
          </p>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Transaction Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono">{paymentDetails?.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="capitalize">{paymentDetails?.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold">${paymentDetails?.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(paymentDetails?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Course Access</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium">{course?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Instructor:</span>
                  <span>{course?.instructor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Access:</span>
                  <span className="text-green-600 font-medium">Lifetime</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificate:</span>
                  <span className="text-blue-600">Upon Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Preview */}
        {course && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Course</h2>

            <div className="flex items-start space-x-4">
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="w-32 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-3">{course.description}</p>

                <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollmentCount} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>{course.level}</span>
                  </div>
                </div>

                <Link
                  to={`/courses/${course._id}/learn`}
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Learning Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">What's Next?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <step.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                <Link
                  to={step.link}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Your Learning Journey!</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            You've taken the first step towards mastering new skills. We're excited to be part of your learning journey.
            Remember, consistency is key - try to dedicate some time each day to your studies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/courses/${course?._id}/learn`}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start First Lesson
            </Link>
            <Link
              to="/dashboard"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Receipt Download */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Need a receipt for your records?</p>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            <Download className="h-4 w-4 inline mr-2" />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage
