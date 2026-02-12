import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
export default function OtpValidationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: OTP validation, 2: Set new password
  const [resetToken, setResetToken] = useState(null);
  const otpInputRef = useRef(null);
  // Get email from location state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email, redirect back
      toast.error("Email not found. Please enter your email again.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [location, navigate]);
  // Timer countdown
  useEffect(() => {
    if (timer > 0 && step === 1) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, step]);
  // Focus OTP input on mount
  useEffect(() => {
    if (otpInputRef.current && step === 1) {
      otpInputRef.current.focus();
    }
  }, [step]);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
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
  const validatePassword = () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };
  const handleResendOtp = async () => {
    if (timer > 0) {
      toast.error(`Please wait ${formatTime(timer)} before requesting another code.`);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/searchuserbyemailandreset", {
        email: email.toLowerCase().trim()
      });

      if (response.data.success) {
        if (response.data.otpSent) {
          toast.success("New OTP sent to your email!");
          setTimer(600); // Reset to 10 minutes
          setCode(""); // Clear OTP
          if (otpInputRef.current) {
            otpInputRef.current.focus();
          }
        } else {
          toast.success(response.data.message);
        }
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
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
      // Step 1: Verify OTP and get reset token
      const response = await axios.post("/api/auth/verify-otp", {
        email: email.toLowerCase().trim(),
        otp: code
      });
      if (response.data.success) {
        toast.success("OTP verified successfully!");
        // Store the reset token for the next step
        setResetToken(response.data.resetToken);
        // Move to password reset step
        setStep(2);
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error.response?.data?.message) {
        if (error.response.status === 400) {
          // OTP verification failed
          if (error.response.data.blocked) {
            toast.error(error.response.data.message);
          } else if (error.response.data.expired) {
            toast.error("OTP has expired. Please request a new one.");
            setTimer(0); // Set timer to expired
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
  const handleResetPassword = async () => {
    if (!validatePassword()) return;
    setLoading(true);
    try {
      // Step 2: Set new password with reset token
      const response = await axios.post("/api/auth/set-new-password", {
        email: email.toLowerCase().trim(),
        resetToken: resetToken,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      });
      if (response.data.success) {
        toast.success("Password reset successfully! Redirecting to login...");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login", {
            state: { 
              message: "Password reset successful. Please login with your new password.",
              email: email
            }
          });
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to reset password");      
        // If token expired, go back to OTP step
        // eslint-disable-next-line no-undef
        if (error.response?.data?.tokenExpired) {
          toast.error("Reset token expired. Please verify OTP again.");
          setStep(1);
          setResetToken(null);
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.response?.data?.message) {
        if (error.response.data.tokenExpired) {
          toast.error("Reset token expired. Please verify OTP again.");
          setStep(1);
          setResetToken(null);
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleBackToEmail = () => {
    navigate("/login");
  };
  const handleBackToOtp = () => {
    setStep(1);
    setNewPassword("");
    setConfirmPassword("");
    setResetToken(null);
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  };
  const renderStep1 = () => (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackToEmail}
            className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back
          </button>
          <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            Step 1 of 2
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Enter verification code
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          For your security, we sent the code to your email{" "}
          <span className="font-medium text-blue-600">{email}</span>.
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
            <span className="text-xs text-gray-500">
              6-digit code
            </span>
            {code.length > 0 && (
              <span className="text-xs text-gray-500">
                {code.length}/6 digits
              </span>
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
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span>
                  Code expires in {formatTime(timer)}
                </span>
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
            text-black font-medium
            flex items-center justify-center
          `}
        >
          {loading ? (
            <>
              <svg 
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" 
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
            'Verify & Continue'
          )}
        </button>
      </div>
    </>
  );
  const renderStep2 = () => (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackToOtp}
            className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to OTP
          </button>
          <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
            Step 2 of 2
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Set New Password
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          Create a strong password for your account ({email})
        </p>
        {resetToken && (
          <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            ✓ OTP verified successfully. You can now set your new password.
          </div>
        )}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 6 characters long
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className={`w-full border ${
                confirmPassword && newPassword !== confirmPassword
                  ? 'border-red-500'
                  : 'border-gray-300'
              } rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={loading}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Password Requirements:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-center">
              <svg 
                className={`w-4 h-4 mr-2 ${newPassword.length >= 6 ? 'text-green-500' : 'text-gray-400'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {newPassword.length >= 6 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                )}
              </svg>
              At least 6 characters
            </li>
            <li className="flex items-center">
              <svg 
                className={`w-4 h-4 mr-2 ${newPassword && confirmPassword && newPassword === confirmPassword ? 'text-green-500' : 'text-gray-400'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {newPassword && confirmPassword && newPassword === confirmPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                )}
              </svg>
              Passwords match
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword || !resetToken}
          className={`
            w-full py-3 rounded-md font-medium transition-all duration-300
            ${loading || newPassword.length < 6 || newPassword !== confirmPassword || !resetToken
              ? 'bg-green-300 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600'
            }
            text-white
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
              Resetting Password...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </div>
    </>
  );
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {/* Toast Notifications */}
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
        {/* Progress Bar */}
        <div className="flex">
          <div className={`w-1/2 h-1 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`w-1/2 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
        </div>
        <div className="p-6 sm:p-8">
          {step === 1 ? renderStep1() : renderStep2()}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="font-medium text-gray-700 mb-2 text-sm">
              Need help?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Contact support at{" "}
              <a 
                href="mailto:support@rymaacademy.com" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                support@rymaacademy.com
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
                xmlns="http://www.w3.org/2000/svg"
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