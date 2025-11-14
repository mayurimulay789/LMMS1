"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Lock, Shield, ArrowLeft, Tag, Check, X, User, Mail, MapPin, Phone, AlertCircle, Percent, CreditCard } from 'lucide-react'
import { createPaymentOrder, validatePromoCode, clearPaymentState } from "../store/slices/paymentSlice"
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
    isLoading: paymentLoading,
    isValidatingPromo,
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

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await apiRequest(`courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      }
    } catch (error) {
      console.error("Error fetching course:", error)
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
    if (promoCodeInput.trim()) {
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
    const discountAmount = (originalPrice * discount) / 100
    return {
      originalPrice,
      discountAmount,
      finalPrice: originalPrice - discountAmount,
    }
  }

  const validateBillingInfo = () => {
    const required = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode"]
    return required.every((field) => billingInfo[field].trim() !== "")
  }

  const handlePayment = async () => {
    if (!course || !termsAccepted) return

    if (!validateBillingInfo()) {
      alert("Please fill in all required billing information")
      return
    }

    setProcessingPayment(true)

    try {
      const { finalPrice } = calculateTotal()

      const result = await dispatch(
        createPaymentOrder({
          courseId: course._id,
          amount: finalPrice,
          promoCode: promoCode,
          billingInfo: billingInfo,
        }),
      )

      if (result.type === "payment/createOrder/fulfilled") {
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
              const verifyResponse = await apiRequest("payments/verify", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              })

              if (verifyResponse.ok) {
                navigate(`/payment/success?course_id=${courseId}&razorpay_order_id=${response.razorpay_order_id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}`)
              } else {
                navigate(`/payment/failed?course_id=${courseId}`)
              }
            } catch (error) {
              console.error("Payment verification error:", error)
              navigate(`/payment/failed?course_id=${courseId}`)
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
      }
    } catch (error) {
      console.error("Payment error:", error)
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-4 sm:py-8 bg-gray-50">
        <div className="max-w-6xl px-3 sm:px-4 lg:px-8 mx-auto">
          <div className="animate-pulse">
            <div className="w-32 h-6 sm:h-8 mb-4 sm:mb-6 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
              <div className="space-y-4 sm:space-y-6 lg:col-span-2">
                <div className="h-32 sm:h-48 p-4 sm:p-6 bg-white rounded-lg"></div>
                <div className="h-48 sm:h-64 p-4 sm:p-6 bg-white rounded-lg"></div>
              </div>
              <div className="p-4 sm:p-6 bg-white rounded-lg h-64 sm:h-96"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <h2 className="mb-4 text-xl sm:text-2xl font-bold text-gray-900">Course Not Found</h2>
          <button
            onClick={() => navigate("/courses")}
            className="w-full sm:w-auto px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
      <div className="max-w-6xl px-3 sm:px-4 lg:px-8 mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center mb-3 sm:mb-4 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Secure Checkout</h1>
          <div className="flex items-center mt-2 space-x-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="text-xs sm:text-sm text-gray-600">SSL Encrypted • Secure Payment via Razorpay</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-2">
            {/* Course Summary */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-gray-900">Course Summary</h2>
              <div className="flex items-start p-3 sm:p-4 space-x-3 sm:space-x-4 border border-gray-200 rounded-lg">
                <img
                  src={course.thumbnail || "/placeholder.svg?height=80&width=80"}
                  alt={course.title}
                  className="object-cover w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 text-base sm:text-lg font-semibold text-gray-900 truncate">{course.title}</h3>
                  <p className="mb-2 text-xs sm:text-sm text-gray-600">By {course.instructor}</p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                    <span>{course.duration}</span>
                    <span>•</span>
                    <span>{course.level}</span>
                    <span>•</span>
                    <span>{course.enrollmentCount} students</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">₹{originalPrice}</div>
                  {discount > 0 && <div className="text-xs sm:text-sm text-green-600">-{discount}% off</div>}
                </div>
              </div>
            </div>

            {/* Promo Code - Hidden on mobile to save space */}
            <div className="hidden sm:block p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-gray-900">Promo Code</h2>
              <form onSubmit={handlePromoCodeSubmit} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="relative flex-1">
                  <Tag className="absolute w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Enter promo code"
                    className="w-full py-2 sm:py-3 pl-9 sm:pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    disabled={isValidatingPromo}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isValidatingPromo || !promoCodeInput.trim()}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
                >
                  {isValidatingPromo ? "Validating..." : "Apply"}
                </button>
              </form>

              {promoCode && (
                <div className="flex items-center p-2 sm:p-3 mt-3 space-x-2 border border-green-200 rounded-lg bg-green-50">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-green-800">
                    Promo code "{promoCode}" applied! You save ₹{discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {error && error.includes("promo") && (
                <div className="flex items-center p-2 sm:p-3 mt-3 space-x-2 border border-red-200 rounded-lg bg-red-50">
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-red-800">{error}</span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-gray-900">Payment Method</h2>
              <div className="p-3 sm:p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Razorpay Secure Payment</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Credit/Debit Card, UPI, Net Banking, Wallets
                    </p>
                  </div>

                  {/* Payment Icons */}
                  <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                    {/* Visa */}
                    <div className="w-6 h-4 sm:w-7 sm:h-5 bg-blue-900 rounded flex items-center justify-center">
                      <span className="text-[8px] sm:text-xs font-bold text-white">VISA</span>
                    </div>

                    {/* MasterCard */}
                    <div className="w-6 h-4 sm:w-7 sm:h-5 bg-white border rounded flex items-center justify-center relative overflow-hidden">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full absolute left-1"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full absolute right-1"></div>
                    </div>

                    {/* UPI */}
                    <div className="w-6 h-4 sm:w-7 sm:h-5 bg-green-600 rounded flex items-center justify-center">
                      <span className="text-[8px] sm:text-xs font-bold text-white">UPI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-gray-900">Billing Information</h2>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {/* First Name */}
                <div className="md:col-span-1">
                  <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">First Name *</label>
                  <div className="relative">
                    <User className="absolute w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      name="firstName"
                      value={billingInfo.firstName}
                      onChange={handleBillingInfoChange}
                      className="w-full py-2 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                      pattern="^[A-Za-z\s]+$"
                      title="First name should only contain letters."
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="md:col-span-1">
                  <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={billingInfo.lastName}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                    pattern="^[A-Za-z\s]+$"
                    title="Last name should only contain letters."
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-1">
                  <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={billingInfo.email}
                      onChange={handleBillingInfoChange}
                      className="w-full py-2 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                      title="Enter a valid email address."
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="md:col-span-1">
                  <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={billingInfo.phone}
                      onChange={handleBillingInfoChange}
                      className="w-full py-2 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                      pattern="^[0-9]{10}$"
                      maxLength={10}
                      title="Enter a valid 10-digit phone number."
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">Address *</label>
                  <div className="relative">
                    <MapPin className="absolute w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      name="address"
                      value={billingInfo.address}
                      onChange={handleBillingInfoChange}
                      className="w-full py-2 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                {/* City */}
                <div className="md:col-span-1">
                  <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={billingInfo.city}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                    pattern="^[A-Za-z\s]+$"
                    title="City should only contain letters."
                  />
                </div>

                {/* State */}
                <div className="md:col-span-1">
                  <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={billingInfo.state}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                    pattern="^[A-Za-z\s]+$"
                    title="State should only contain letters."
                  />
                </div>

                {/* ZIP Code */}
                <div className="md:col-span-1">
                  <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={billingInfo.zipCode}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                    pattern="^[0-9]{5,6}$"
                    title="Enter a valid 5 or 6 digit ZIP Code."
                  />
                </div>

                {/* Country */}
                <div className="md:col-span-1">
                  <label className="block mb-1 sm:mb-2 text-xs sm:text-sm font-medium text-gray-700">Country *</label>
                  <select
                    name="country"
                    value={billingInfo.country}
                    onChange={handleBillingInfoChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                <div className="md:col-span-2 mt-3 sm:mt-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                      required
                    />
                    <label htmlFor="terms" className="text-xs sm:text-sm text-gray-700">
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
            <div className="sticky p-4 sm:p-6 bg-white rounded-lg shadow-sm top-4 sm:top-8">
              <h3 className="mb-3 sm:mb-4 text-lg font-semibold text-gray-900">Order Summary</h3>
              <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Course Price:</span>
                  <span className="font-medium text-sm sm:text-base">₹{originalPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center text-xs sm:text-sm">
                      <Percent className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Discount ({discount}%):
                    </span>
                    <span className="font-medium text-xs sm:text-sm">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Tax:</span>
                  <span className="font-medium text-sm sm:text-base">₹0.00</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">₹{finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processingPayment || paymentLoading || !termsAccepted}
                className="flex items-center justify-center w-full px-4 py-3 sm:py-4 mb-3 sm:mb-4 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {processingPayment || paymentLoading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Pay with Razorpay
                  </>
                )}
              </button>

              <div className="space-y-1 text-xs text-center text-gray-500">
                <p>By completing your purchase, you agree to our terms and conditions</p>
              </div>
            </div>

            {/* What's Included */}
            <div className="p-3 sm:p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="mb-2 sm:mb-3 font-semibold text-blue-800 text-sm sm:text-base">What's Included:</h4>
              <ul className="space-y-1 text-xs sm:text-sm text-blue-700">
                <li>• Lifetime access to course</li>
                <li>• Mobile and desktop access</li>
                <li>• Certificate of completion</li>
                <li>• Direct instructor support</li>
                <li>• 30-day money-back guarantee</li>
                <li>• Downloadable resources</li>
              </ul>
            </div>

            {/* Support */}
            <div className="p-3 sm:p-4 rounded-lg bg-gray-50">
              <div className="flex items-center mb-2 space-x-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Need Help?</span>
              </div>
              <p className="mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600">
                Our support team is here to help with any questions about your purchase.
              </p>
              <button className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800">Contact Support →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage