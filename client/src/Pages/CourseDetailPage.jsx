"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Play, Clock, Users, Star, BookOpen, Award, CheckCircle, Globe, Share2, Heart } from "lucide-react"
import { motion } from "framer-motion"


const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [course, setCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [userProgress, setUserProgress] = useState(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [showVideoControls, setShowVideoControls] = useState(false)
  const [relatedCourses, setRelatedCourses] = useState([])
  const [relatedCoursesLoading, setRelatedCoursesLoading] = useState(false)
  const videoRef = useRef(null)
  useEffect(() => {
    fetchCourseDetails()
  }, [id])

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`http://localhost:2000/api/courses/${id}`, {
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        setCourse(data)
        setIsEnrolled(data.isEnrolled)
        setUserProgress(data.userProgress)
        // Fetch related courses
        if (data.category) {
          fetchRelatedCourses(data.category)
        }
      }
    } catch (error) {
      console.error("Error fetching course details:", error)
      // Set error state instead of using mock data
      setCourse(null)
    } finally {
      setIsLoading(false)
    }
  }

const handleEnroll = async () => {
  if (!isAuthenticated) {
    navigate("/login")
    return
  }

  // Check enrollment status before proceeding
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:2000/api/enrollments/${course._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data) {
        // Already enrolled
        setIsEnrolled(true)
        fetchCourseDetails()
        return
      }
    }
  } catch (error) {
    console.error("Error checking enrollment before enroll:", error)
  }

  if (course.price === 0) {
    // Free course - direct enrollment
    enrollInCourse()
  } else {
    // Paid course - redirect to checkout
    navigate(`/checkout/${course._id}`)
  }
}

  const enrollInCourse = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/enrollments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: course._id }),
      })

      if (response.ok) {
        setIsEnrolled(true)
        // Refresh course data
        fetchCourseDetails()
      }
    } catch (error) {
      console.error("Error enrolling in course:", error)
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

  const handlePlayVideo = () => {
    if (videoRef.current) {
      setIsVideoPlaying(true)
      setShowVideoControls(true)
      videoRef.current.play().catch((error) => {
        console.error('Error playing video:', error)
        // Fallback: try to show controls if play fails
        videoRef.current.controls = true
      })
    }
  }

  const fetchRelatedCourses = async (category) => {
    setRelatedCoursesLoading(true)
    try {
      const response = await fetch(`http://localhost:2000/api/courses?category=${category}&limit=4`)
      if (response.ok) {
        const data = await response.json()
        // Filter out the current course
        const filteredCourses = data.courses.filter(course => course._id !== id)
        setRelatedCourses(filteredCourses)
      }
    } catch (error) {
      console.error("Error fetching related courses:", error)
    } finally {
      setRelatedCoursesLoading(false)
    }
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    { id: "instructor", label: "Instructor" },
    { id: "reviews", label: "Reviews" },
  ]

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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">{course.category}</span>
                  <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">{course.level}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-gray-300 mb-6">{course.description}</p>

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
                  {course.thumbnail && course.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i) ? (
                    <video
                      ref={videoRef}
                      src={course.thumbnail}
                      className="w-full h-48 object-cover"
                      muted
                      controls={false}
                      preload="metadata"
                      onError={(e) => {
                        console.log('CourseDetail video load error:', e)
                        console.log('CourseDetail video src:', course.thumbnail)
                        e.target.style.display = 'none'
                        const fallback = e.target.parentElement.querySelector('.coursedetail-video-fallback') || document.createElement('div')
                        fallback.className = 'coursedetail-video-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 font-medium'
                        fallback.textContent = 'VIDEO'
                        if (!e.target.parentElement.querySelector('.coursedetail-video-fallback')) {
                          e.target.parentElement.appendChild(fallback)
                        }
                      }}
                      onLoadedData={(e) => {
                        console.log('CourseDetail video loaded successfully')
                        const fallback = e.target.parentElement.querySelector('.coursedetail-video-fallback')
                        if (fallback) fallback.remove()
                      }}
                    />
                  ) : (
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.log('CourseDetail image load error:', e)
                        console.log('CourseDetail image src:', course.thumbnail)
                        e.target.style.display = 'none'
                        const fallback = e.target.parentElement.querySelector('.coursedetail-image-fallback') || document.createElement('div')
                        fallback.className = 'coursedetail-image-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 font-medium'
                        fallback.textContent = 'IMG'
                        if (!e.target.parentElement.querySelector('.coursedetail-image-fallback')) {
                          e.target.parentElement.appendChild(fallback)
                        }
                      }}
                      onLoad={(e) => {
                        console.log('CourseDetail image loaded successfully')
                        const fallback = e.target.parentElement.querySelector('.coursedetail-image-fallback')
                        if (fallback) fallback.remove()
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <button
                      onClick={handlePlayVideo}
                      className="bg-white bg-opacity-90 rounded-full p-4 hover:bg-opacity-100 transition-all"
                    >
                      <Play className="h-8 w-8 text-gray-900 ml-1" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-4">{formatPrice(course.price)}</div>

                  {isEnrolled ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate(`/courses/${course._id}/learn`)}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Play className="h-5 w-5" />
                        <span>Continue Learning</span>
                      </button>
                      {userProgress && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Progress: {userProgress.completionPercentage}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${userProgress.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {course.price === 0 ? "Enroll for Free" : "Buy Now"}
                    </button>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Full lifetime access</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Access on mobile and TV</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Certificate of completion</span>
                      <Award className="h-4 w-4 text-green-500" />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                      <Heart className="h-4 w-4" />
                      <span>Wishlist</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {course.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h3>
                    <ul className="space-y-2">
                      {course.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold">{course.lessons.length}</div>
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
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => (
                      <div
                        key={lesson._id}
                        className={`border border-gray-200 rounded-lg p-4 ${
                          isEnrolled ? "cursor-pointer hover:shadow-md hover:border-blue-300 transition-all" : ""
                        }`}
                        onClick={() => {
                          if (isEnrolled) {
                            navigate(`/courses/${course._id}/learn?lesson=${lesson._id}`)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDuration(lesson.duration)}</span>
                                </span>
                                {lesson.preview && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Preview</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {lesson.preview ? (
                            <button
                              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle preview - could navigate to learn page with preview mode
                                navigate(`/courses/${course._id}/learn?lesson=${lesson._id}`)
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
                  <div className="space-y-6">
                    {course.reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-start space-x-4">
                          <img
                            src={review.user.avatar || "/placeholder.svg"}
                            alt={review.user.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{review.user.name}</h4>
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
                    ))}
                  </div>
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
                      <div key={course._id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/courses/${course._id}`)}>
                        {course.thumbnail && course.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i) ? (
                          <video
                            src={course.thumbnail}
                            className="w-16 h-12 object-cover rounded"
                            muted
                            onError={(e) => {
                              e.target.style.display = 'none'
                              const fallback = e.target.parentElement.querySelector('.related-video-fallback') || document.createElement('div')
                              fallback.className = 'related-video-fallback w-16 h-12 flex items-center justify-center bg-gray-200 text-gray-600 font-medium text-xs rounded'
                              fallback.textContent = 'VIDEO'
                              if (!e.target.parentElement.querySelector('.related-video-fallback')) {
                                e.target.parentElement.appendChild(fallback)
                              }
                            }}
                            onLoadedData={(e) => {
                              const fallback = e.target.parentElement.querySelector('.related-video-fallback')
                              if (fallback) fallback.remove()
                            }}
                          />
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
