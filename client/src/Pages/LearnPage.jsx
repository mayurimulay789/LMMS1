"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { Play, Clock, CheckCircle, ArrowLeft, Lock, Award } from "lucide-react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

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
  const [certificateId, setCertificateId] = useState(null)
  const [isYouTubeLoaded, setIsYouTubeLoaded] = useState(false)
  const [completedLessons, setCompletedLessons] = useState([])

  const youtubePlayerRef = useRef(null)



  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        setIsYouTubeLoaded(true)
      }
    } else {
      setIsYouTubeLoaded(true)
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchCourseDetails()
  }, [courseId, isAuthenticated])

  // Set selected lesson from URL or first lesson
  useEffect(() => {
    if (course?.lessons) {
      const lessonId = searchParams.get("lesson")
      if (lessonId) {
        const lesson = course.lessons.find(l => l._id === lessonId)
        if (lesson) setSelectedLesson(lesson)
      } else if (course.lessons.length > 0) {
        setSelectedLesson(course.lessons[0])
      }
    }
  }, [course, searchParams])

  // Initialize YouTube player when lesson changes
  useEffect(() => {
    if (selectedLesson && isYouTubeLoaded && youtubePlayerRef.current) {
      const videoId = getYouTubeVideoId(selectedLesson.videoUrl)
      if (videoId) {
        new window.YT.Player(youtubePlayerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                markLessonComplete(selectedLesson._id)
              }
            }
          }
        })
      }
    }
  }, [selectedLesson, isYouTubeLoaded])

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      if (response.ok) {
        const data = await response.json()
        console.log("LearnPage fetchCourseDetails response data:", data)  // Debug log
        setCourse(data)
        setIsEnrolled(data.isEnrolled)
        if (!data.isEnrolled) setError("You are not enrolled in this course")
        else await fetchProgress()
      } else setError("Course not found")
    } catch (err) {
      console.error(err)
      setError("Failed to load course")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch progress
  const fetchProgress = async () => {
    try {
      if (!courseId) {
        console.warn("fetchProgress called with undefined courseId, skipping API call")
        return
      }
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/enrollments/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Progress response data:', data);
        setProgress(data.progress)
        setCompletedLessons(data.progress?.completedLessons || [])
        // Set certificate from enrollment if available
        if (data.certificate && data.certificate.issued) {
          console.log('Setting certificateId from enrollment:', data.certificate.certificateId);
          setCertificateId(data.certificate.certificateId)
        } else {
          console.log('No issued certificate in enrollment response');
        }
        // Fetch certificate if course is completed (for additional Certificate model records if any)
        if (isCourseCompleted()) {
          await fetchCertificate()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Fetch certificate for completed course
  const fetchCertificate = async () => {
    try {
      console.log('Fetching certificate for courseId:', courseId);
      const response = await fetch(`http://localhost:2000/api/certificates/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (response.ok) {
        const certs = await response.json()
        console.log('Fetched certificates:', certs);
        const cert = certs.find(c => c.course === courseId)
        if (cert) {
          console.log('Found certificate:', cert);
          setCertificateId(cert.certificateId)
        } else {
          console.log('No certificate found for this course');
        }
      } else {
        console.log('Certificate fetch failed with status:', response.status);
      }
    } catch (error) {
      console.error("Failed to fetch certificate", error)
    }
  }

  // Mark lesson complete
  const markLessonComplete = async (lessonId) => {
    if (isLessonCompleted(lessonId)) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/enrollments/progress`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId, timeSpent: 0 }),
      })
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
        setCompletedLessons(data.progress?.completedLessons || [])
        toast.success("Lesson completed!")
        // Refresh progress to update UI immediately
        await fetchProgress()
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to mark lesson as complete")
    }
  }

  const isLessonCompleted = (lessonId) =>
    completedLessons?.some(l => l.lessonId === lessonId)

  const isCourseCompleted = () =>
    course?.lessons?.every(lesson => isLessonCompleted(lesson._id))

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const handleCertificateClick = async () => {
    console.log('Certificate button clicked', {
      isCourseCompleted: isCourseCompleted(),
      certificateId,
      courseId
    });

    if (isCourseCompleted()) {
      if (certificateId) {
        console.log('Opening PDF for certificateId:', certificateId);
        window.open(`/api/certificates/pdf/${certificateId}`, "_blank")
      } else {
        console.log('No certificateId found, attempting to generate certificate');
        toast("Generating certificate...");

        try {
          // Attempt to generate certificate manually
          const token = localStorage.getItem("token");
          const response = await fetch(`http://localhost:2000/api/certificates/generate`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ courseId })
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Certificate generated:', data);
            toast.success("Certificate generated successfully!");

            // Refresh progress to get updated certificate info
            await fetchProgress();

            // Open the certificate
            if (data.certificate?.certificateId) {
              window.open(`/api/certificates/pdf/${data.certificate.certificateId}`, "_blank");
            }
          } else {
            const errorData = await response.json();
            console.error('Certificate generation failed:', errorData);
            toast.error(errorData.message || "Failed to generate certificate. Please contact support.");
          }
        } catch (error) {
          console.error('Certificate generation error:', error);
          toast.error("Failed to generate certificate. Please contact support.");
        }
      }
    } else {
      console.log('Course not completed, showing toast');
      toast("Complete all lessons to unlock your certificate!")
    }
  }

  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const renderVideoPlayer = (lesson) => {
    if (!lesson.videoUrl) return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <Lock className="h-12 w-12 text-gray-400" />
        <p className="text-gray-600">Video not available</p>
      </div>
    )

    const videoId = getYouTubeVideoId(lesson.videoUrl)
    if (videoId && isYouTubeLoaded) {
      return (
        <div className="aspect-video">
          <div
            ref={youtubePlayerRef}
            className="w-full h-full rounded-lg"
          />
        </div>
      )
    } else if (videoId && !isYouTubeLoaded) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 ml-2">Loading YouTube player...</p>
        </div>
      )
    }

    return (
      <div className="aspect-video">
        <video
          src={lesson.videoUrl}
          controls
          className="w-full h-full rounded-lg"
          onEnded={() => markLessonComplete(lesson._id)}
        />
      </div>
    )
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-4">
          <button onClick={() => navigate(`/courses/${courseId}`)} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
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

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Certificate */}
          <button
            type="button"
            className={`flex items-center p-4 rounded-lg shadow-sm ${isCourseCompleted() ? "bg-green-50 border border-green-200" : "bg-gray-100 border border-gray-200"} cursor-pointer`}
            onClick={handleCertificateClick}
          >
            {isCourseCompleted() ? <Award className="h-6 w-6 text-green-600 mr-3" /> : <Lock className="h-6 w-6 text-gray-400 mr-3" />}
            <span className={`${isCourseCompleted() ? "text-green-800" : "text-gray-600"} font-medium`}>
              {isCourseCompleted() ? "View Certificate" : "Certificate Locked"}
            </span>
          </button>

          {/* Lessons */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {course.lessons.map((lesson, index) => (
                <motion.div
                  key={lesson._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedLesson?._id === lesson._id ? "bg-red-50 border border-red-200" : "hover:bg-gray-50"}`}
                  onClick={() => setSelectedLesson(lesson)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${selectedLesson?._id === lesson._id ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"}`}>{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{lesson.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatDuration(lesson.duration)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {isLessonCompleted(lesson._id) && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
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
            <motion.div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h2>
              {selectedLesson.description && <p className="text-gray-600 mb-4">{selectedLesson.description}</p>}
              {renderVideoPlayer(selectedLesson)}

              {isLessonCompleted(selectedLesson._id) && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-green-800 font-medium">Lesson Completed!</p>
                    <p className="text-green-600 text-sm">Great job! Continue to the next lesson.</p>
                  </div>
                </div>
              )}

              {selectedLesson.resources?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                  <div className="space-y-2">
                    {selectedLesson.resources.map((res, idx) => (
                      <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">{res.type?.toUpperCase() || "LINK"}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{res.title}</p>
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
  )
}

export default LearnPage
