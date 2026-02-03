"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { BookOpen, Award, TrendingUp, Download, Eye, Menu, User } from "lucide-react"
import { fetchUserEnrollments, fetchUserProgress, fetchUserCertificates } from "../store/slices/enrollmentSlice"
import { createApiUrl } from "../config/api"

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { enrollments, progress, certificates, isLoading } = useSelector((state) => state.enrollment)
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
    profileImageFile: null,
    nameError: '',
    phoneError: '',
    bio: '',
    bioError: '',
  })


 console.log("DashboardPage rendered with user:", user); 
 

  // Initialize form with user data when user is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.profile?.bio || '',
        profileImage: user.profileImage || ''
      }))
    }
  }, [user])

  useEffect(() => {
    if (user) {
      dispatch(fetchUserEnrollments())
      dispatch(fetchUserCertificates())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (enrollments.length > 0) {
      enrollments.forEach((enrollment, index) => {
        if (
          enrollment &&
          enrollment.course &&
          enrollment.course._id &&
          typeof enrollment.course._id === "string" &&
          enrollment.course._id.trim() !== "" &&
          enrollment.course._id !== "undefined" &&
          enrollment.course._id !== "null"
        ) {
          setTimeout(() => {
            dispatch(fetchUserProgress(enrollment.course._id))
          }, index * 200)
        } else {
          console.warn("Skipping fetchUserProgress due to invalid enrollment data:", enrollment)
        }
      })
    }
  }, [dispatch, enrollments])

  const handleEditProfile = async () => {
    // Validate form
    const nameError = !formData.name?.trim() 
      ? 'Name is required' 
      : formData.name.trim().length < 2 
        ? 'Name must be at least 2 characters' 
        : ''
    
    const phoneError = !formData.phone?.trim() 
      ? 'Phone number is required' 
      : !/^[\d\s\-\(\)\+]{10,}$/.test(formData.phone.replace(/\s/g, '')) 
        ? 'Please enter a valid phone number (at least 10 digits)' 
        : ''

    // Update errors in state
    setFormData(prev => ({
      ...prev,
      nameError,
      phoneError
    }))

    // If there are validation errors, don't proceed
    if (nameError || phoneError) {
      if (nameError) {
        document.querySelector('input[name="name"]')?.scrollIntoView({ behavior: 'smooth' })
      } else if (phoneError) {
        document.querySelector('input[name="phone"]')?.scrollIntoView({ behavior: 'smooth' })
      }
      return
    }

    // Set saving state
    setIsSaving(true)

    try {
      // Use your VITE_API_URL
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2000/api"
      const token = localStorage.getItem('token')
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.')
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name.trim())
      formDataToSend.append('phone', formData.phone.trim())
      formDataToSend.append('bio', formData.bio.trim())
      
      // Append profile image file if selected
      if (formData.profileImageFile) {
        formDataToSend.append('profileImage', formData.profileImageFile)
      }

      console.log('📤 Sending profile update request...')
      
      // Make API request to update profile
      const response = await fetch(`${API_BASE_URL}/auth/instructor-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser sets it automatically
        },
        credentials: 'include',
        body: formDataToSend,
      })

      console.log('Response status:', response.status)

      // Parse response
      const responseData = await response.json()

      if (!response.ok) {
        console.error('Server error response:', responseData)
        throw new Error(responseData.message || `Failed to update profile (Status: ${response.status})`)
      }

      console.log('✅ Profile update successful:', responseData)
      
      // Update the formData with new user data
      if (responseData.user) {
        setFormData(prev => ({
          ...prev,
          name: responseData.user.name || prev.name,
          phone: responseData.user.phone || prev.phone,
          profileImage: responseData.user.profileImage || prev.profileImage,
          profileImageFile: null, // Reset file after successful upload
          nameError: '',
          phoneError: ''
        }))
        
        // Update local storage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = {
          ...storedUser,
          name: responseData.user.name,
          phone: responseData.user.phone,
          profileImage: responseData.user.profileImage
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // You might want to dispatch an action to update Redux state here
        // dispatch(updateUserProfile(updatedUser))
      }
      
      // Show success message
      setMessage({ 
        type: 'success', 
        text: responseData.message || 'Profile updated successfully!' 
      })
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
      
    } catch (error) {
      console.error('❌ Profile update error:', error)
      
      // Set error message
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile. Please try again.' 
      })
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'File size too large. Maximum size is 5MB.'
      })
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setMessage({
        type: 'error',
        text: 'Invalid file type. Please upload JPG, PNG, or GIF image.'
      })
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        profileImage: reader.result,
        profileImageFile: file
      }))
    }
    reader.readAsDataURL(file)
  }

  const stats = [
    {
      icon: BookOpen,
      label: "Enrolled Courses",
      value: enrollments.length,
      color: "bg-blue-100 text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: BookOpen,
      label: "My Enrollments",
      value: enrollments.length,
      color: "bg-green-100 text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Award,
      label: "Certificates",
      value: certificates.length,
      color: "bg-purple-100 text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: TrendingUp,
      label: "Avg Progress",
      value: `${Math.round(
        Object.values(progress).reduce((total, p) => total + (p.completionPercentage || 0), 0) /
          (Object.keys(progress).length || 1),
      )}%`,
      color: "bg-orange-100 text-orange-600",
      bgColor: "bg-orange-50"
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-6 w-48 rounded mb-6 md:h-8 md:w-64 md:mb-8"></div>
            <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 md:gap-6 md:mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 md:p-6">
                  <div className="bg-gray-300 h-8 w-8 rounded-lg mb-3 md:h-12 md:w-12 md:mb-4"></div>
                  <div className="bg-gray-300 h-3 rounded mb-2 md:h-4"></div>
                  <div className="bg-gray-300 h-5 w-12 rounded md:h-6"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 md:p-6">
                  <div className="bg-gray-300 h-5 rounded mb-4 md:h-6"></div>
                  <div className="space-y-3">
                    <div className="bg-gray-300 h-16 rounded md:h-20"></div>
                    <div className="bg-gray-300 h-16 rounded md:h-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Message Alert */}
        {message.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{message.text}</span>
              </div>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl">
              Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'there'}!</span>
            </h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 md:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600 md:text-base">Continue your learning journey and track your progress</p>
        </div>

        {/* Mobile Stats Tabs */}
        <div className="mb-4 md:hidden">
          <div className="flex overflow-x-auto gap-1 pb-2">
            {stats.map((stat, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(stat.label.toLowerCase().replace(' ', '-'))}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                  activeTab === stat.label.toLowerCase().replace(' ', '-')
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {stat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0 md:w-12 md:h-12 md:mb-2`}>
                  <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs text-gray-600 mb-1 md:text-sm">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 md:text-xl">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Stats Display */}
        <div className="md:hidden mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`mb-3 rounded-lg p-4 ${stat.bgColor} ${
                activeTab === stat.label.toLowerCase().replace(' ', '-') ? 'block' : 'hidden'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Personal Information & Profile Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Management</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Personal Information</h4>
                
                {/* Profile Image Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
                        {formData.profileImage ? (
                          <img 
                            src={formData.profileImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://via.placeholder.com/150'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      {formData.profileImageFile && (
                        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 
                          file:mr-4 file:py-2 file:px-4 
                          file:rounded-lg file:border-0 
                          file:text-sm file:font-medium
                          file:bg-blue-50 file:text-blue-700 
                          hover:file:bg-blue-100"
                        id="profile-image"
                      />
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF (max 5MB)</p>
                      <label 
                        htmlFor="profile-image" 
                        className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Choose different photo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Personal Info Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        name: e.target.value,
                        nameError: '' 
                      }))}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.nameError 
                          ? 'border-red-300 focus:border-red-300' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      required
                    />
                    {formData.nameError && (
                      <p className="mt-1 text-xs text-red-500">{formData.nameError}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        phone: e.target.value,
                        phoneError: '' 
                      }))}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.phoneError 
                          ? 'border-red-300 focus:border-red-300' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="+91 9876543210"
                      required
                    />
                    {formData.phoneError && (
                      <p className="mt-1 text-xs text-red-500">{formData.phoneError}</p>
                    )}
                  </div>
                  <div>
                  {/* bio */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea 
                      name="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="1"
                      placeholder="Tell us a bit about yourself"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button 
                  onClick={handleEditProfile}
                  disabled={isSaving}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Certificates */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 md:text-lg">Recent Certificates</h3>
              <Link 
                to="/certificates" 
                className="text-blue-600 hover:text-blue-800 text-xs font-medium md:text-sm transition-colors"
              >
                View All →
              </Link>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm mb-1">No certificates earned yet</p>
                <p className="text-gray-500 text-xs">Complete courses to earn certificates</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.slice(0, 3).map((certificate, idx) => (
                  <div 
                    key={certificate._id || certificate.certificateId || certificate.id || idx} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {certificate.courseName || certificate.course?.name || 'Unnamed Course'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Earned on {new Date(certificate.issueDate || certificate.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
                          {certificate.grade || 'Completed'}
                        </span>
                        {certificate.finalScore && (
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {certificate.finalScore}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          window.open(
                            createApiUrl(`certificates/pdf/${certificate.certificateId || certificate._id}`),
                            "_blank",
                          )
                        }
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Certificate"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = createApiUrl(`certificates/download/${certificate.certificateId || certificate._id}`)
                          link.download = `${certificate.certificateNumber || 'certificate'}.pdf`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download Certificate"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="fixed inset-x-0 bottom-0 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <p className="font-medium text-gray-900">{enrollments.length} Courses</p>
              <p className="text-gray-500">{certificates.length} Certificates</p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/courses"
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Summary - Mobile Only */}
        <div className="md:hidden mt-6 mb-20">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Progress Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${stat.color} mb-2`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage