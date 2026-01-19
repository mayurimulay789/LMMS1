"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Play, Clock, Users, Star, BookOpen, Award, CheckCircle, Globe, X, Send, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { apiRequest, createApiUrl } from "../config/api"

const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [userProgress, setUserProgress] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [videoError, setVideoError] = useState("")
  const [relatedCourses, setRelatedCourses] = useState([])
  const [relatedCoursesLoading, setRelatedCoursesLoading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [completedVideos, setCompletedVideos] = useState(new Set())
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)
  const [userCertificates, setUserCertificates] = useState([])
  const [certificatesLoading, setCertificatesLoading] = useState(false)

  const modalVideoRef = useRef(null)
  
  useEffect(() => {
    fetchCourseDetails()
    fetchReviews()
    // Load completed videos from localStorage
    const savedCompletedVideos = localStorage.getItem(`completedVideos_${id}`)
    if (savedCompletedVideos) {
      setCompletedVideos(new Set(JSON.parse(savedCompletedVideos)))
    }
  }, [id])

  // Check if user has completed enough videos to show review prompt
  useEffect(() => {
    if (course?.lessons && completedVideos.size > 0) {
      const completionPercentage = (completedVideos.size / course.lessons.length) * 100
      // Show review prompt after completing at least 25% of the course
      if (completionPercentage >= 25 && !localStorage.getItem(`reviewPromptShown_${id}`)) {
        setShowReviewPrompt(true)
        localStorage.setItem(`reviewPromptShown_${id}`, 'true')
      }
    }
  }, [completedVideos, course, id])

  // Reset video error when modal closes
  useEffect(() => {
    if (!showVideoModal) {
      setVideoError("")
    }
  }, [showVideoModal])

  // Fetch all user certificates when certificate tab is active
  useEffect(() => {
    if (activeTab === "certificate" && isAuthenticated) {
      fetchUserCertificates()
    }
  }, [activeTab, isAuthenticated])

  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      console.log(`Fetching course details for ID: ${id}`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/courses/${id}`, {
        headers,
      })

      if (!response.ok) {
        // Try to parse JSON error body safely
        let errorData = null
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { message: response.statusText }
        }
        console.error("Server error:", errorData)
        setCourse(null)
        return
      }

      const data = await response.json()
      console.log("Fetched course:", data)

      // Handle different response structures
      let courseData = null
      if (data && data._id) {
        courseData = data
      } else if (data.data && data.data._id) {
        courseData = data.data
      } else if (data.course && data.course._id) {
        courseData = data.course
      }

      if (courseData) {
        setCourse(courseData)
        setIsEnrolled(courseData.isEnrolled)
        setUserProgress(courseData.userProgress)
        if (courseData.category) {
          fetchRelatedCourses(courseData.category)
        }
      } else {
        console.error("Invalid course data received:", data)
        setCourse(null)
      }
    } catch (error) {
      console.error("Error fetching course details:", error)
      setCourse(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      // Remove token requirement to fetch reviews - make it public
      const headers = {
        "Content-Type": "application/json",
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/courseReviews/${id}/reviews`, {
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched reviews:", data)
        
        let reviewsData = []
        if (Array.isArray(data)) {
          reviewsData = data
        } else if (data.reviews && Array.isArray(data.reviews)) {
          reviewsData = data.reviews
        } else if (data.data && Array.isArray(data.data)) {
          reviewsData = data.data
        }
        
        setReviews(reviewsData)
      } else {
        console.error("Failed to fetch reviews")
        setReviews([])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setReviews([])
    }
  }

  // Fetch user certificates from the same endpoint as CertificatesPage
  const fetchUserCertificates = async () => {
    if (!isAuthenticated) return;

    setCertificatesLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Use the same endpoint as your CertificatesPage component
      const url = createApiUrl("certificates/me")
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch certificates");
      }

      const data = await response.json();
      console.log("Fetched user certificates:", data);
      
      // Handle different response structures
      let certificatesData = [];
      if (Array.isArray(data)) {
        certificatesData = data;
      } else if (data.certificates && Array.isArray(data.certificates)) {
        certificatesData = data.certificates;
      } else if (data.data && Array.isArray(data.data)) {
        certificatesData = data.data;
      }
      
      setUserCertificates(certificatesData);
      
    } catch (error) {
      console.error("Error fetching user certificates:", error);
      // If the main endpoint fails, try alternative endpoints
      try {
        await fetchUserCertificatesFallback();
      } catch (fallbackError) {
        console.error("All certificate fetch attempts failed:", fallbackError);
        setUserCertificates([]);
      }
    } finally {
      setCertificatesLoading(false);
    }
  };

  // Fallback method to fetch certificates from alternative endpoints
  const fetchUserCertificatesFallback = async () => {
    const token = localStorage.getItem("token");
    const endpoints = [
      `${import.meta.env.VITE_API_URL}/certificates/user/my-certificates`,
      `${import.meta.env.VITE_API_URL}/certificates/my-certificates`,
      `${import.meta.env.VITE_API_URL}/certificates/user`,
      `${import.meta.env.VITE_API_URL}/certificates`,
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying fallback endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`Successfully fetched from fallback: ${endpoint}`, data);
          
          let certificatesData = [];
          if (Array.isArray(data)) {
            certificatesData = data;
          } else if (data.certificates && Array.isArray(data.certificates)) {
            certificatesData = data.certificates;
          } else if (data.data && Array.isArray(data.data)) {
            certificatesData = data.data;
          }
          
          if (certificatesData.length > 0) {
            setUserCertificates(certificatesData);
            return;
          }
        }
      } catch (error) {
        console.log(`Fallback endpoint ${endpoint} failed:`, error);
      }
    }
    
    setUserCertificates([]);
  };

  const markVideoAsCompleted = (videoId) => {
    const newCompletedVideos = new Set(completedVideos)
    newCompletedVideos.add(videoId)
    setCompletedVideos(newCompletedVideos)
    localStorage.setItem(`completedVideos_${id}`, JSON.stringify([...newCompletedVideos]))
    
    // Show review modal after completing a video
    if (!localStorage.getItem(`reviewSubmitted_${id}`)) {
      // Only prompt for a review if the user has purchased the course
      if (isEnrolled) {
        setTimeout(() => {
          setShowReviewModal(true)
        }, 2000)
      }
    }
  }

  // Enhanced video playback handler
  const handlePlayVideo = useCallback(() => {
    if (!course?.thumbnail) {
      setVideoError("No video available")
      return
    }

    // Transform URL to fix old /api/uploads/ format
    const videoUrl = course.thumbnail.replace('/api/uploads/', '/uploads/')

    // Check if it's a video file or Cloudinary video URL
    const isVideo = videoUrl.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv|m4v|3gp|wmv)$/i) ||
                   videoUrl.includes('cloudinary.com') && videoUrl.includes('/video/upload/')

    if (!isVideo) {
      setVideoError("This course preview is an image, not a video")
      return
    }

    setShowVideoModal(true)
    setVideoError("")

    // Use setTimeout to ensure modal is rendered before playing
    setTimeout(() => {
      if (modalVideoRef.current) {
        const video = modalVideoRef.current

        // Reset video source and reload
        video.load()

        video.play().catch((error) => {
          console.error('Error playing video in modal:', error)
          setVideoError(`Unable to play video: ${error.message}. The video format may not be supported by your browser.`)

          // Show format suggestions
          if (error.name === 'NotSupportedError') {
            setVideoError(prev => prev + " Try using MP4 format for better compatibility.")
          }
        })
      }
    }, 100)
  }, [course?.thumbnail])

  // Handle video errors
  const handleVideoError = useCallback((event) => {
    // Get the native DOM event to access the actual error
    const nativeEvent = event.nativeEvent || event
    console.error('Video error event:', nativeEvent)

    // Get the video element - handle both direct video errors and source errors
    let videoElement = nativeEvent.currentTarget || nativeEvent.target

    // If the target is a source element, get the parent video element
    if (videoElement && videoElement.tagName === 'SOURCE') {
      videoElement = videoElement.parentElement
    }

    // Wait a bit for the error to be set on the video element
    setTimeout(() => {
      const error = videoElement?.error

      let errorMessage = "Failed to load video. "

      if (error && typeof error.code === 'number') {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage += "Video playback was aborted."
            break
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage += "Network error occurred while loading the video. Please check your internet connection."
            break
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage += "Video format is not supported by your browser. Please try using MP4 format."
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage += "Video format not supported. Supported formats: MP4, WebM, OGG."
            break
          default:
            errorMessage += `An error occurred (code: ${error.code}).`
        }
      } else {
        // Fallback error messages based on common issues
        const videoSrc = videoElement?.currentSrc || videoElement?.src
        if (!videoSrc) {
          errorMessage += "No video source provided."
        } else if (videoSrc.startsWith('blob:') || videoSrc.startsWith('data:')) {
          errorMessage += "Video data appears to be corrupted or incomplete."
        } else if (videoSrc.includes('cloudinary') && videoSrc.includes('video/upload/')) {
          errorMessage += "Video file may be corrupted or not properly uploaded. Please try re-uploading the video."
        } else {
          errorMessage += "The video file could not be loaded. Please check the video URL and try again."
        }
      }

      console.error('Video error details:', {
        error,
        errorCode: error?.code,
        errorMessage: error?.message,
        videoSrc: videoElement?.currentSrc || videoElement?.src,
        networkState: videoElement?.networkState,
        readyState: videoElement?.readyState,
        finalErrorMessage: errorMessage
      })

      setVideoError(errorMessage)
    }, 100)
  }, [])

  // Handle video load
  const handleVideoLoad = useCallback(() => {
    console.log('Video loaded successfully')
    setVideoError("")
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0 || !comment.trim()) {
      return alert("Please provide rating and comment")
    }

    if (!course?._id) {
      return alert("Course details not loaded yet.")
    }

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Please login to submit a review.")
      navigate("/login")
      return
    }

    try {
      setLoading(true)

      console.log("Submitting review:", { rating, comment })

      const response = await apiRequest(`courseReviews/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      })
      // apiRequest returns { data, status, ok }
      if (!response || !response.ok) {
        const errMessage = response?.data?.message || "Failed to submit review"
        throw new Error(errMessage)
      }

      const data = response.data

      // Reset form
      setRating(0)
      setComment("")
      setShowReviewModal(false)
      localStorage.setItem(`reviewSubmitted_${id}`, 'true')
      alert("Your review has been submitted successfully!")
      
      // Refresh reviews after submission
      fetchReviews()

    } catch (err) {
      console.error("Review submission error:", err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getUserInfoFromReview = (review) => {
    console.log("Review data:", review)
    
    if (review.user && review.user.name) {
      return {
        name: review.user.name,
        avatar: review.user.avatar || review.user.profilePicture || "/placeholder.svg"
      }
    }
    
    if (review.userId && review.userId.name) {
      return {
        name: review.userId.name,
        avatar: review.userId.avatar || review.userId.profilePicture || "/placeholder.svg"
      }
    }
    
    if (review.createdBy && review.createdBy.name) {
      return {
        name: review.createdBy.name,
        avatar: review.createdBy.avatar || review.createdBy.profilePicture || "/placeholder.svg"
      }
    }
    
    if (review.author && review.author.name) {
      return {
        name: review.author.name,
        avatar: review.author.avatar || review.author.profilePicture || "/placeholder.svg"
      }
    }
    
    if (review.userName) {
      return {
        name: review.userName,
        avatar: review.userAvatar || "/placeholder.svg"
      }
    }
    
    if (review.name) {
      return {
        name: review.name,
        avatar: review.avatar || "/placeholder.svg"
      }
    }
    
    return {
      name: "Anonymous",
      avatar: "/placeholder.svg"
    }
  }

  const handleEnroll = () => {
    if (!isAuthenticated) {
      if (course.price === 0) {
        navigate("/login", { state: { from: `/courses/${course._id}` } })
      } else {
        navigate("/login", { state: { from: `/checkout/${course._id}` } })
      }
      return
    }

    if (course.price === 0) {
      enrollInCourse()
    } else {
      navigate(`/checkout/${course._id}`)
    }
  }

  const enrollInCourse = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await apiRequest(`enrollments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: id }),
      })
      // apiRequest returns { data, status, ok }
      if (res && res.ok) {
        alert("Enrolled successfully!")
        fetchCourseDetails()
      } else {
        const errMessage = res?.data?.message || "Failed to enroll"
        alert(errMessage)
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatPrice = (price) => {
    return price === 0 ? "Free" : `₹${price}`
  }

  const fetchRelatedCourses = async (category) => {
    setRelatedCoursesLoading(true)
    try {
      const response = await apiRequest(`courses?category=${category}&limit=4`)
        if (response && response.ok) {
          const data = response.data
          const filteredCourses = (data.courses || []).filter(course => course._id !== id)
          setRelatedCourses(filteredCourses)
        }
    } catch (error) {
      console.error("Error fetching related courses:", error)
    } finally {
      setRelatedCoursesLoading(false)
    }
  }

  // Function to handle certificate download
  const handleDownloadCertificate = async (certificateData) => {
    try {
      const token = localStorage.getItem("token");
      const downloadUrl = createApiUrl(`certificates/download/${certificateData.certificateId || certificateData.id}`)
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download certificate");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${certificateData.certificateId || certificateData.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download certificate");
    }
  };

  // Function to get course name from certificate data
  const getCourseNameFromCertificate = (certificateData) => {
    return certificateData.courseName || certificateData.course?.title || "Course Certificate";
  };

  // Function to get certificate issue date
  const getCertificateIssueDate = (certificateData) => {
    return certificateData.issueDate || certificateData.issuedAt || 'N/A';
  };

  // Function to get certificate ID
  const getCertificateId = (certificateData) => {
    return certificateData.certificateId || certificateData.id || 'N/A';
  };

  // Function to check if certificate belongs to current course
  const isCertificateForCurrentCourse = (cert) => {
    const certCourseName = getCourseNameFromCertificate(cert).toLowerCase();
    const currentCourseName = (course?.title || "").toLowerCase();
    return certCourseName === currentCourseName;
  };

  // Function to check if user can download certificate
  const canDownloadCertificate = () => {
    return isAuthenticated && isEnrolled && userCertificates.some(isCertificateForCurrentCourse);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    { id: "instructor", label: "Instructor" },
    { id: "reviews", label: "Reviews" },
    { id: "certificate", label: "Certificate" },
  ]

  // Video Modal Component
  const VideoModal = () => (
    <AnimatePresence>
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-black rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowVideoModal(false)
                if (modalVideoRef.current) {
                  modalVideoRef.current.pause()
                }
              }}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Video Player */}
            <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
              {course?.thumbnail && (
                <video
                  ref={modalVideoRef}
                  className="absolute top-0 left-0 w-full h-full"
                  controls
                  preload="metadata"
                  onError={handleVideoError}
                  onLoadedData={handleVideoLoad}
                  onEnded={() => markVideoAsCompleted('preview')}
                  crossOrigin="anonymous"
                >
                  <source src={course.thumbnail.replace('/api/uploads/', '/uploads/')} type="video/mp4" />
                  <source src={course.thumbnail.replace('/api/uploads/', '/uploads/')} type="video/webm" />
                  <source src={course.thumbnail.replace('/api/uploads/', '/uploads/')} type="video/ogg" />
                  Your browser does not support the video tag.
                  <p>Download the video: <a href={course.thumbnail.replace('/api/uploads/', '/uploads/')} target="_blank" rel="noopener noreferrer">Click here</a></p>
                </video>
              )}
            </div>

            {/* Video Error Message */}
            {videoError && (
              <div className="p-4 bg-primary-800 bg-opacity-50 text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-primary-800">Video Error:</span>
                </div>
                <p className="text-sm text-primary-800">{videoError}</p>
                <div className="mt-2 text-xs text-primary-800">
                  <p>Supported formats: MP4, WebM, OGG</p>
                  <p>Recommended: MP4 with H.264 codec for best compatibility</p>
                </div>
              </div>
            )}

            {/* Video Info */}
            <div className="p-4 text-white">
              <h3 className="text-xl font-bold mb-2">{course?.title} - Preview</h3>
              <p className="text-gray-300">Course preview video</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  // Review Modal Component
  const ReviewModal = () => (
    <AnimatePresence>
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">How was your learning experience?</h3>
                <p className="text-blue-100">Share your thoughts with other students</p>
              </div>
            </div>

            {/* Review Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div className="text-center">
                  <div className="flex justify-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-3xl hover:scale-110 focus:scale-110"
                      >
                        {star <= rating ? (
                          <Star className="h-8 w-8 text-yellow-400 fill-current" />
                        ) : (
                          <Star className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {rating === 0 ? "Tap to rate" : `You rated ${rating} star${rating > 1 ? 's' : ''}`}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like about this course? What could be improved?"
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || rating === 0 || !comment.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>

                {/* Skip Button */}
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-full text-gray-600 py-2 rounded-lg font-medium hover:text-gray-800"
                >
                  Maybe later
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  // Review Prompt Component (floating button)
  const ReviewPrompt = () => (
    <AnimatePresence>
      {showReviewPrompt && isEnrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0, x: 100 }}
          onClick={() => setShowReviewModal(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl z-40 hover:shadow-3xl hover:scale-110 group"
        >
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span className="font-semibold text-sm">Review Course</span>
          </div>
          <div className="absolute -top-2 -right-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-green-400 rounded-full"
            />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-64 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-300 h-8 rounded mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4"></div>
              </div>
              <div className="bg-gray-300 h-96 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Courses
          </button>
        </div>
      </div>
    )
  }

  // Check if thumbnail is a video
  const isVideoThumbnail = course.thumbnail && course.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv|m4v|3gp|wmv)$/i)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Video Modal */}
      <VideoModal />
      
      {/* Review Modal (only for purchased users) */}
      {isEnrolled && <ReviewModal />}
      
      {/* Floating Review Prompt */}
      <ReviewPrompt />

      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex justify-between items-center mb-4 w-full">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-medium max-w-[120px] truncate">{course.category}</span>
                  <span className="bg-gray-700 text-white px-2 py-0.5 rounded-full text-xs font-medium max-w-[120px] truncate">{course.level}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-sm sm:text-base md:text-xl text-gray-300 mb-6">{course.description}</p>

                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="font-medium">{course.avgRating}</span>
                    <span className="text-gray-300">({course.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-5 w-5" />
                    <span>{course.enrollmentCount.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-5 w-5" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <img
                    src={course.createdBy?.profile?.avatar || course.instructorImage || "/placeholder.svg"}
                    alt={course.createdBy?.name || course.instructor}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">Created by {course.createdBy?.name || course.instructor}</p>
                    <p className="text-sm text-gray-300">
                      Last updated {new Date(course.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Course Preview */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="relative bg-gray-100">
                  {isVideoThumbnail ? (
                    // Video Thumbnail with Play Button
                    <div className="relative">
                      <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="mb-3">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                              <Play className="h-8 w-8 text-white ml-1" />
                            </div>
                          </div>
                          <p className="text-sm font-medium">Video Preview Available</p>
                          <p className="text-xs text-gray-300 mt-1">Click to watch</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Image Thumbnail
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg"
                      }}
                    />
                  )}
                </div>

                <div className="p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-4">{formatPrice(course.price)}</div>

                  {isEnrolled ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate(`/courses/${course._id}/learn`)}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <Play className="h-5 w-5" />
                        <span>Continue Learning</span>
                      </button>
                      {isVideoThumbnail && (
                        <button
                          onClick={handlePlayVideo}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
                        >
                          <Play className="h-4 w-4" />
                          <span>Watch Preview</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleEnroll}
                        className="w-full py-3 rounded-lg font-semibold bg-primary-800 text-white hover:bg-primary-800"
                      >
                        {course.price === 0 ? "Enroll for Free" : "Buy Now"}
                      </button>
                      {isVideoThumbnail && (
                        <button
                          onClick={handlePlayVideo}
                          className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center space-x-2"
                        >
                          <Play className="h-4 w-4" />
                          <span>Preview this course</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Full lifetime access</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Access on mobile</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Certificate of completion</span>
                      <Award className="h-4 w-4 text-green-500" />
                    </div>
                  </div>

                  {/* Video format info */}
                  {isVideoThumbnail && (
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700 text-center">
                        📹 Video preview available - Click to watch
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8 overflow-x-auto whitespace-nowrap no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && (
                <div className="space-y-8">
                

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold">
                          {Array.isArray(course.modules) ? 
                            course.modules.reduce((total, module) => 
                              total + (Array.isArray(module.subcourses) ? module.subcourses.length : 0), 0
                            ) : 0}
                        </div>
                        <div className="text-sm text-gray-600">Lessons</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold">{formatDuration(course.duration)}</div>
                        <div className="text-sm text-gray-600">Duration</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold">{course.language}</div>
                        <div className="text-sm text-gray-600">Language</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold">Certificate</div>
                        <div className="text-sm text-gray-600">Included</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Course Curriculum</h3>
                  </div>
                  <div className="space-y-6">
                    {Array.isArray(course.modules) && course.modules.map((module, moduleIndex) => (
                      <div key={module._id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b">
                          <h4 className="text-lg font-semibold text-gray-900">{module.name}</h4>
                        </div>
                        <div className="divide-y">
                          {Array.isArray(module.subcourses) && module.subcourses.map((subcourse, lessonIndex) => (
                            <div
                              key={subcourse._id}
                              className={`p-4 ${
                                isEnrolled ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""
                              }`}
                              onClick={() => {
                                if (isEnrolled) {
                                  navigate(`/courses/${course._id}/learn?module=${module._id}&lesson=${subcourse._id}`)
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600">
                                      {moduleIndex + 1}.{lessonIndex + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900">{subcourse.title || 'Untitled Lesson'}</h5>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <span className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatDuration(subcourse.duration || 0)}</span>
                                      </span>
                                      {subcourse.preview && (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                          Preview
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {subcourse.preview ? (
                                  <button
                                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(`/courses/${course._id}/learn?module=${module._id}&lesson=${subcourse._id}`)
                                    }}
                                  >
                                    <Play className="h-4 w-4" />
                                    <span>Preview</span>
                                  </button>
                                ) : isEnrolled ? (
                                  <div className="text-blue-600 flex items-center space-x-1">
                                    <Play className="h-4 w-4" />
                                    <span className="text-sm">Watch</span>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "instructor" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">About the Instructor</h3>
                  {course.createdBy ? (
                    <div className="flex items-start space-x-6">
                      <img
                        src={course.instructorImage || course.createdBy?.profile?.avatar || "/placeholder.svg"}
                        alt={course.createdBy?.name || "Instructor"}
                        className="w-24 h-24 rounded-full"
                      />
                      <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                          {course.instructor || course.createdBy.name || "Instructor"}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {course.createdBy.profile?.bio || "No bio available"}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{course.enrollmentCount.toLocaleString()} students</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{course.avgRating} rating</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Instructor information is currently unavailable.</p>
                      <p className="text-sm text-gray-500">Please try refreshing the page or contact support if the issue persists.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h3>

                  {/* Review Form - Only show if user has purchased the course */}
                  {isAuthenticated ? (
                    isEnrolled ? (
                      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
                      <div>
                        <label className="block mb-1 font-medium">Rating</label>
                        <fieldset className="starability-slot">
                          <input
                            type="radio"
                            id="no-rate"
                            className="input-no-rate"
                            name="review[rating]"
                            value="0"
                            defaultChecked
                            aria-label="No rating."
                          />
                          <input
                            type="radio"
                            id="first-rate1"
                            name="review[rating]"
                            value="1"
                            checked={rating === 1}
                            onChange={(e) => setRating(Number(e.target.value))}
                          />
                          <label htmlFor="first-rate1" title="Terrible">1 star</label>

                          <input
                            type="radio"
                            id="first-rate2"
                            name="review[rating]"
                            value="2"
                            checked={rating === 2}
                            onChange={(e) => setRating(Number(e.target.value))}
                          />
                          <label htmlFor="first-rate2" title="Not good">2 stars</label>

                          <input
                            type="radio"
                            id="first-rate3"
                            name="review[rating]"
                            value="3"
                            checked={rating === 3}
                            onChange={(e) => setRating(Number(e.target.value))}
                          />
                          <label htmlFor="first-rate3" title="Average">3 stars</label>

                          <input
                            type="radio"
                            id="first-rate4"
                            name="review[rating]"
                            value="4"
                            checked={rating === 4}
                            onChange={(e) => setRating(Number(e.target.value))}
                          />
                          <label htmlFor="first-rate4" title="Very good">4 stars</label>

                          <input
                            type="radio"
                            id="first-rate5"
                            name="review[rating]"
                            value="5"
                            checked={rating === 5}
                            onChange={(e) => setRating(Number(e.target.value))}
                          />
                          <label htmlFor="first-rate5" title="Amazing">5 stars</label>
                        </fieldset>
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">Comment</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full p-2 border rounded"
                          rows={3}
                          placeholder="Write your review..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        {loading ? "Submitting..." : "Submit Review"}
                      </button>
                      </form>
                    ) : (
                      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-800">
                          <strong>Buy this course to leave a review.</strong>{' '}
                          You can only submit reviews after purchasing the course.
                        </p>
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              if (course.price === 0) {
                                enrollInCourse()
                              } else {
                                navigate(`/checkout/${course._id}`)
                              }
                            }}
                            className="mt-2 px-4 py-2 rounded bg-primary-800 text-white"
                          >
                            {course.price === 0 ? 'Enroll for Free' : 'Buy Now'}
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800">
                        <strong>Want to share your experience?</strong>{' '}
                        <button 
                          onClick={() => navigate('/login')} 
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          Login to submit a review
                        </button>
                      </p>
                    </div>
                  )}

                  {/* List of existing reviews - ALWAYS SHOW TO PUBLIC */}
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        What students are saying ({reviews.length} reviews)
                      </h4>
                      {reviews.map((review) => {
                        const userInfo = getUserInfoFromReview(review);
                        
                        return (
                          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start space-x-4">
                              <img
                                src={userInfo.avatar}
                                alt={userInfo.name}
                                className="w-12 h-12 rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium text-gray-900">{userInfo.name}</h4>
                                  <div className="flex items-center">
                                    {[...Array(review.rating)].map((_, i) => (
                                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
                      {!isAuthenticated && (
                        <button 
                          onClick={() => navigate('/login')}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Login to Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "certificate" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">My Certificate</h3>

                  {!isAuthenticated ? (
                    <div className="text-center py-8 bg-blue-50 rounded-lg">
                      <Award className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Login to View Certificates</h5>
                      <p className="text-gray-600 mb-4">Sign in to access your earned certificates.</p>
                      <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Login
                      </button>
                    </div>
                  ) : !isEnrolled ? (
                    <div className="text-center py-8 bg-yellow-50 rounded-lg">
                      <Award className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Enroll to Get Certificate</h5>
                      <p className="text-gray-600 mb-4">Purchase and complete this course to earn your certificate.</p>
                      <button
                        onClick={() => handleEnroll()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {course.price === 0 ? 'Enroll for Free' : 'Buy Now'}
                      </button>
                    </div>
                  ) : certificatesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading certificates...</span>
                    </div>
                  ) : userCertificates.filter(isCertificateForCurrentCourse).length > 0 ? (
                    <div className="space-y-4">
                      {userCertificates.filter(isCertificateForCurrentCourse).map((cert) => {
                        const courseName = getCourseNameFromCertificate(cert);
                        const issueDate = getCertificateIssueDate(cert);
                        const certificateId = getCertificateId(cert);
                        
                        return (
                          <div key={cert.id || cert.certificateId} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <Award className="h-5 w-5 text-green-600" />
                                <div>
                                  <h5 className="font-semibold text-gray-900 text-sm">{courseName}</h5>
                                  <p className="text-xs text-gray-600">Certificate of Completion</p>
                                </div>
                              </div>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Completed
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                              <div>
                                <span className="text-gray-600">Issued:</span>
                                <span className="text-gray-900 ml-1">
                                  {issueDate !== 'N/A' ? new Date(issueDate).toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">ID:</span>
                                <span className="text-gray-900 ml-1 font-mono">
                                  {certificateId}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDownloadCertificate(cert)}
                              className="w-full bg-green-100 text-green-800 py-2 px-3 rounded text-xs hover:bg-green-200 border border-green-300 flex items-center justify-center space-x-1 font-medium"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download Certificate</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">No Certificate Yet</h5>
                      <p className="text-gray-600">
                        Complete this course to earn your certificate.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Related Courses */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Related Courses</h4>
                {relatedCoursesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex space-x-3">
                        <div className="w-16 h-12 bg-gray-300 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : relatedCourses.length > 0 ? (
                  <div className="space-y-4">
                    {relatedCourses.map((course) => (
                      <div key={course._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer" onClick={() => navigate(`/courses/${course._id}`)}>
                        {course.thumbnail && course.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv|m4v|3gp|wmv)$/i) ? (
                          <div className="w-16 h-12 bg-gray-800 rounded flex items-center justify-center">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        ) : (
                          <img
                            src={course.thumbnail || "/placeholder.svg"}
                            alt={course.title}
                            className="w-16 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg"
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-sm truncate">{course.title}</h5>
                          <p className="text-xs text-gray-600 truncate">By {course.createdBy?.name || course.instructor}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm font-semibold text-gray-900">{formatPrice(course.price)}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{course.avgRating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No related courses found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage