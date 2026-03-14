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
  const razorpay_order_id = searchParams.get("razorpay_order_id")
  const razorpay_payment_id = searchParams.get("razorpay_payment_id")
  const razorpay_signature = searchParams.get("razorpay_signature")

  useEffect(() => {
        window.scrollTo(0, 0);
      }, []);

  useEffect(() => {
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      verifyPaymentAndEnroll()
    } else {
      setVerificationStatus("error")
    }
  }, [razorpay_order_id, razorpay_payment_id, razorpay_signature])

  const verifyPaymentAndEnroll = async () => {
    try {
      const result = await dispatch(
        verifyPayment({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        }),
      )

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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-sm sm:text-base text-gray-600">Please wait while we confirm your payment and set up your course access...</p>
        </div>
      </div>
    )
  }

  // if (verificationStatus === "error") {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
  //       <div className="w-full max-w-md p-6 sm:p-8 text-center bg-white rounded-lg shadow-sm">
  //         <div className="mb-4 text-red-500">
  //           <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //             <path
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               strokeWidth={2}
  //               d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
  //             />
  //           </svg>
  //         </div>
  //         <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h2>
  //         <p className="text-sm sm:text-base text-gray-600 mb-6">
  //           We couldn't verify your payment. Please contact support if you believe this is an error.
  //         </p>
  //         <div className="space-y-3">
  //           <button
  //             onClick={() => navigate("/dashboard")}
  //             className="w-full px-4 py-2 text-sm sm:text-base text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
  //           >
  //             Go to Dashboard
  //           </button>
  //           <button
  //             onClick={() => navigate("/contact")}
  //             className="w-full px-4 py-2 text-sm sm:text-base text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
  //           >
  //             Contact Support
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 text-green-500" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            Welcome to your new course, {user?.name}! You now have lifetime access.
          </p>
        </div>

        {/* Payment Summary */}
        <div className="p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Payment Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Transaction Details</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono break-all">{paymentDetails?.transactionId}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="capitalize">{paymentDetails?.paymentMethod}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold">₹{paymentDetails?.amount}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(paymentDetails?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Course Access</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium">{course?.title}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600">Instructor:</span>
                  <span>{course?.instructor}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600">Access:</span>
                  <span className="font-medium text-green-600">Lifetime</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-gray-600">Certificate:</span>
                  <span className="text-blue-600">Upon Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Preview */}
        {course && (
          <div className="p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 bg-white rounded-lg shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Your Course</h2>

            <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt={course.title}
                className="w-full sm:w-32 h-32 sm:h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{course.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3 line-clamp-2">{course.description}</p>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{course.enrollmentCount} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{course.level}</span>
                  </div>
                </div>

                <Link
                  to={`/courses/${course._id}/learn`}
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Learning Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 bg-white rounded-lg shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">What's Next?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className="p-4 text-center transition-shadow border border-gray-200 rounded-lg hover:shadow-md"
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-blue-100 rounded-full">
                  <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{step.description}</p>
                <Link
                  to={step.link}
                  className="inline-flex items-center text-xs sm:text-sm font-medium text-primary-700 hover:text-blue-800"
                >
                  {step.action}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt Download (commented out in original) */}
        {/* <div className="mt-8 text-center">
          <p className="mb-4 text-gray-600">Need a receipt for your records?</p>
          <button className="font-medium text-blue-600 hover:text-blue-800">
            <Download className="inline w-4 h-4 mr-2" />
            Download Receipt
          </button>
        </div> */}
      </div>
    </div>
  )
}

export default PaymentSuccessPage