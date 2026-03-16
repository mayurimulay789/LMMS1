import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const otpInputRef = useRef(null);

  useEffect(() => {
    // Try to get email from localStorage first, then fallback to location.state
    const storedEmail = localStorage.getItem("pendingVerificationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (location.state?.email) {
      setEmail(location.state.email);
      // Optionally store it in localStorage for persistence
      localStorage.setItem("pendingVerificationEmail", location.state.email);
    } else {
      toast.error("Email not found. Please register again.");
      setTimeout(() => navigate("/register"), 2000);
    }
  }, [location, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Focus OTP input on mount
  useEffect(() => {
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      setCode(pastedData);
    }
  };

  const validateOTP = () => {
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return false;
    }
    if (!/^\d{6}$/.test(code)) {
      toast.error("OTP must contain only numbers");
      return false;
    }
    return true;
  };

  const baseurl = import.meta.env.VITE_BACKEND_URL;

  const handleResendOtp = async () => {
    if (timer > 0) {
      toast.error(`Please wait ${formatTime(timer)} before requesting another code.`);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${baseurl}api/auth/send-verification-otp`, {
        email: email.toLowerCase().trim()
      });

      if (response.data.success) {
        toast.success("New verification code sent to your email!");
        setTimer(600);
        setCode("");
        if (otpInputRef.current) {
          otpInputRef.current.focus();
        }
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      if (error.response?.data?.alreadyVerified) {
        toast.success("Email already verified. Redirecting to login...");
        // Clear stored email and redirect
        localStorage.removeItem("pendingVerificationEmail");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOTP()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${baseurl}api/auth/verify-email-otp`, {
        email: email.toLowerCase().trim(),
        otp: code
      });

      if (response.data.success) {
        toast.success("Email verified successfully! You can now log in.");

        // ✅ Remove email from localStorage after successful verification
        localStorage.removeItem("pendingVerificationEmail");

        setTimeout(() => {
          navigate("/login", {
            state: { 
              message: "Your email has been verified. Please log in.",
              email: email
            }
          });
        }, 2000);
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error.response?.data?.message) {
        if (error.response.status === 400) {
          if (error.response.data.blocked) {
            toast.error(error.response.data.message);
          } else if (error.response.data.expired) {
            toast.error("OTP has expired. Please request a new one.");
            setTimer(0);
          } else {
            toast.error(error.response.data.message);
          }
        } else {
          toast.error("Failed to verify OTP");
        }
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />

      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <button
              onClick={handleBackToRegister}
              className="text-gray-600 hover:text-gray-800 flex items-center text-sm mb-4"
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back to Register
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Verify your email
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              We&apos;ve sent a 6-digit verification code to{" "}
              <span className="font-medium text-blue-600">{email}</span>.
              Enter the code below to activate your account.
            </p>

            <div className="mb-6">
              <input
                ref={otpInputRef}
                type="text"
                maxLength={6}
                value={code}
                onChange={handleOtpChange}
                onPaste={handlePaste}
                placeholder="Enter 6-digit code"
                className="w-full border border-gray-300 rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest"
                disabled={loading}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">6-digit code</span>
                {code.length > 0 && (
                  <span className="text-xs text-gray-500">{code.length}/6 digits</span>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-4">
                {timer > 0 ? (
                  <div className="flex items-center justify-center">
                    <svg 
                      className="w-4 h-4 mr-2 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <span>Code expires in {formatTime(timer)}</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-red-500 mb-2">Code has expired</p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Resend code
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || timer > 0}
                className={`
                  w-full py-2 rounded-md text-sm font-medium transition
                  ${loading || timer > 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                  }
                `}
              >
                Didn&apos;t receive code? Send again
              </button>
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || code.length !== 6}
              className={`
                w-full py-3 rounded-md font-medium transition-all duration-300
                ${loading || code.length !== 6
                  ? 'bg-[#890c25] cursor-not-allowed' 
                  : 'bg-[#890c25] hover:bg-[#890c25] active:bg-[#890c25]'
                }
                text-white font-medium
                flex items-center justify-center
              `}
            >
              {loading ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="font-medium text-gray-700 mb-2 text-sm">Need help?</p>
            <p className="text-sm text-gray-600 mt-2">
              Contact support at{" "}
              <a 
                href="mailto:services@rymaacademy.com" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                services@rymaacademy.com
              </a>
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center w-full"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}