"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  BookOpen,
  CheckCircle,
} from "lucide-react"
import { registerUser, clearError } from "../store/slices/authSlice"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    referralCode: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoading, error } = useSelector((state) => state.auth)

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!showSuccessPopup) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleRedirect()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [showSuccessPopup])

  const handleRedirect = () => {
    navigate("/dashboard", { replace: true })
  }

  useEffect(() => {
    return () => dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Full name is required"
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email required"
    if (formData.password.length < 6) newErrors.password = "Minimum 6 characters"
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    const { confirmPassword, ...payload } = formData
    await dispatch(registerUser(payload))
    setShowSuccessPopup(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50 flex  justify-center px-4 py-10">
      {/* Success Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex  justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm text-center">
            <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Registration Successful
            </h3>
            <p className="text-gray-600 mb-4">
              Redirecting in {countdown} seconds...
            </p>
            <button
              onClick={handleRedirect}
              className="text-sm text-rose-600 underline"
            >
              Go now
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          
          <p className="text-primary-600 text-xl ">
            Create your account and start learning today!
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl px-8 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Field */}
            {[
              {
                label: "Full Name",
                name: "name",
                type: "text",
                icon: User,
                placeholder: "John Doe",
              },
              {
                label: "Email Address",
                name: "email",
                type: "email",
                icon: Mail,
                placeholder: "you@example.com",
              },
            ].map(({ label, name, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="text-sm font-medium text-gray-700">
                  {label}
                </label>
                <div className="relative mt-1">
                  <Icon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-rose-500 outline-none ${
                      errors[name]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors[name] && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}

            {/* Password */}
            {[
              {
                label: "Password",
                name: "password",
                show: showPassword,
                setShow: setShowPassword,
              },
              {
                label: "Confirm Password",
                name: "confirmPassword",
                show: showConfirmPassword,
                setShow: setShowConfirmPassword,
              },
            ].map(({ label, name, show, setShow }) => (
              <div key={name}>
                <label className="text-sm font-medium text-gray-700">
                  {label}
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border focus:ring-2 focus:ring-rose-500 outline-none ${
                      errors[name]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-3.5 text-gray-400"
                  >
                    {show ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors[name] && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors[name]}
                  </p>
                )}
              </div>
            ))}

            {/* Terms */}
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" required />
              I agree to the{" "}
              <Link to="/terms-conditions" className="text-rose-600 underline">
                Terms-Conditions
              </Link>{" "}
              &{" "}
              <Link to="/privacy-policy" className="text-rose-600 underline">
                Privacy-Policy
              </Link>
            </label>

            {/* Submit */}
            <button
              disabled={isLoading}
              className="w-full bg-rose-700 hover:bg-rose-800 text-white py-3 rounded-lg font-semibold transition shadow-md"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-rose-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
