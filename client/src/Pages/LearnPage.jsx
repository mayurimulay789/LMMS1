"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { Play, Clock, CheckCircle, ArrowLeft, Lock } from "lucide-react"
import { motion } from "framer-motion"

const LearnPage = () => {
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const [course, setCourse] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)
  const [markingComplete, setMarkingComplete] = useState(false)

  const youtubePlayerRef = useRef(null)
  const [youtubePlayer, setYoutubePlayer] = useState(null)
  const [isYouTubeLoaded, setIsYouTubeLoaded] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchCourseDetails()
  }, [courseId, isAuthenticated])

  useEffect(() => {
    if (course && course.lessons) {
      const lessonId = searchParams.get("lesson")
      if (lessonId) {
        const lesson = course.lessons.find(l => l._id === lessonId)
        if (lesson) {
          setSelectedLesson(lesson)
        }
      } else if (course.lessons.length > 0) {
        setSelectedLesson(course.lessons[0])
      }
    }
  }, [course, searchParams])

  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCourse(data)
        setIsEnrolled(data.isEnrolled)

        if (!data.isEnrolled) {
          setError("You are not enrolled in this course")
        } else {
          // Fetch progress if enrolled
          await fetchProgress()
        }
      } else {
        setError("Course not found")
      }
    } catch (error) {
      console.error("Error fetching course:", error)
      setError("Failed to load course")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/enrollments/progress/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      }
    } catch (error) {
      console.error("Error fetching progress:", error)
    }
  }

  const markLessonComplete = async (lessonId) => {
    // Prevent duplicate calls
    if (isLessonCompleted(lessonId)) return;

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/enrollments/progress`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          timeSpent: 0, // For now, not tracking time
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      } else {
        const error = await response.json()
        console.error("Failed to mark lesson complete:", error.message || "Unknown error")
      }
    } catch (error) {
      console.error("Error marking lesson complete:", error)
    }
  }

  // YouTube API setup
  useEffect(() => {
    if (!selectedLesson || !isYouTubeUrl(selectedLesson.videoUrl)) {
      // Clean up previous player if switching away from YouTube
      if (youtubePlayer) {
        youtubePlayer.destroy()
        setYoutubePlayer(null)
      }
      return
    }

    // Load YouTube IFrame API if not loaded
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = initializeYouTubePlayer
    } else {
      initializeYouTubePlayer()
    }

    function initializeYouTubePlayer() {
      const initPlayer = () => {
        if (youtubePlayerRef.current && !youtubePlayer && window.YT && window.YT.Player) {
          const player = new window.YT.Player(youtubePlayerRef.current, {
            videoId: getYouTubeVideoId(selectedLesson.videoUrl),
            width: '100%',
            height: '100%',
            playerVars: {
              'playsinline': 1,
              'controls': 1,
              'rel': 0,
              'modestbranding': 1,
              'iv_load_policy': 3,
              'autohide': 1,
              'fs': 0,
              'disablekb': 1
            },
            events: {
              'onReady': (event) => {
                setYoutubePlayer(event.target)
                setIsYouTubeLoaded(true)
              },
              'onStateChange': (event) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  markLessonComplete(selectedLesson._id)
                }
              }
            }
          })
          setYoutubePlayer(player)
          return true
        }
        return false
      }

      if (initPlayer()) return

      // Retry if API not ready
      const maxRetries = 50 // 5 seconds
      let retries = 0
      const interval = setInterval(() => {
        retries++
        if (initPlayer() || retries >= maxRetries) {
          clearInterval(interval)
        }
      }, 100)

      // Cleanup on unmount or lesson change
      return () => clearInterval(interval)
    }

    return () => {
      if (youtubePlayer) {
        youtubePlayer.destroy()
        setYoutubePlayer(null)
        setIsYouTubeLoaded(false)
      }
      delete window.onYouTubeIframeAPIReady
    }
  }, [selectedLesson])

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.some(lesson => lesson.lessonId === lessonId)
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'))
  }

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  const renderVideoPlayer = (lesson) => {
    if (!lesson.videoUrl) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="text-center">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Video not available</p>
          </div>
        </div>
      )
    }

    if (isYouTubeUrl(lesson.videoUrl)) {
      return (
        <div className="aspect-video relative">
          <div ref={youtubePlayerRef} className="w-full h-full rounded-lg">
            {!isYouTubeLoaded && (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="aspect-video">
        <video
          src={lesson.videoUrl}
          controls
          className="w-full h-full rounded-lg"
          preload="metadata"
          onEnded={() => markLessonComplete(lesson._id)}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Course
          </button>
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Course</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
            <p className="text-sm text-gray-600">Continue your learning journey</p>
          </div>
          {progress && (
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                Progress: {progress.completionPercentage}%
              </div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {course.lessons.map((lesson, index) => (
                  <motion.div
                    key={lesson._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedLesson?._id === lesson._id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        selectedLesson?._id === lesson._id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {lesson.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatDuration(lesson.duration)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {isLessonCompleted(lesson._id) && (
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                        {selectedLesson?._id === lesson._id && !isLessonCompleted(lesson._id) && (
                          <div className="w-4 h-4 border-2 border-blue-600 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="lg:col-span-3">
            {selectedLesson ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedLesson.title}
                  </h2>
                  {selectedLesson.description && (
                    <p className="text-gray-600">{selectedLesson.description}</p>
                  )}
                </div>

                {/* Video Player */}
                <div className="mb-6">
                  {renderVideoPlayer(selectedLesson)}
                </div>

                {isLessonCompleted(selectedLesson._id) && (
                  <div className="mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-green-800 font-medium">Lesson Completed!</p>
                        <p className="text-green-600 text-sm">Great job! Continue to the next lesson.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson Resources */}
                {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                    <div className="space-y-2">
                      {selectedLesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {resource.type?.toUpperCase() || "LINK"}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{resource.title}</p>
                            <p className="text-xs text-gray-600">Click to download/view</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Lesson</h3>
                <p className="text-gray-600">Choose a lesson from the sidebar to start learning</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearnPage
