import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
const UserDetailsforForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [, setApiResponse] = useState(null);
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };
  const handleContinue = async () => {
    // Clear previous errors
    setErrors({});
    setApiResponse(null);
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      toast.error(emailError);
      return;
    }
    setLoading(true);
    try {
      // Call your API endpoint
      const response = await axios.post(
        '/api/auth/searchuserbyemailandreset',
        { email: email.toLowerCase().trim() }
      );
      console.log('API Response:', response.data);
      setApiResponse(response.data);
      if (response.data.success) {
        if (response.data.otpSent) {
          // OTP sent successfully
          toast.success('OTP sent to your email!');         
          // Navigate to OTP validation page with email
          navigate('/otpvalidationpage', {
            state: {
              email: email,
              otpSent: true,
              message: response.data.message
            }
          });
        } else {
          // User not found or other issues (for security, show generic message)
          toast.success(response.data.message);
          
          // Still navigate but show appropriate message
          navigate('/otpvalidationpage', {
            state: {
              email: email,
              otpSent: false,
              message: response.data.message
            }
          });
        }
      } else {
        // API returned success: false
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Server error occurred'; 
        // Handle specific status codes
        if (error.response.status === 400) {
          // Bad request (validation errors)
          toast.error(errorMessage);
          if (error.response.data?.emailVerified === false) {
            toast.error('Please verify your email first');
          }
        } else if (error.response.status === 429) {
          // Too many requests
          toast.error(errorMessage || 'Too many attempts. Please try again later.');
        } else if (error.response.status === 500) {
          // Server error
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(errorMessage);
        }
        setApiResponse(error.response.data);
      } else if (error.request) {
        // Request made but no response
        toast.error('Network error. Please check your connection.');
      } else {
        // Other errors
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleContinue();
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4">
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
      <div className="
        bg-white 
        border border-gray-300 
        rounded-lg 
        shadow-md 
        w-full 
        max-w-xs 
        sm:max-w-sm
        md:max-w-md
        min-h-[180px]
        flex flex-col items-center justify-center 
        p-4 
        sm:p-6 
        md:p-8
        text-center
        transform transition-all duration-300
        hover:shadow-lg
      ">
        {/* Logo/Header */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          <h1 className="
            text-xl 
            sm:text-2xl 
            font-bold 
            text-gray-800 
            mb-2
          ">
            Password assistance
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Enter the email address associated with your RYMAACADEMY account
          </p>
        </div>
        {/* Form */}
        <div className="w-full space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`
                w-full 
                px-4 
                py-3 
                rounded-lg 
                border 
                ${errors.email ? 'border-red-500' : 'border-gray-300'} 
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500 
                focus:border-transparent 
                text-sm
                sm:text-base
                transition-all
                duration-200
                ${errors.email ? 'bg-red-50' : 'bg-white'}
              `}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 text-left pl-1">
                {errors.email}
              </p>
            )}
          </div>
          <button
            onClick={handleContinue}
            disabled={loading}
            className={`
              w-full 
              py-3 
              font-medium 
              rounded-lg 
              text-sm
              sm:text-base
              transition-all
              duration-300
              transform
              hover:scale-[1.02]
              focus:outline-none
              focus:ring-2
              focus:ring-offset-2
              focus:ring-[#890c25]
              disabled:opacity-70
              disabled:cursor-not-allowed
              ${loading 
                ? 'bg-[#890c25] cursor-wait' 
                : 'bg-[#890c25] hover:bg-[#890c25] active:bg-[#890c25]'
              }
              text-white
              font-medium
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
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 w-full">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <svg 
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              <p className="text-xs sm:text-sm text-gray-600 text-left">
                You will receive an OTP (One Time Password) on your registered email
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <svg 
                className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
              <p className="text-xs sm:text-sm text-gray-600 text-left">
                The OTP is valid for 10 minutes
              </p>
            </div>
          </div>
          {/* Back to Login */}
          <div className="mt-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 flex items-center justify-center mx-auto"
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
};
export default UserDetailsforForgetPassword;