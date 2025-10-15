"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { XCircle, AlertTriangle, CreditCard, HelpCircle, ArrowLeft, RefreshCw } from "lucide-react"

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [errorDetails, setErrorDetails] = useState(null)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)

  const errorCode = searchParams.get("error_code")
  const courseId = searchParams.get("course_id")
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    // Fetch error details if available
    if (sessionId) {
      fetchErrorDetails()
    }
  }, [sessionId])

  const fetchErrorDetails = async () => {
    try {
      const response = await fetch(`http://localhost:2000/api/payments/error-details/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setErrorDetails(data)
      }
    } catch (error) {
      console.error("Error fetching error details:", error)
    }
  }

  const getErrorMessage = () => {
    switch (errorCode) {
      case "card_declined":
        return {
          title: "Card Declined",
          message: "Your payment method was declined. Please try a different card or contact your bank.",
          icon: CreditCard,
        }
      case "insufficient_funds":
        return {
          title: "Insufficient Funds",
          message: "Your card doesn't have sufficient funds for this transaction.",
          icon: CreditCard,
        }
      case "expired_card":
        return {
          title: "Expired Card",
          message: "Your card has expired. Please use a different payment method.",
          icon: CreditCard,
        }
      case "processing_error":
        return {
          title: "Processing Error",
          message: "There was an error processing your payment. Please try again.",
          icon: AlertTriangle,
        }
      case "session_expired":
        return {
          title: "Session Expired",
          message: "Your payment session has expired. Please start the checkout process again.",
          icon: AlertTriangle,
        }
      default:
        return {
          title: "Payment Failed",
          message: "We couldn't process your payment. Please try again or contact support.",
          icon: XCircle,
        }
    }
  }

  const troubleshootingSteps = [
    {
      title: "Check Your Card Details",
      description: "Ensure your card number, expiry date, and CVV are correct",
      icon: CreditCard,
    },
    {
      title: "Verify Billing Address",
      description: "Make sure your billing address matches your card statement",
      icon: HelpCircle,
    },
    {
      title: "Check Available Funds",
      description: "Ensure you have sufficient funds or credit limit available",
      icon: AlertTriangle,
    },
    {
      title: "Try a Different Card",
      description: "Use an alternative payment method if available",
      icon: CreditCard,
    },
    {
      title: "Contact Your Bank",
      description: "Your bank may be blocking the transaction for security reasons",
      icon: HelpCircle,
    },
  ]

  const errorInfo = getErrorMessage()
  const ErrorIcon = errorInfo.icon

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <ErrorIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{errorInfo.title}</h1>
          <p className="text-xl text-gray-600">{errorInfo.message}</p>
        </div>

        {/* Error Details */}
        {errorDetails && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-800 mb-3">Error Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-red-700">Error Code:</span>
                <span className="font-mono text-red-800">{errorDetails.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Transaction ID:</span>
                <span className="font-mono text-red-800">{errorDetails.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Time:</span>
                <span className="text-red-800">{new Date(errorDetails.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Actions */}
          <div className="space-y-6">
            {/* Retry Payment */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Try Again</h2>
              <p className="text-gray-600 mb-6">
                Most payment issues are temporary. You can retry your payment with the same or different payment method.
              </p>

              <div className="space-y-3">
                {courseId && (
                  <Link
                    to={`/checkout/${courseId}`}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Retry Payment
                  </Link>
                )}

                <button
                  onClick={() => navigate(-1)}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Go Back
                </button>
              </div>
            </div>

            {/* Alternative Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Alternative Payment Methods</h2>
              <p className="text-gray-600 mb-4">If your card continues to be declined, try these alternatives:</p>

              <div className="space-y-3">
                <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">PayPal</p>
                    <p className="text-sm text-gray-600">Pay with your PayPal account or linked cards</p>
                  </div>
                </div>

                <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <CreditCard className="h-8 w-8 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Different Card</p>
                    <p className="text-sm text-gray-600">Try a different credit or debit card</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-600 mb-4">
                Our support team is here to help resolve any payment issues you're experiencing.
              </p>

              <div className="space-y-3">
                <Link
                  to="/contact"
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <HelpCircle className="h-5 w-5 mr-2" />
                  Contact Support
                </Link>

                <div className="text-center text-sm text-gray-600">
                  <p>Or email us directly at:</p>
                  <a href="mailto:support@Ryma Academy.com" className="text-blue-600 hover:text-blue-800 font-medium">
                    support@Ryma Academy.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting Guide */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Troubleshooting Guide</h2>
                <button
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showTroubleshooting ? "Hide" : "Show"} Guide
                </button>
              </div>

              {showTroubleshooting && (
                <div className="space-y-4">
                  {troubleshootingSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <step.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Security Reassurance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-3">Your Security is Protected</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• No charges were made to your account</li>
                <li>• Your payment information is secure</li>
                <li>• All transactions are encrypted</li>
                <li>• We never store your full card details</li>
              </ul>
            </div>

            {/* Common Issues */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-3">Common Issues</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p>
                  <strong>International Cards:</strong> Some banks block international transactions by default
                </p>
                <p>
                  <strong>Security Blocks:</strong> Banks may block unusual spending patterns
                </p>
                <p>
                  <strong>Daily Limits:</strong> You may have reached your daily spending limit
                </p>
                <p>
                  <strong>Address Mismatch:</strong> Billing address must match your card statement
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Still Want This Course?</h3>
            <p className="text-gray-600 mb-6">
              Don't let a payment hiccup stop your learning journey. We're here to help you get enrolled.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {courseId && (
                <Link
                  to={`/checkout/${courseId}`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Try Payment Again
                </Link>
              )}

              <Link
                to="/courses"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Browse Other Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFailedPage
