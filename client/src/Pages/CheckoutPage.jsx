"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Lock, Shield, ArrowLeft, Tag, Check, X, User, Mail, MapPin, Phone, AlertCircle, Percent, CreditCard } from 'lucide-react'
import { createPaymentOrder, validatePromoCode, clearPaymentState, fetchAvailableOffers, clearError } from "../store/slices/paymentSlice"
import { apiRequest } from "../config/api"

// Declare Razorpay for global usage
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const CheckoutPage = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "IN",
  })

  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const {
    orderId,
    promoCode,
    discount,
    discountType,
    availableOffers,
    isLoading: paymentLoading,
    isValidatingPromo,
    isFetchingOffers,
    error,
  } = useSelector((state) => state.payment)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/checkout/${courseId}` } })
      return
    }

    fetchCourse()
    loadRazorpayScript()

    // Pre-populate billing info with user data
    if (user) {
      setBillingInfo((prev) => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
      }))
    }

    return () => {
      dispatch(clearPaymentState())
    }
  }, [courseId, isAuthenticated, navigate, user, dispatch])

  useEffect(() => {
    if (course && course._id) {
      dispatch(fetchAvailableOffers(course._id))
    }
  }, [course, dispatch])

  useEffect(() => {
    if (error) {
      console.error("Payment Error:", error)
      // You can show a toast notification here instead of alert
      if (error.includes("401") || error.includes("Unauthorized")) {
        alert("Session expired. Please login again.")
        navigate("/login")
      }
    }
  }, [error, navigate])

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await apiRequest(`courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response && response.ok) {
        const data = response.data

        // Handle different response shapes
        let courseData = null
        if (data && data._id) {
          courseData = data
        } else if (data && data.data && data.data._id) {
          courseData = data.data
        } else if (data && data.course && data.course._id) {
          courseData = data.course
        } else {
          courseData = data
        }

        setCourse(courseData)
      } else {
        console.error("Failed to fetch course", response?.data || response)
        if (response?.status === 401) {
          navigate("/login")
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error)
      if (error.message?.includes("401")) {
        navigate("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBillingInfoChange = (e) => {
    const { name, value } = e.target
    setBillingInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePromoCodeSubmit = async (e) => {
    e.preventDefault()
    if (promoCodeInput.trim() && course?._id) {
      dispatch(clearError())
      dispatch(
        validatePromoCode({
          code: promoCodeInput.trim(),
          courseId: course._id,
        }),
      )
    }
  }

  const calculateTotal = () => {
    const originalPrice = course?.price || 0
    let discountAmount = 0
    if (discount && discountType === "percentage") {
      discountAmount = (originalPrice * discount) / 100
    } else if (discount && discountType === "fixed") {
      discountAmount = discount
    }

    const final = Math.max(0, originalPrice - discountAmount)
    return {
      originalPrice,
      discountAmount,
      finalPrice: final,
    }
  }

  const validateBillingInfo = () => {
    const required = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode"]
    const isValid = required.every((field) => billingInfo[field].trim() !== "")
    
    if (!isValid) {
      alert("Please fill in all required billing information")
      return false
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(billingInfo.email)) {
      alert("Please enter a valid email address")
      return false
    }

    // Validate phone number (10 digits for India)
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(billingInfo.phone)) {
      alert("Please enter a valid 10-digit phone number")
      return false
    }

    return true
  }

  const handlePayment = async () => {
    if (!course || !termsAccepted) {
      alert("Please accept the terms and conditions")
      return
    }

    if (!validateBillingInfo()) {
      return
    }

    setProcessingPayment(true)
    dispatch(clearError())

    try {
      const { finalPrice } = calculateTotal()

      const result = await dispatch(
        createPaymentOrder({
          courseId: course._id,
          amount: finalPrice,
          promoCode: promoCode || null,
          billingInfo: billingInfo,
        }),
      )

      if (createPaymentOrder.fulfilled.match(result)) {
        const { orderId, amount, currency, key } = result.payload

        const options = {
          key: key,
          amount: amount * 100, // Razorpay expects amount in paise
          currency: currency,
          name: "Ryma Academy",
          description: course.title,
          image: "/logo.png",
          order_id: orderId,
          handler: async (response) => {
            try {
              const token = localStorage.getItem("token")
              const verifyResponse = await apiRequest("payments/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  courseId: course._id,
                }),
              })

              if (verifyResponse.ok) {
                navigate(`/payment/success?course_id=${courseId}&razorpay_order_id=${response.razorpay_order_id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}`)
              } else {
                navigate(`/payment/failed?course_id=${courseId}&error=verification_failed`)
              }
            } catch (error) {
              console.error("Payment verification error:", error)
              navigate(`/payment/failed?course_id=${courseId}&error=verification_error`)
            }
          },
          prefill: {
            name: `${billingInfo.firstName} ${billingInfo.lastName}`,
            email: billingInfo.email,
            contact: billingInfo.phone,
          },
          notes: {
            course_id: courseId,
            user_id: user.id,
          },
          theme: {
            color: "#2563eb",
          },
          modal: {
            ondismiss: () => {
              setProcessingPayment(false)
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } else if (createPaymentOrder.rejected.match(result)) {
        console.error("Payment order creation failed:", result.payload)
        alert(`Payment failed: ${result.payload}`)
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-4 sm:py-8 bg-gray-50">
        <div className="max-w-6xl px-3 mx-auto sm:px-4 lg:px-8">
          <div className="animate-pulse">
            <div className="w-32 h-6 mb-4 bg-gray-300 rounded sm:h-8 sm:mb-6"></div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
              <div className="space-y-4 sm:space-y-6 lg:col-span-2">
                <div className="h-32 p-4 bg-white rounded-lg sm:h-48 sm:p-6"></div>
                <div className="h-48 p-4 bg-white rounded-lg sm:h-64 sm:p-6"></div>
              </div>
              <div className="h-64 p-4 bg-white rounded-lg sm:p-6 sm:h-96"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
        <div className="max-w-sm text-center">
          <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">Course Not Found</h2>
          <button
            onClick={() => navigate("/courses")}
            className="w-full px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg sm:w-auto hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    )
  }

  const { originalPrice, discountAmount, finalPrice } = calculateTotal()

  return (
    <div className="min-h-screen py-4 sm:py-8 bg-gray-50">
      <div className="max-w-6xl px-3 mx-auto sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center mb-3 text-sm text-blue-600 sm:mb-4 hover:text-blue-800 sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </button>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Secure Checkout</h1>
          <div className="flex items-center mt-2 space-x-2">
            <Shield className="w-4 h-4 text-green-600 sm:w-5 sm:h-5" />
            <span className="text-xs text-gray-600 sm:text-sm">SSL Encrypted • Secure Payment via Razorpay</span>
          </div>
        </div>

        {/* Error Display */}
        {error && !error.includes("promo") && (
          <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center space-x-2">
              <X className="flex-shrink-0 w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">
                {error.includes("401") ? "Session expired. Please login again." : error}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            {/* Course Summary */}
            <div className="p-4 bg-white rounded-lg shadow-sm sm:p-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">Course Summary</h2>
              <div className="flex items-start p-3 space-x-3 border border-gray-200 rounded-lg sm:p-4 sm:space-x-4">
                <img
                  src={course.thumbnail || "/placeholder.svg?height=80&width=80"}
                  alt={course.title}
                  className="flex-shrink-0 object-cover w-16 h-16 rounded-lg sm:w-20 sm:h-20"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 text-base font-semibold text-gray-900 truncate sm:text-lg">{course.title}</h3>
                  <p className="mb-2 text-xs text-gray-600 sm:text-sm">By {course.instructor}</p>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-gray-600 sm:gap-2 sm:text-sm">
                    <span>{course.duration}</span>
                    <span>•</span>
                    <span>{course.level}</span>
                    <span>•</span>
                    <span>{course.enrollmentCount} students</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-gray-900 sm:text-2xl">₹{originalPrice}</div>
                  {discount > 0 && <div className="text-xs text-green-600 sm:text-sm">-{discount}% off</div>}
                </div>
              </div>
            </div>

            {/* Available Offers */}
            {availableOffers && availableOffers.length > 0 && (
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Available Offers</h2>
                {isFetchingOffers ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Loading offers...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableOffers.map((offer) => (
                      <div
                        key={offer.code}
                        className="relative p-4 transition-all duration-200 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 group"
                        onClick={() => {
                          setPromoCodeInput(offer.code)
                          dispatch(clearError())
                          dispatch(validatePromoCode({
                            code: offer.code,
                            courseId: course._id,
                          }))
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Tag className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-gray-900">{offer.code}</span>
                              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                                {offer.discountType === "percentage" ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{offer.description}</p>
                          </div>
                          <div className="transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                            <button className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200">
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Promo Code - Hidden on mobile to save space */}
            <div className="hidden p-4 bg-white rounded-lg shadow-sm sm:block sm:p-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">Promo Code</h2>
              <form onSubmit={handlePromoCodeSubmit} className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                <div className="relative flex-1">
                  <Tag className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 sm:w-5 sm:h-5 left-3 top-1/2" />
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => {
                      setPromoCodeInput(e.target.value)
                      if (error) dispatch(clearError())
                    }}
                    placeholder="Enter promo code"
                    className="w-full py-2 pr-4 text-sm border border-gray-300 rounded-lg sm:py-3 pl-9 sm:pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                    disabled={isValidatingPromo}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isValidatingPromo || !promoCodeInput.trim()}
                  className="px-4 py-2 text-sm text-white transition-colors rounded-lg sm:px-6 sm:py-3 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed sm:text-base whitespace-nowrap"
                >
                  {isValidatingPromo ? "Validating..." : "Apply"}
                </button>
              </form>

              {promoCode && (
                <div className="flex items-center p-2 mt-3 space-x-2 border border-green-200 rounded-lg sm:p-3 bg-green-50">
                  <Check className="flex-shrink-0 w-4 h-4 text-green-600 sm:w-5 sm:h-5" />
                  <span className="text-xs text-green-800 sm:text-sm">
                    Promo code "{promoCode}" applied! You save ₹{discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {error && error.includes("promo") && (
                <div className="flex items-center p-2 mt-3 space-x-2 border border-red-200 rounded-lg sm:p-3 bg-red-50">
                  <X className="flex-shrink-0 w-4 h-4 text-red-600 sm:w-5 sm:h-5" />
                  <span className="text-xs text-red-800 sm:text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="p-4 bg-white rounded-lg shadow-sm sm:p-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">Payment Method</h2>
              <div className="p-3 border-2 border-blue-500 rounded-lg sm:p-4 bg-blue-50">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <CreditCard className="flex-shrink-0 w-4 h-4 text-blue-600 sm:w-5 sm:h-5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 sm:text-base">Razorpay Secure Payment</p>
                    <p className="text-xs text-gray-600 sm:text-sm">
                      Credit/Debit Card, UPI, Net Banking, Wallets
                    </p>
                  </div>

                  {/* Payment Icons */}
                  <div className="flex flex-shrink-0 space-x-1 sm:space-x-2">
                    {/* Visa */}
                    <div className="flex items-center justify-center w-6 h-4 bg-blue-900 rounded sm:w-7 sm:h-5">
                      <span className="text-[8px] sm:text-xs font-bold text-white">VISA</span>
                    </div>

                    {/* MasterCard */}
                    <div className="relative flex items-center justify-center w-6 h-4 overflow-hidden bg-white border rounded sm:w-7 sm:h-5">
                      <div className="absolute w-2 h-2 bg-red-500 rounded-full sm:w-3 sm:h-3 left-1"></div>
                      <div className="absolute w-2 h-2 bg-orange-500 rounded-full sm:w-3 sm:h-3 right-1"></div>
                    </div>

                    {/* UPI */}
                    <div className="flex items-center justify-center w-6 h-4 bg-green-600 rounded sm:w-7 sm:h-5">
                      <span className="text-[8px] sm:text-xs font-bold text-white">UPI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="p-4 bg-white rounded-lg shadow-sm sm:p-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">Billing Information</h2>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {/* First Name */}
                <div className="md:col-span-1">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">First Name *</label>
                  <div className="relative">
                    <User className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 sm:w-5 sm:h-5 left-3 top-1/2" />
                    <input
                      type="text"
                      name="firstName"
                      value={billingInfo.firstName}
                      onChange={handleBillingInfoChange}
                      className="w-full py-2 pr-3 text-sm border border-gray-300 rounded-lg sm:py-3 pl-9 sm:pl-10 sm:pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                      required
                      pattern="^[A-Za-z\s]+$"
                      title="First name should only contain letters."
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="md:col-span-1">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={billingInfo.lastName}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                    required
                    pattern="^[A-Za-z\s]+$"
                    title="Last name should only contain letters."
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-1">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 sm:w-5 sm:h-5 left-3 top-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={billingInfo.email}
                      onChange={handleBillingInfoChange}
                      className="w-full py-2 pr-3 text-sm border border-gray-300 rounded-lg sm:py-3 pl-9 sm:pl-10 sm:pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                      required
                      title="Enter a valid email address."
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="md:col-span-1">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 sm:w-5 sm:h-5 left-3 top-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={billingInfo.phone}
                      onChange={handleBillingInfoChange}
                      className="w-full py-2 pr-3 text-sm border border-gray-300 rounded-lg sm:py-3 pl-9 sm:pl-10 sm:pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                      required
                      pattern="^[0-9]{10}$"
                      maxLength={10}
                      title="Enter a valid 10-digit phone number."
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">Address *</label>
                  <div className="relative">
                    <MapPin className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 sm:w-5 sm:h-5 left-3 top-1/2" />
                    <input
                      type="text"
                      name="address"
                      value={billingInfo.address}
                      onChange={handleBillingInfoChange}
                      className="w-full py-2 pr-3 text-sm border border-gray-300 rounded-lg sm:py-3 pl-9 sm:pl-10 sm:pr-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                      required
                    />
                  </div>
                </div>

                {/* City */}
                <div className="md:col-span-1">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={billingInfo.city}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                    required
                    pattern="^[A-Za-z\s]+$"
                    title="City should only contain letters."
                  />
                </div>

                {/* State */}
                <div className="md:col-span-1">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={billingInfo.state}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                    required
                    pattern="^[A-Za-z\s]+$"
                    title="State should only contain letters."
                  />
                </div>

                {/* ZIP Code */}
                <div className="md:col-span-1">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={billingInfo.zipCode}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                    required
                    pattern="^[0-9]{5,6}$"
                    title="Enter a valid 5 or 6 digit ZIP Code."
                  />
                </div>

                {/* Country */}
                <div className="md:col-span-1">
                  <label className="block mb-1 text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">Country *</label>
                  <select
                    name="country"
                    value={billingInfo.country}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-base"
                    required
                  >
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                {/* Terms and Conditions */}
                <div className="mt-3 md:col-span-2 sm:mt-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="flex-shrink-0 w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="terms" className="text-xs text-gray-700 sm:text-sm">
                      I agree to the{" "}
                      <a href="/terms" className="text-blue-600 underline hover:text-blue-800">
                        Terms of Service
                      </a>
                      ,{" "}
                      <a href="/privacy" className="text-blue-600 underline hover:text-blue-800">
                        Privacy Policy
                      </a>
                      , and{" "}
                      <a href="/refund" className="text-blue-600 underline hover:text-blue-800">
                        Refund Policy
                      </a>
                      . I understand that I will have immediate access to this course upon successful payment.
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Order Summary */}
            <div className="sticky p-4 bg-white rounded-lg shadow-sm sm:p-6 top-4 sm:top-8">
              <h3 className="mb-3 text-lg font-semibold text-gray-900 sm:mb-4">Order Summary</h3>
              <div className="mb-4 space-y-2 sm:mb-6 sm:space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 sm:text-base">Course Price:</span>
                  <span className="text-sm font-medium sm:text-base">₹{originalPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center text-xs sm:text-sm">
                      <Percent className="w-3 h-3 mr-1 sm:w-4 sm:h-4" />
                      Discount ({discount}%):
                    </span>
                    <span className="text-xs font-medium sm:text-sm">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 sm:text-base">Tax:</span>
                  <span className="text-sm font-medium sm:text-base">₹0.00</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base font-bold sm:text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">₹{finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processingPayment || paymentLoading || !termsAccepted}
                className="flex items-center justify-center w-full px-4 py-3 mb-3 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg sm:py-4 sm:mb-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
              >
                {processingPayment || paymentLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full sm:w-5 sm:h-5 animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2 sm:w-5 sm:h-5" />
                    Pay with Razorpay
                  </>
                )}
              </button>

              <div className="space-y-1 text-xs text-center text-gray-500">
                <p>By completing your purchase, you agree to our terms and conditions</p>
              </div>
            </div>

            {/* What's Included */}
            <div className="p-3 border border-blue-200 rounded-lg sm:p-4 bg-blue-50">
              <h4 className="mb-2 text-sm font-semibold text-blue-800 sm:mb-3 sm:text-base">What's Included:</h4>
              <ul className="space-y-1 text-xs text-blue-700 sm:text-sm">
                <li>• Lifetime access to course</li>
                <li>• Mobile and desktop access</li>
                <li>• Certificate of completion</li>
                <li>• Direct instructor support</li>
                <li>• 30-day money-back guarantee</li>
                <li>• Downloadable resources</li>
              </ul>
            </div>

            {/* Support */}
            <div className="p-3 rounded-lg sm:p-4 bg-gray-50">
              <div className="flex items-center mb-2 space-x-2">
                <AlertCircle className="w-4 h-4 text-gray-600 sm:w-5 sm:h-5" />
                <span className="text-sm font-semibold text-gray-800 sm:text-base">Need Help?</span>
              </div>
              <p className="mb-2 text-xs text-gray-600 sm:mb-3 sm:text-sm">
                Our support team is here to help with any questions about your purchase.
              </p>
              <button className="text-xs font-medium text-blue-600 sm:text-sm hover:text-blue-800">Contact Support →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage