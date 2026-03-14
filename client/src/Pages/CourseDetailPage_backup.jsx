"use client"

import { useState, useEffect } from "react"
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
      }
    } catch (error) {
      console.error("Error fetching course details:", error)
      setCourse(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate("/login")
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

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    { id: "instructor", label: "Instructor" },
    { id: "reviews", label: "Reviews" },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-40 xs:h-48 sm:h-64 rounded-lg mb-6 sm:mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-300 h-5 xs:h-6 sm:h-8 rounded mb-3 w-3/4"></div>
                <div className="bg-gray-300 h-3 xs:h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 xs:h-4 rounded w-2/3"></div>
              </div>
              <div className="bg-gray-300 h-72 xs:h-80 sm:h-96 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-xs xs:text-sm sm:text-base text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-blue-600 text-white px-4 xs:px-5 sm:px-6 py-2 xs:py-2 sm:py-2.5 rounded-lg text-xs xs:text-sm sm:text-base hover:bg-blue-700 transition-colors"
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
      <div className="bg-gray-900 text-white py-6 xs:py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 xs:gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex flex-wrap items-center gap-2 mb-3 xs:mb-4">
                  <span className="bg-blue-600 text-white px-2 xs:px-3 py-0.5 xs:py-1 rounded-full text-2xs xs:text-xs sm:text-sm">
                    {course.category}
                  </span>
                  <span className="bg-gray-700 text-white px-2 xs:px-3 py-0.5 xs:py-1 rounded-full text-2xs xs:text-xs sm:text-sm">
                    {course.level}
                  </span>
                </div>

                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-2 xs:mb-3 sm:mb-4">{course.title}</h1>
                <p className="text-xs xs:text-sm sm:text-base text-gray-300 mb-3 xs:mb-4 sm:mb-6">{course.description}</p>

                <div className="flex flex-wrap items-center gap-3 xs:gap-4 sm:gap-6 mb-3 xs:mb-4 sm:mb-6 text-xs xs:text-sm sm:text-base">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                    <span className="font-medium">{course.avgRating}</span>
                    <span className="text-gray-300 hidden xs:inline">({course.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                    <span>{course.enrollmentCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
                  <img
                    src={course.createdBy?.avatar || course.instructorImage || "/placeholder.svg"}
                    alt={course.instructor || course.createdBy?.name}
                    className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-full"
                  />
                  <div>
                    <p className="text-xs xs:text-sm sm:text-base font-medium">
                      Created by {course.instructor || course.createdBy?.name}
                    </p>
                    <p className="text-2xs xs:text-xs sm:text-sm text-gray-300">
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
                <div className="relative">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-32 xs:h-36 sm:h-40 md:h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <button className="bg-white bg-opacity-90 rounded-full p-2 xs:p-2.5 sm:p-3 md:p-4 hover:bg-opacity-100 transition-all">
                      <Play className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-gray-900 ml-1" />
                    </button>
                  </div>
                </div>

                <div className="p-3 xs:p-4 sm:p-5 md:p-6">
                  <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-3 xs:mb-4">
                    {formatPrice(course.price)}
                  </div>

                  {isEnrolled ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate(`/courses/${course._id}/learn`)}
                        className="w-full bg-green-600 text-white py-2 xs:py-2.5 sm:py-3 rounded-lg font-semibold text-xs xs:text-sm sm:text-base hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Play className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                        <span>Continue Learning</span>
                      </button>
                      {userProgress && (
                        <div className="text-center">
                          <p className="text-2xs xs:text-xs sm:text-sm text-gray-600 mb-1 xs:mb-2">
                            Progress: {userProgress.completionPercentage}%
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 xs:h-2">
                            <div
                              className="bg-green-600 h-1.5 xs:h-2 rounded-full"
                              style={{ width: `${userProgress.completionPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full bg-blue-600 text-white py-2 xs:py-2.5 sm:py-3 rounded-lg font-semibold text-xs xs:text-sm sm:text-base hover:bg-blue-700 transition-colors"
                    >
                      {course.price === 0 ? "Enroll for Free" : "Buy Now"}
                    </button>
                  )}

                  <div className="mt-3 xs:mt-4 space-y-1 xs:space-y-2 text-2xs xs:text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Full lifetime access</span>
                      <CheckCircle className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Access on mobile and TV</span>
                      <CheckCircle className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Certificate of completion</span>
                      <Award className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 text-green-500" />
                    </div>
                  </div>

                  <div className="mt-3 xs:mt-4 sm:mt-6 flex items-center justify-between">
                    <button className="flex items-center space-x-1 text-2xs xs:text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                      <Heart className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />
                      <span>Wishlist</span>
                    </button>
                    <button className="flex items-center space-x-1 text-2xs xs:text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                      <Share2 className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 xs:py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 xs:gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4 xs:mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
              <nav className="flex space-x-3 xs:space-x-4 sm:space-x-6 md:space-x-8 whitespace-nowrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 xs:py-3 sm:py-4 px-0.5 xs:px-1 border-b-2 font-medium text-2xs xs:text-xs sm:text-sm ${
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
                <div className="space-y-5 xs:space-y-6 sm:space-y-8">
                  <div>
                    <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">
                      What you'll learn
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                      {course.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-start space-x-2 xs:space-x-3">
                          <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-2xs xs:text-xs sm:text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">
                      Requirements
                    </h3>
                    <ul className="space-y-1 xs:space-y-2">
                      {course.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-2 xs:space-x-3">
                          <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full mt-1.5 xs:mt-2 sm:mt-2.5 flex-shrink-0"></div>
                          <span className="text-2xs xs:text-xs sm:text-sm text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">
                      Course Details
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
                      <div className="text-center p-2 xs:p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-1 xs:mb-2" />
                        <div className="font-semibold text-xs xs:text-sm sm:text-base">{course.lessons.length}</div>
                        <div className="text-2xs xs:text-xs sm:text-sm text-gray-600">Lessons</div>
                      </div>
                      <div className="text-center p-2 xs:p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-1 xs:mb-2" />
                        <div className="font-semibold text-xs xs:text-sm sm:text-base">{formatDuration(course.duration)}</div>
                        <div className="text-2xs xs:text-xs sm:text-sm text-gray-600">Duration</div>
                      </div>
                      <div className="text-center p-2 xs:p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <Globe className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-1 xs:mb-2" />
                        <div className="font-semibold text-xs xs:text-sm sm:text-base">{course.language}</div>
                        <div className="text-2xs xs:text-xs sm:text-sm text-gray-600">Language</div>
                      </div>
                      <div className="text-center p-2 xs:p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <Award className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 mx-auto mb-1 xs:mb-2" />
                        <div className="font-semibold text-xs xs:text-sm sm:text-base">Certificate</div>
                        <div className="text-2xs xs:text-xs sm:text-sm text-gray-600">Included</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div>
                  <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-6">
                    Course Curriculum
                  </h3>
                  <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                    {course.lessons.map((lesson, index) => (
                      <div key={lesson._id} className="border border-gray-200 rounded-lg p-2 xs:p-3 sm:p-4">
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
                          <div className="flex items-start space-x-2 xs:space-x-3">
                            <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-2xs xs:text-xs sm:text-sm font-medium text-blue-600">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-2xs xs:text-xs sm:text-sm font-medium text-gray-900">{lesson.title}</h4>
                              <div className="flex flex-wrap items-center gap-1 xs:gap-2 sm:gap-4 text-2xs xs:text-xs sm:text-sm text-gray-600 mt-0.5 xs:mt-1">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />
                                  <span>{formatDuration(lesson.duration)}</span>
                                </span>
                                {lesson.preview && (
                                  <span className="bg-green-100 text-green-800 px-1 xs:px-2 py-0.5 rounded text-2xs">
                                    Preview
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {lesson.preview && (
                            <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-2xs xs:text-xs sm:text-sm ml-7 xs:ml-0">
                              <Play className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />
                              <span>Preview</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "instructor" && (
                <div>
                  <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-6">
                    About the Instructor
                  </h3>
                  {course.createdBy ? (
                    <div className="flex flex-col xs:flex-row items-start space-y-3 xs:space-y-0 xs:space-x-4 sm:space-x-6">
                      <img
                        src={course.instructorImage || course.createdBy.avatar || "/placeholder.svg"}
                        alt={course.createdBy.name || "Instructor"}
                        className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 rounded-full mx-auto xs:mx-0"
                      />
                      <div>
                        <h4 className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 xs:mb-2">
                          {course.instructor || course.createdBy.name || "Instructor"}
                        </h4>
                        <p className="text-2xs xs:text-xs sm:text-sm text-gray-600 mb-2 xs:mb-4">
                          {course.createdBy.profile?.bio || "No bio available"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 xs:gap-3 sm:gap-4 text-2xs xs:text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Users className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />
                            <span>{course.enrollmentCount.toLocaleString()} students</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />
                            <span>{course.avgRating} rating</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5 xs:py-6 sm:py-8">
                      <p className="text-xs xs:text-sm sm:text-base text-gray-600 mb-2 xs:mb-3 sm:mb-4">
                        Instructor information is currently unavailable.
                      </p>
                      <p className="text-2xs xs:text-xs sm:text-sm text-gray-500">
                        Please try refreshing the page or contact support if the issue persists.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-6">
                    Student Reviews
                  </h3>
                  <div className="space-y-3 xs:space-y-4 sm:space-y-6">
                    {course.reviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-3 xs:pb-4 sm:pb-6">
                        <div className="flex items-start space-x-2 xs:space-x-3 sm:space-x-4">
                          <img
                            src={review.user.avatar || "/placeholder.svg"}
                            alt={review.user.name}
                            className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex flex-col xs:flex-row xs:items-center xs:space-x-2 mb-1 xs:mb-2">
                              <h4 className="text-xs xs:text-sm sm:text-base font-medium text-gray-900">
                                {review.user.name}
                              </h4>
                              <div className="flex items-center space-x-1">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                                ))}
                              </div>
                              <span className="text-2xs xs:text-xs sm:text-sm text-gray-600">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-2xs xs:text-xs sm:text-sm text-gray-700">{review.comment}</p>
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
            <div className="sticky top-8 space-y-4 xs:space-y-5 sm:space-y-6">
              {/* Related Courses */}
              <div className="bg-white rounded-lg shadow-sm p-3 xs:p-4 sm:p-5 lg:p-6">
                <h4 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 mb-2 xs:mb-3 sm:mb-4">
                  Related Courses
                </h4>
                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-2 xs:space-x-3">
                      <img
                        src={`/placeholder.svg?height=60&width=80`}
                        alt="Course thumbnail"
                        className="w-14 h-10 xs:w-16 xs:h-12 sm:w-20 sm:h-15 object-cover rounded"
                      />
                      <div>
                        <h5 className="font-medium text-gray-900 text-2xs xs:text-xs sm:text-sm">Advanced JavaScript</h5>
                        <p className="text-3xs xs:text-2xs sm:text-xs text-gray-600">By Jane Smith</p>
                        <p className="text-xs xs:text-sm font-semibold text-gray-900">₹149</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage