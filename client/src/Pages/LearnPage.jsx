// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useParams, useNavigate, useSearchParams } from "react-router-dom"
// import { useSelector } from "react-redux"
// import { Play, Clock, CheckCircle, ArrowLeft, Lock, Award, Menu, X } from "lucide-react"
// import { motion } from "framer-motion"
// import toast from "react-hot-toast"
// import { apiRequest, createApiUrl } from "../config/api"

// const LearnPage = () => {
//   const { courseId } = useParams()
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const { user, isAuthenticated } = useSelector((state) => state.auth)

//   const [course, setCourse] = useState(null)
//   const [isEnrolled, setIsEnrolled] = useState(false)
//   const [selectedLesson, setSelectedLesson] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [progress, setProgress] = useState(null)
//   const [certificateId, setCertificateId] = useState(null)
//   const [isYouTubeLoaded, setIsYouTubeLoaded] = useState(false)
//   const [completedLessons, setCompletedLessons] = useState([])
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false)

//   const youtubePlayerRef = useRef(null)
//   const playerInstanceRef = useRef(null)

//   // Load YouTube API
//   useEffect(() => {
//     let pollInterval = null
    
//     // Check if YouTube API is fully loaded and ready
//     if (window.YT && window.YT.Player) {
//       console.log('YouTube API already loaded')
//       setIsYouTubeLoaded(true)
//       return
//     }

//     // Check if script is already being loaded
//     const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]')
//     if (existingScript) {
//       console.log('YouTube API script already exists, waiting for it to load...')
      
//       // Poll for YouTube API readiness (in case callback doesn't fire)
//       pollInterval = setInterval(() => {
//         if (window.YT && window.YT.Player) {
//           console.log('YouTube API Ready (via polling)')
//           clearInterval(pollInterval)
//           setIsYouTubeLoaded(true)
//         }
//       }, 100)
      
//       // Also set up callback
//       window.onYouTubeIframeAPIReady = () => {
//         console.log('YouTube API Ready (via callback)')
//         if (pollInterval) clearInterval(pollInterval)
//         setIsYouTubeLoaded(true)
//       }
      
//       // Timeout after 10 seconds
//       setTimeout(() => {
//         if (pollInterval) {
//           clearInterval(pollInterval)
//           if (window.YT && window.YT.Player) {
//             setIsYouTubeLoaded(true)
//           } else {
//             console.error('YouTube API failed to load within timeout')
//           }
//         }
//       }, 10000)
      
//       return () => {
//         if (pollInterval) clearInterval(pollInterval)
//       }
//     }

//     // Load the YouTube API script
//     console.log('Loading YouTube API script...')
//     const tag = document.createElement('script')
//     tag.src = 'https://www.youtube.com/iframe_api'
//     tag.async = true
//     tag.onerror = () => {
//       console.error('Failed to load YouTube API script')
//       if (pollInterval) clearInterval(pollInterval)
//     }
    
//     const firstScriptTag = document.getElementsByTagName('script')[0]
//     firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

//     // Poll for YouTube API readiness (backup for callback)
//     pollInterval = setInterval(() => {
//       if (window.YT && window.YT.Player) {
//         console.log('YouTube API Ready (via polling)')
//         clearInterval(pollInterval)
//         setIsYouTubeLoaded(true)
//       }
//     }, 100)

//     window.onYouTubeIframeAPIReady = () => {
//       console.log('YouTube API Ready (via callback)')
//       if (pollInterval) clearInterval(pollInterval)
//       setIsYouTubeLoaded(true)
//     }
    
//     // Timeout after 10 seconds
//     setTimeout(() => {
//       if (pollInterval) {
//         clearInterval(pollInterval)
//         if (window.YT && window.YT.Player) {
//           setIsYouTubeLoaded(true)
//         } else {
//           console.error('YouTube API failed to load within timeout')
//         }
//       }
//     }, 10000)
    
//     return () => {
//       if (pollInterval) clearInterval(pollInterval)
//     }
//   }, [])

//   // Redirect if not authenticated
//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate("/login")
//       return
//     }
//     fetchCourseDetails()
//   }, [courseId, isAuthenticated, navigate])

//   // Set selected lesson from URL or first lesson
//   useEffect(() => {
//     if (course?.lessons) {
//       const lessonId = searchParams.get("lesson")
//       if (lessonId) {
//         const lesson = course.lessons.find(l => l._id === lessonId)
//         if (lesson) setSelectedLesson(lesson)
//       } else if (course.lessons.length > 0) {
//         setSelectedLesson(course.lessons[0])
//       }
//     }
//   }, [course, searchParams])

//   useEffect(() => {
   
//     if (playerInstanceRef.current) {
//       try {
//         playerInstanceRef.current.destroy()
//         playerInstanceRef.current = null
//       } catch (e) {
//         console.error("Error destroying player:", e)
//       }
//     }

//     if (selectedLesson && isYouTubeLoaded && youtubePlayerRef.current) {
//       const videoId = getYouTubeVideoId(selectedLesson.videoUrl)
//       if (videoId && window.YT && window.YT.Player) {
//         console.log('Initializing YouTube player for video:', videoId)
        
//         // Clear the div and recreate it
//         const container = youtubePlayerRef.current.parentNode
//         const newDiv = document.createElement('div')
//         newDiv.id = `youtube-player-${selectedLesson._id}`
//         container.replaceChild(newDiv, youtubePlayerRef.current)
//         youtubePlayerRef.current = newDiv

//         // Ensure DOM and YouTube API are fully ready before creating player
//         const initializePlayer = () => {
//           // Double check API is ready
//           if (!window.YT || !window.YT.Player) {
//             console.error('YouTube API not available when trying to create player')
//             return
//           }

//           // Check if the element still exists in DOM
//           if (!document.getElementById(newDiv.id)) {
//             console.error('Player element not in DOM')
//             return
//           }

//           try {
//             // Create new player instance
//             playerInstanceRef.current = new window.YT.Player(newDiv.id, {
//               width: '100%', 
//               height: '100%',
//               videoId: videoId,
//               playerVars: {
//                 autoplay: 1,
//                 controls: 1,
//                 rel: 0,
//                 showinfo: 0,
//                 modestbranding: 1,
//                 origin: window.location.origin,
//                 enablejsapi: 1
//               },
//               events: {
//                 onReady: (event) => {
//                   console.log('✅ YouTube player ready and loaded')
//                   // Ensure video plays on mobile/touch devices
//                   try {
//                     event.target.playVideo()
//                   } catch (e) {
//                     console.log('Autoplay prevented:', e)
//                   }
//                 },
//                 onError: (event) => {
//                   console.error('❌ YouTube player error:', event.data)
//                   // Error codes: 2=Invalid ID, 5=HTML5 error, 100=Video not found, 101/150=Embedding disabled
//                 },
//                 onStateChange: (event) => {
//                   console.log('YouTube player state changed:', event.data)
//                   if (event.data === window.YT.PlayerState.ENDED) {
//                     handleVideoEnd(selectedLesson._id)
//                   }
//                 }
//               }
//             })
//             console.log('YouTube player instance created')
//           } catch (error) {
//             console.error('Error creating YouTube player:', error)
//           }
//         }

//         // Use requestAnimationFrame + setTimeout for better reliability across browsers
//         requestAnimationFrame(() => {
//           setTimeout(initializePlayer, 150)
//         })
//       } else if (videoId) {
//         console.warn('YouTube API or Player not ready yet:', {
//           hasYT: !!window.YT,
//           hasPlayer: !!(window.YT && window.YT.Player),
//           isYouTubeLoaded
//         })
//       }
//     }

//     // Cleanup on unmount
//     return () => {
//       if (playerInstanceRef.current) {
//         try {
//           playerInstanceRef.current.destroy()
//         } catch (e) {
//           console.error("Error destroying player on cleanup:", e)
//         }
//       }
//     }
//   }, [selectedLesson, isYouTubeLoaded])

//   // Fetch course details
//   const fetchCourseDetails = async () => {
//     try {
//       setIsLoading(true)
//       setError(null)
      
//       const token = localStorage.getItem("token")
//       if (!token) {
//         navigate("/login")
//         return
//       }

//       const response = await apiRequest(`courses/${courseId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       if (response && response.ok) {
//         const data = response.data
//         console.log("LearnPage fetchCourseDetails response data:", data)
//         setCourse(data)
//         setIsEnrolled(data.isEnrolled || false)
        
//         if (!data.isEnrolled) {
//           setError("You are not enrolled in this course")
//         } else {
//           await fetchProgress()
//         }
//       } else {
//         setError("Course not found or access denied")
//       }
//     } catch (err) {
//       console.error("Error fetching course details:", err)
//       setError("Failed to load course")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Fetch progress
//   const fetchProgress = async () => {
//     try {
//       if (!courseId) {
//         console.warn("fetchProgress called with undefined courseId, skipping API call")
//         return
//       }
      
//       const token = localStorage.getItem("token")
//       const response = await apiRequest(`enrollments/progress/${courseId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
      
//       if (response && response.ok) {
//         const data = response.data
//         console.log('Progress response data:', data)
//         setProgress(data.progress)
//         setCompletedLessons(data.progress?.completedLessons || [])
        
//         if (data.certificate && data.certificate.issued) {
//           console.log('Setting certificateId from enrollment:', data.certificate.certificateId)
//           setCertificateId(data.certificate.certificateId)
//         } else {
//           console.log('No issued certificate in enrollment response')
//         }
        
//         if (isCourseCompleted()) {
//           await fetchCertificate()
//         }
//       }
//     } catch (err) {
//       console.error("Error fetching progress:", err)
//     }
//   }

//   // Fetch certificate for completed course
//   const fetchCertificate = async () => {
//     try {
//       console.log('Fetching certificate for courseId:', courseId)
//       const response = await apiRequest("certificates/me", {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       })
      
//       if (response && response.ok) {
//         const certs = response.data
//         console.log('Fetched certificates:', certs)
//         const cert = certs.find(c => c.course === courseId || c.course?._id === courseId)
//         if (cert) {
//           console.log('Found certificate:', cert)
//           setCertificateId(cert.certificateId || cert._id)
//         } else {
//           console.log('No certificate found for this course')
//         }
//       } else {
//         console.log('Certificate fetch failed with status:', response?.status)
//       }
//     } catch (error) {
//       console.error("Failed to fetch certificate", error)
//     }
//   }

//   // Mark lesson complete
//   const markLessonComplete = async (lessonId) => {
//     if (isLessonCompleted(lessonId)) return
    
//     try {
//       const token = localStorage.getItem("token")
//       const response = await apiRequest("enrollments/progress", {
//         method: "POST",
//         headers: { 
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ courseId, lessonId, timeSpent: 0 }),
//       })
      
//       if (response && response.ok) {
//         const data = response.data
//         setProgress(data.progress)
//         setCompletedLessons(data.progress?.completedLessons || [])
//         toast.success("Lesson completed!")
//         await fetchProgress()
//       }
//     } catch (err) {
//       console.error("Error marking lesson complete:", err)
//       toast.error("Failed to mark lesson as complete")
//     }
//   }

//   // Handle video end - mark complete and play next
//   const handleVideoEnd = async (lessonId) => {
//     // Mark current lesson as complete
//     await markLessonComplete(lessonId)
    
//     // Find next lesson
//     const currentIndex = course.lessons.findIndex(l => l._id === lessonId)
//     if (currentIndex !== -1 && currentIndex < course.lessons.length - 1) {
//       const nextLesson = course.lessons[currentIndex + 1]
//       toast.success(`Playing next lesson: ${nextLesson.title}`)
//       setSelectedLesson(nextLesson)
//     } else {
//       toast.success("Course completed! 🎉")
//     }
//   }

//   const isLessonCompleted = (lessonId) =>
//     completedLessons?.some(l => l.lessonId === lessonId)

//   const isCourseCompleted = () =>
//     course?.lessons?.every(lesson => isLessonCompleted(lesson._id))

//   const formatDuration = (minutes) => {
//     if (!minutes) return "0m"
//     const hours = Math.floor(minutes / 60)
//     const mins = minutes % 60
//     return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
//   }

//   const handleCertificateClick = async () => {
//     console.log('Certificate button clicked', {
//       isCourseCompleted: isCourseCompleted(),
//       certificateId,
//       courseId
//     })

//     if (isCourseCompleted()) {
//       if (certificateId) {
//         console.log('Downloading PDF for certificateId:', certificateId)
//         try {
//           const token = localStorage.getItem("token")
//           const downloadUrl = createApiUrl(`certificates/download/${certificateId}`)
//           console.log('Certificate download URL:', downloadUrl)
//           const response = await fetch(downloadUrl, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           })
          
//           if (!response.ok) {
//             throw new Error("Failed to download certificate")
//           }
          
//           const blob = await response.blob()
//           const url = window.URL.createObjectURL(blob)
//           const link = document.createElement("a")
//           link.href = url
//           link.download = `certificate-${certificateId}.pdf`
//           document.body.appendChild(link)
//           link.click()
//           window.URL.revokeObjectURL(url)
//           document.body.removeChild(link)
//           toast.success("Certificate downloaded successfully!")
//         } catch (error) {
//           console.error("Download error:", error)
//           toast.error("Failed to download certificate")
//         }
//       } else {
//         console.log('No certificateId found, attempting to generate certificate')
//         toast.loading("Generating certificate...")

//         try {
//           const token = localStorage.getItem("token")
//           const response = await apiRequest("certificates/generate", {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ courseId })
//           })

//           if (response && response.ok) {
//             const data = response.data
//             console.log('Certificate generated:', data)
//             toast.dismiss()
//             toast.success("Certificate generated successfully!")
//             await fetchProgress()
//             if (data.certificate?.certificateId) {
//               // Download the newly generated certificate
//               try {
//                 const token = localStorage.getItem("token")
//                 const downloadUrl = createApiUrl(`certificates/download/${data.certificate.certificateId}`)
//                 console.log('Certificate download URL:', downloadUrl)
//                 const downloadResponse = await fetch(downloadUrl, {
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                   },
//                 })
                
//                 if (!downloadResponse.ok) {
//                   throw new Error("Failed to download certificate")
//                 }
                
//                 const blob = await downloadResponse.blob()
//                 const url = window.URL.createObjectURL(blob)
//                 const link = document.createElement("a")
//                 link.href = url
//                 link.download = `certificate-${data.certificate.certificateId}.pdf`
//                 document.body.appendChild(link)
//                 link.click()
//                 window.URL.revokeObjectURL(url)
//                 document.body.removeChild(link)
//                 toast.success("Certificate downloaded successfully!")
//               } catch (downloadError) {
//                 console.error("Download error:", downloadError)
//                 toast.error("Certificate generated but download failed")
//               }
//             }
//           } else {
//             toast.dismiss()
//             const errorMessage = response?.data?.message || "Failed to generate certificate. Please contact support."
//             console.error('Certificate generation failed:', errorMessage)
//             toast.error(errorMessage)
//           }
//         } catch (error) {
//           toast.dismiss()
//           console.error('Certificate generation error:', error)
//           toast.error("Failed to generate certificate. Please contact support.")
//         }
//       }
//     } else {
//       console.log('Course not completed, showing toast')
//       toast("Complete all lessons to unlock your certificate!")
//     }
//   }

//   const getYouTubeVideoId = (url) => {
//     if (!url) return null
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
//     const match = url.match(regExp)
//     return (match && match[2].length === 11) ? match[2] : null
//   }

//   const renderVideoPlayer = (lesson) => {
//     if (!lesson?.videoUrl) return (
//       <div className="flex flex-col items-center justify-center h-48 p-4 bg-gray-100 rounded-lg sm:h-64">
//         <Lock className="w-8 h-8 mb-2 text-gray-400 sm:h-12 sm:w-12" />
//         <p className="text-sm text-center text-gray-600 sm:text-base">Video not available</p>
//       </div>
//     )

//     const videoId = getYouTubeVideoId(lesson.videoUrl)
//     if (videoId && isYouTubeLoaded) {
//       return (
//         <div className="relative w-full overflow-hidden rounded-lg" style={{ height: '500px' }}>
//           <div
//             ref={youtubePlayerRef}
//             className="absolute top-0 left-0 w-full h-full"
//           />
//         </div>
//       )
//     } else if (videoId && !isYouTubeLoaded) {
//       return (
//         <div className="flex flex-col items-center justify-center h-48 p-4 bg-gray-100 rounded-lg sm:h-64">
//           <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin sm:h-8 sm:w-8"></div>
//           <p className="mt-2 text-sm text-gray-600 sm:text-base">Loading YouTube player...</p>
//         </div>
//       )
//     }

//     return (
//       <div className="relative w-full overflow-hidden rounded-lg" style={{ height: '700px' }}>
//         <video
//           src={lesson.videoUrl}
//           controls
//           className="absolute top-0 left-0 w-full h-full object-cover"
//           onEnded={() => handleVideoEnd(lesson._id)}
//         />
//       </div>
//     )
//   }

//   if (isLoading) return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin sm:h-12 sm:w-12"></div>
//     </div>
//   )
  
//   if (error || !course) return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="max-w-md text-center">
//         <p className="mb-4 text-lg text-red-600 sm:text-xl">{error || "Course not found"}</p>
//         <button 
//           onClick={() => navigate(-1)}
//           className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
//         >
//           Go Back
//         </button>
//       </div>
//     </div>
//   )

//   if (!isEnrolled) return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="max-w-md text-center">
//         <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400 sm:h-16 sm:w-16" />
//         <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">Course Locked</h2>
//         <p className="mb-6 text-gray-600">You need to enroll in this course to access the content.</p>
//         <div className="space-y-3">
//           <button 
//             onClick={() => navigate(`/courses/${courseId}`)}
//             className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             View Course Details
//           </button>
//           <button 
//             onClick={() => navigate("/courses")}
//             className="w-full px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
//           >
//             Browse Courses
//           </button>
//         </div>
//       </div>
//     </div>
//   )

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="px-3 py-3 bg-white border-b border-gray-200 sm:px-4 sm:py-4 text-center">
//         <div className="flex flex-col items-start mx-auto space-y-3 max-w-7xl sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
//           <div className="flex items-center justify-between w-full sm:w-auto">
//             <button 
//               onClick={() => navigate(`/courses/${courseId}`)} 
//               className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-gray-900 mt-3"
//             >
//               <ArrowLeft className="w-4 h-4 sm:h-5 sm:w-5" />
//               <span className="text-sm sm:text-base text-center text-primary-800 ">Back to Course</span>
//             </button>
            
//             <button
//               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//               className="p-2 transition-colors bg-gray-100 rounded-lg sm:hidden hover:bg-gray-200"
//             >
//               {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </button>
//           </div>
          
//           <div className="flex-1 min-w-0">
//             <h1 className="text-lg font-semibold text-gray-900 truncate sm:text-xl">{course?.title}</h1>
//             <p className="text-xs text-gray-600 sm:text-sm">Continue your learning journey</p>
//           </div>
          
//           {progress && (
//             <div className="w-full text-right sm:w-auto">
//               <div className="mb-1 text-xs text-gray-600 sm:text-sm">
//                 Progress: {Math.round(progress.completionPercentage || 0)}%
//               </div>
//               <div className="w-full h-2 bg-gray-200 rounded-full sm:w-24">
//                 <div
//                   className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
//                   style={{ width: `${Math.round(progress.completionPercentage || 0)}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4 px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 lg:grid-cols-4 sm:gap-6">
//         {/* Sidebar - Mobile Overlay */}
//         {isSidebarOpen && (
//           <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
//             <div className="absolute top-0 left-0 w-4/5 h-full max-w-sm p-4 overflow-y-auto bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold">Course Content</h2>
//                 <button onClick={() => setIsSidebarOpen(false)} className="p-1">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
              
//               <button
//                 type="button"
//                 className={`flex items-center p-3 rounded-lg shadow-sm w-full mb-4 ${isCourseCompleted() ? "bg-green-50 border border-green-200" : "bg-gray-100 border border-gray-200"} cursor-pointer transition-colors`}
//                 onClick={() => {
//                   handleCertificateClick()
//                   setIsSidebarOpen(false)
//                 }}
//               >
//                 {isCourseCompleted() ? <Award className="w-5 h-5 mr-2 text-green-600" /> : <Lock className="w-5 h-5 mr-2 text-gray-400" />}
//                 <span className={`${isCourseCompleted() ? "text-green-800" : "text-gray-600"} font-medium text-sm`}>
//                   {isCourseCompleted() ? "Download Certificate" : "Certificate Locked"}
//                 </span>
//               </button>

//               <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
//                 {course?.lessons?.map((lesson, index) => (
//                   <motion.div
//                     key={lesson._id}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                     className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedLesson?._id === lesson._id ? "bg-red-50 border border-red-200" : "hover:bg-gray-50"}`}
//                     onClick={() => {
//                       setSelectedLesson(lesson)
//                       setIsSidebarOpen(false)
//                     }}
//                   >
//                     <div className="flex items-start space-x-3">
//                       <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${selectedLesson?._id === lesson._id ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"}`}>
//                         {index + 1}
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{lesson.title}</h4>
//                         <div className="flex items-center mt-1 space-x-2">
//                           <Clock className="w-3 h-3 text-gray-400" />
//                           <span className="text-xs text-gray-500">{formatDuration(lesson.duration)}</span>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         {isLessonCompleted(lesson._id) && <CheckCircle className="flex-shrink-0 w-3 h-3 text-green-600 sm:h-4 sm:w-4" />}
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Sidebar - Desktop */}
//         <div className="hidden space-y-4 lg:block lg:col-span-1">
//           <button
//             type="button"
//             className={`flex items-center p-4 rounded-lg shadow-sm w-full ${isCourseCompleted() ? "bg-green-50 border border-green-200" : "bg-gray-100 border border-gray-200"} cursor-pointer transition-colors`}
//             onClick={handleCertificateClick}
//           >
//             {isCourseCompleted() ? <Award className="w-6 h-6 mr-3 text-green-600" /> : <Lock className="w-6 h-6 mr-3 text-gray-400" />}
//             <span className={`${isCourseCompleted() ? "text-green-800" : "text-gray-600"} font-medium`}>
//               {isCourseCompleted() ? "Download Certificate" : "Certificate Locked"}
//             </span>
//           </button>

//           <div className="p-4 bg-white rounded-lg shadow-sm">
//             <h3 className="mb-4 text-lg font-semibold text-gray-900">Course Content</h3>
//             <div className="space-y-2 overflow-y-auto max-h-96">
//               {course.lessons?.map((lesson, index) => (
//                 <motion.div
//                   key={lesson._id}
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.05 }}
//                   className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedLesson?._id === lesson._id ? "bg-red-50 border border-red-200" : "hover:bg-gray-50"}`}
//                   onClick={() => setSelectedLesson(lesson)}
//                 >
//                   <div className="flex items-start space-x-3">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${selectedLesson?._id === lesson._id ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"}`}>{index + 1}</div>
//                     <div className="flex-1 min-w-0">
//                       <h4 className="text-sm font-medium text-gray-900 truncate">{lesson.title}</h4>
//                       <div className="flex items-center mt-1 space-x-2">
//                         <Clock className="w-3 h-3 text-gray-400" />
//                         <span className="text-xs text-gray-500">{formatDuration(lesson.duration)}</span>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       {isLessonCompleted(lesson._id) && <CheckCircle className="flex-shrink-0 w-4 h-4 text-green-600" />}
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Video Player */}
//         <div className="lg:col-span-3">
//           {selectedLesson ? (
//             <motion.div 
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="p-4 bg-white rounded-lg shadow-sm sm:p-6"
//             >
//               <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">{selectedLesson.title}</h2>
//               {selectedLesson.description && <p className="mb-4 text-sm text-gray-600 sm:text-base">{selectedLesson.description}</p>}
//               {renderVideoPlayer(selectedLesson)}

//               {isLessonCompleted(selectedLesson._id) && (
//                 <div className="flex items-center p-3 mt-4 space-x-3 border border-green-200 rounded-lg bg-green-50 sm:p-4">
//                   <CheckCircle className="w-5 h-5 text-green-600 sm:h-6 sm:w-6" />
//                   <div>
//                     <p className="text-sm font-medium text-green-800 sm:text-base">Lesson Completed!</p>
//                     <p className="text-xs text-green-600 sm:text-sm">Great job! Continue to the next lesson.</p>
//                   </div>
//                 </div>
//               )}

//               {selectedLesson.resources?.length > 0 && (
//                 <div className="mt-4 sm:mt-6">
//                   <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg sm:mb-4">Resources</h3>
//                   <div className="space-y-2">
//                     {selectedLesson.resources.map((res, idx) => (
//                       <a 
//                         key={idx} 
//                         href={res.url} 
//                         target="_blank" 
//                         rel="noopener noreferrer" 
//                         className="flex items-center p-3 space-x-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
//                       >
//                         <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-blue-600 bg-blue-100 rounded-full sm:w-8 sm:h-8">
//                           {res.type?.toUpperCase()?.charAt(0) || "L"}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium text-gray-900 truncate">{res.title}</p>
//                           <p className="text-xs text-gray-600">Click to download/view</p>
//                         </div>
//                       </a>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </motion.div>
//           ) : (
//             <div className="p-6 text-center bg-white rounded-lg shadow-sm sm:p-12">
//               <Play className="w-12 h-12 mx-auto mb-3 text-gray-300 sm:h-16 sm:w-16 sm:mb-4" />
//               <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">Select a Lesson</h3>
//               <p className="text-sm text-gray-600 sm:text-base">Choose a lesson from the sidebar to start learning</p>
//               <button
//                 onClick={() => setIsSidebarOpen(true)}
//                 className="px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg sm:hidden hover:bg-blue-700"
//               >
//                 Open Lessons
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default LearnPage


"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { Play, Clock, CheckCircle, ArrowLeft, Lock, Award, Menu, X, ChevronDown, ChevronUp } from "lucide-react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { apiRequest, createApiUrl } from "../config/api"

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedModules, setExpandedModules] = useState({}) // Track expanded/collapsed modules

  const youtubePlayerRef = useRef(null)
  const playerInstanceRef = useRef(null)

  // Load YouTube API
  useEffect(() => {
    let pollInterval = null
    
    // Check if YouTube API is fully loaded and ready
    if (window.YT && window.YT.Player) {
      console.log('YouTube API already loaded')
      setIsYouTubeLoaded(true)
      return
    }

    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]')
    if (existingScript) {
      console.log('YouTube API script already exists, waiting for it to load...')
      
      pollInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          console.log('YouTube API Ready (via polling)')
          clearInterval(pollInterval)
          setIsYouTubeLoaded(true)
        }
      }, 100)
      
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready (via callback)')
        if (pollInterval) clearInterval(pollInterval)
        setIsYouTubeLoaded(true)
      }
      
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval)
          if (window.YT && window.YT.Player) {
            setIsYouTubeLoaded(true)
          } else {
            console.error('YouTube API failed to load within timeout')
          }
        }
      }, 10000)
      
      return () => {
        if (pollInterval) clearInterval(pollInterval)
      }
    }

    console.log('Loading YouTube API script...')
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    tag.onerror = () => {
      console.error('Failed to load YouTube API script')
      if (pollInterval) clearInterval(pollInterval)
    }
    
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    pollInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        console.log('YouTube API Ready (via polling)')
        clearInterval(pollInterval)
        setIsYouTubeLoaded(true)
      }
    }, 100)

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API Ready (via callback)')
      if (pollInterval) clearInterval(pollInterval)
      setIsYouTubeLoaded(true)
    }
    
    setTimeout(() => {
      if (pollInterval) {
        clearInterval(pollInterval)
        if (window.YT && window.YT.Player) {
          setIsYouTubeLoaded(true)
        } else {
          console.error('YouTube API failed to load within timeout')
        }
      }
    }, 10000)
    
    return () => {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }
    fetchCourseDetails()
  }, [courseId, isAuthenticated, navigate])

  // Set selected lesson from URL or first lesson
  useEffect(() => {
    if (course?.modules) {
      const lessonId = searchParams.get("lesson")
      
      if (lessonId) {
        // Find lesson in modules
        let foundLesson = null
        for (const module of course.modules) {
          const lesson = module.subcourses.find(l => l._id === lessonId)
          if (lesson) {
            foundLesson = lesson
            break
          }
        }
        if (foundLesson) setSelectedLesson(foundLesson)
      } else if (course.modules.length > 0 && course.modules[0].subcourses.length > 0) {
        // Select first lesson from first module
        setSelectedLesson(course.modules[0].subcourses[0])
        // Expand first module by default
        setExpandedModules({ [course.modules[0]._id]: true })
      }
    }
  }, [course, searchParams])

  // Initialize expanded modules state
  useEffect(() => {
    if (course?.modules) {
      const initialExpandedState = {}
      course.modules.forEach((module, index) => {
        // Expand first module by default
        if (index === 0) {
          initialExpandedState[module._id] = true
        } else {
          initialExpandedState[module._id] = false
        }
      })
      setExpandedModules(initialExpandedState)
    }
  }, [course])

  useEffect(() => {
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy()
        playerInstanceRef.current = null
      } catch (e) {
        console.error("Error destroying player:", e)
      }
    }

    if (selectedLesson && isYouTubeLoaded && youtubePlayerRef.current) {
      const videoId = getYouTubeVideoId(selectedLesson.videoUrl)
      if (videoId && window.YT && window.YT.Player) {
        console.log('Initializing YouTube player for video:', videoId)
        
        const container = youtubePlayerRef.current.parentNode
        const newDiv = document.createElement('div')
        newDiv.id = `youtube-player-${selectedLesson._id}`
        container.replaceChild(newDiv, youtubePlayerRef.current)
        youtubePlayerRef.current = newDiv

        const initializePlayer = () => {
          if (!window.YT || !window.YT.Player) {
            console.error('YouTube API not available when trying to create player')
            return
          }

          if (!document.getElementById(newDiv.id)) {
            console.error('Player element not in DOM')
            return
          }

          try {
            playerInstanceRef.current = new window.YT.Player(newDiv.id, {
              width: '100%', 
              height: '100%',
              videoId: videoId,
              playerVars: {
                autoplay: 1,
                controls: 1,
                rel: 0,
                showinfo: 0,
                modestbranding: 1,
                origin: window.location.origin,
                enablejsapi: 1
              },
              events: {
                onReady: (event) => {
                  console.log('✅ YouTube player ready and loaded')
                  try {
                    event.target.playVideo()
                  } catch (e) {
                    console.log('Autoplay prevented:', e)
                  }
                },
                onError: (event) => {
                  console.error('❌ YouTube player error:', event.data)
                },
                onStateChange: (event) => {
                  console.log('YouTube player state changed:', event.data)
                  if (event.data === window.YT.PlayerState.ENDED) {
                    handleVideoEnd(selectedLesson._id)
                  }
                }
              }
            })
            console.log('YouTube player instance created')
          } catch (error) {
            console.error('Error creating YouTube player:', error)
          }
        }

        requestAnimationFrame(() => {
          setTimeout(initializePlayer, 150)
        })
      } else if (videoId) {
        console.warn('YouTube API or Player not ready yet:', {
          hasYT: !!window.YT,
          hasPlayer: !!(window.YT && window.YT.Player),
          isYouTubeLoaded
        })
      }
    }

    return () => {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy()
        } catch (e) {
          console.error("Error destroying player on cleanup:", e)
        }
      }
    }
  }, [selectedLesson, isYouTubeLoaded])

  // Fetch course details
  const fetchCourseDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await apiRequest(`courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response && response.ok) {
        const data = response.data
        console.log("LearnPage fetchCourseDetails response data:", data)
        setCourse(data)
        setIsEnrolled(data.isEnrolled || false)
        
        if (!data.isEnrolled) {
          setError("You are not enrolled in this course")
        } else {
          await fetchProgress()
        }
      } else {
        setError("Course not found or access denied")
      }
    } catch (err) {
      console.error("Error fetching course details:", err)
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
      const response = await apiRequest(`enrollments/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response && response.ok) {
        const data = response.data
        console.log('Progress response data:', data)
        setProgress(data.progress)
        setCompletedLessons(data.progress?.completedLessons || [])
        
        if (data.certificate && data.certificate.issued) {
          console.log('Setting certificateId from enrollment:', data.certificate.certificateId)
          setCertificateId(data.certificate.certificateId)
        } else {
          console.log('No issued certificate in enrollment response')
        }
        
        if (isCourseCompleted()) {
          await fetchCertificate()
        }
      }
    } catch (err) {
      console.error("Error fetching progress:", err)
    }
  }

  // Fetch certificate for completed course
  const fetchCertificate = async () => {
    try {
      console.log('Fetching certificate for courseId:', courseId)
      const response = await apiRequest("certificates/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      
      if (response && response.ok) {
        const certs = response.data
        console.log('Fetched certificates:', certs)
        const cert = certs.find(c => c.course === courseId || c.course?._id === courseId)
        if (cert) {
          console.log('Found certificate:', cert)
          setCertificateId(cert.certificateId || cert._id)
        } else {
          console.log('No certificate found for this course')
        }
      } else {
        console.log('Certificate fetch failed with status:', response?.status)
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
      const response = await apiRequest("enrollments/progress", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ courseId, lessonId, timeSpent: 0 }),
      })
      
      if (response && response.ok) {
        const data = response.data
        setProgress(data.progress)
        setCompletedLessons(data.progress?.completedLessons || [])
        toast.success("Lesson completed!")
        await fetchProgress()
      }
    } catch (err) {
      console.error("Error marking lesson complete:", err)
      toast.error("Failed to mark lesson as complete")
    }
  }

  // Handle video end - mark complete and play next
  const handleVideoEnd = async (lessonId) => {
    // Mark current lesson as complete
    await markLessonComplete(lessonId)
    
    // Find next lesson across modules
    let nextLesson = null
    let foundCurrent = false
    
    if (course?.modules) {
      for (const module of course.modules) {
        for (let i = 0; i < module.subcourses.length; i++) {
          const lesson = module.subcourses[i]
          
          if (foundCurrent && i < module.subcourses.length) {
            nextLesson = module.subcourses[i]
            break
          }
          
          if (lesson._id === lessonId) {
            foundCurrent = true
            // Check if there's a next lesson in this module
            if (i < module.subcourses.length - 1) {
              nextLesson = module.subcourses[i + 1]
              break
            }
          }
        }
        if (nextLesson) break
      }
    }
    
    if (nextLesson) {
      toast.success(`Playing next lesson: ${nextLesson.title}`)
      setSelectedLesson(nextLesson)
      // Expand the module containing the next lesson
      if (course?.modules) {
        for (const module of course.modules) {
          if (module.subcourses.some(l => l._id === nextLesson._id)) {
            setExpandedModules(prev => ({ ...prev, [module._id]: true }))
            break
          }
        }
      }
    } else {
      toast.success("Course completed! 🎉")
    }
  }

  const isLessonCompleted = (lessonId) =>
    completedLessons?.some(l => l.lessonId === lessonId)

  const isCourseCompleted = () => {
    if (!course?.modules) return false
    
    let totalLessons = 0
    let completedCount = 0
    
    course.modules.forEach(module => {
      module.subcourses.forEach(lesson => {
        totalLessons++
        if (isLessonCompleted(lesson._id)) {
          completedCount++
        }
      })
    })
    
    return totalLessons > 0 && completedCount === totalLessons
  }

  const formatDuration = (minutes) => {
    if (!minutes) return "0m"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const handleCertificateClick = async () => {
    console.log('Certificate button clicked', {
      isCourseCompleted: isCourseCompleted(),
      certificateId,
      courseId
    })

    if (isCourseCompleted()) {
      if (certificateId) {
        console.log('Downloading PDF for certificateId:', certificateId)
        try {
          const token = localStorage.getItem("token")
          const downloadUrl = createApiUrl(`certificates/download/${certificateId}`)
          console.log('Certificate download URL:', downloadUrl)
          const response = await fetch(downloadUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          
          if (!response.ok) {
            throw new Error("Failed to download certificate")
          }
          
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `certificate-${certificateId}.pdf`
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(link)
          toast.success("Certificate downloaded successfully!")
        } catch (error) {
          console.error("Download error:", error)
          toast.error("Failed to download certificate")
        }
      } else {
        console.log('No certificateId found, attempting to generate certificate')
        toast.loading("Generating certificate...")

        try {
          const token = localStorage.getItem("token")
          const response = await apiRequest("certificates/generate", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ courseId })
          })

          if (response && response.ok) {
            const data = response.data
            console.log('Certificate generated:', data)
            toast.dismiss()
            toast.success("Certificate generated successfully!")
            await fetchProgress()
            if (data.certificate?.certificateId) {
              try {
                const token = localStorage.getItem("token")
                const downloadUrl = createApiUrl(`certificates/download/${data.certificate.certificateId}`)
                console.log('Certificate download URL:', downloadUrl)
                const downloadResponse = await fetch(downloadUrl, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                
                if (!downloadResponse.ok) {
                  throw new Error("Failed to download certificate")
                }
                
                const blob = await downloadResponse.blob()
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.download = `certificate-${data.certificate.certificateId}.pdf`
                document.body.appendChild(link)
                link.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(link)
                toast.success("Certificate downloaded successfully!")
              } catch (downloadError) {
                console.error("Download error:", downloadError)
                toast.error("Certificate generated but download failed")
              }
            }
          } else {
            toast.dismiss()
            const errorMessage = response?.data?.message || "Failed to generate certificate. Please contact support."
            console.error('Certificate generation failed:', errorMessage)
            toast.error(errorMessage)
          }
        } catch (error) {
          toast.dismiss()
          console.error('Certificate generation error:', error)
          toast.error("Failed to generate certificate. Please contact support.")
        }
      }
    } else {
      console.log('Course not completed, showing toast')
      toast("Complete all lessons to unlock your certificate!")
    }
  }

  const getYouTubeVideoId = (url) => {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }

  // Get all lessons count
  const getAllLessonsCount = () => {
    if (!course?.modules) return 0
    return course.modules.reduce((total, module) => total + module.subcourses.length, 0)
  }

  // Get completed lessons count
  const getCompletedLessonsCount = () => {
    if (!course?.modules) return 0
    let count = 0
    course.modules.forEach(module => {
      module.subcourses.forEach(lesson => {
        if (isLessonCompleted(lesson._id)) count++
      })
    })
    return count
  }

  // Get lesson by ID
  const getLessonById = (lessonId) => {
    if (!course?.modules) return null
    for (const module of course.modules) {
      const lesson = module.subcourses.find(l => l._id === lessonId)
      if (lesson) return lesson
    }
    return null
  }

  const renderVideoPlayer = (lesson) => {
    if (!lesson?.videoUrl) return (
      <div className="flex flex-col items-center justify-center h-48 p-4 bg-gray-100 rounded-lg sm:h-64">
        <Lock className="w-8 h-8 mb-2 text-gray-400 sm:h-12 sm:w-12" />
        <p className="text-sm text-center text-gray-600 sm:text-base">Video not available</p>
      </div>
    )

    const videoId = getYouTubeVideoId(lesson.videoUrl)
    if (videoId && isYouTubeLoaded) {
      return (
        <div className="relative w-full overflow-hidden rounded-lg" style={{ height: '500px' }}>
          <div
            ref={youtubePlayerRef}
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      )
    } else if (videoId && !isYouTubeLoaded) {
      return (
        <div className="flex flex-col items-center justify-center h-48 p-4 bg-gray-100 rounded-lg sm:h-64">
          <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin sm:h-8 sm:w-8"></div>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">Loading YouTube player...</p>
        </div>
      )
    }

    return (
      <div className="relative w-full overflow-hidden rounded-lg" style={{ height: '700px' }}>
        <video
          src={lesson.videoUrl}
          controls
          className="absolute top-0 left-0 w-full h-full object-cover"
          onEnded={() => handleVideoEnd(lesson._id)}
        />
      </div>
    )
  }

  // Render module sidebar content
  const renderModuleSidebar = () => (
    <>
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
          <p className="text-sm text-gray-600">
            {getCompletedLessonsCount()} of {getAllLessonsCount()} lessons completed
          </p>
        </div>
        
        <div className="space-y-2 overflow-y-auto max-h-96">
          {course.modules.map((module, moduleIndex) => (
            <div key={module._id} className="border border-gray-200 rounded-lg">
              <button
                type="button"
                className="flex items-center justify-between w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg"
                onClick={() => toggleModule(module._id)}
              >
                <div>
                  <h4 className="font-medium text-gray-900">{module.name}</h4>
                  <p className="text-xs text-gray-500">
                    {module.subcourses.length} lessons • {formatDuration(module.subcourses.reduce((acc, lesson) => acc + (lesson.duration || 0), 0))}
                  </p>
                </div>
                {expandedModules[module._id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {expandedModules[module._id] && (
                <div className="p-2 space-y-1">
                  {module.subcourses.map((lesson, lessonIndex) => (
                    <motion.div
                      key={lesson._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: lessonIndex * 0.03 }}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedLesson?._id === lesson._id ? "bg-red-50 border border-red-200" : "hover:bg-gray-50"}`}
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <div className="flex items-start space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${selectedLesson?._id === lesson._id ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                          {lessonIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-medium text-gray-900 truncate sm:text-sm">{lesson.title}</h5>
                          <div className="flex items-center mt-1 space-x-1">
                            <Clock className="w-2 h-2 text-gray-400" />
                            <span className="text-xs text-gray-500">{formatDuration(lesson.duration)}</span>
                          </div>
                        </div>
                        {isLessonCompleted(lesson._id) && (
                          <CheckCircle className="flex-shrink-0 w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )

  // Render mobile sidebar content
  const renderMobileSidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Course Content</h2>
        <button onClick={() => setIsSidebarOpen(false)} className="p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {getCompletedLessonsCount()} of {getAllLessonsCount()} lessons completed
        </p>
      </div>
      
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {course.modules.map((module, moduleIndex) => (
          <div key={module._id} className="border border-gray-200 rounded-lg">
            <button
              type="button"
              className="flex items-center justify-between w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg"
              onClick={() => toggleModule(module._id)}
            >
              <div>
                <h4 className="font-medium text-gray-900">{module.name}</h4>
                <p className="text-xs text-gray-500">
                  {module.subcourses.length} lessons • {formatDuration(module.subcourses.reduce((acc, lesson) => acc + (lesson.duration || 0), 0))}
                </p>
              </div>
              {expandedModules[module._id] ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedModules[module._id] && (
              <div className="p-2 space-y-1">
                {module.subcourses.map((lesson, lessonIndex) => (
                  <motion.div
                    key={lesson._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: lessonIndex * 0.03 }}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${selectedLesson?._id === lesson._id ? "bg-red-50 border border-red-200" : "hover:bg-gray-50"}`}
                    onClick={() => {
                      setSelectedLesson(lesson)
                      setIsSidebarOpen(false)
                    }}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${selectedLesson?._id === lesson._id ? "bg-red-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                        {lessonIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-medium text-gray-900 truncate sm:text-sm">{lesson.title}</h5>
                        <div className="flex items-center mt-1 space-x-1">
                          <Clock className="w-2 h-2 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatDuration(lesson.duration)}</span>
                        </div>
                      </div>
                      {isLessonCompleted(lesson._id) && (
                        <CheckCircle className="flex-shrink-0 w-3 h-3 text-green-600" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin sm:h-12 sm:w-12"></div>
    </div>
  )
  
  if (error || !course) return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center">
        <p className="mb-4 text-lg text-red-600 sm:text-xl">{error || "Course not found"}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    </div>
  )

  if (!isEnrolled) return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400 sm:h-16 sm:w-16" />
        <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">Course Locked</h2>
        <p className="mb-6 text-gray-600">You need to enroll in this course to access the content.</p>
        <div className="space-y-3">
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            View Course Details
          </button>
          <button 
            onClick={() => navigate("/courses")}
            className="w-full px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Browse Courses
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-3 py-3 bg-white border-b border-gray-200 sm:px-4 sm:py-4 text-center">
        <div className="flex flex-col items-start mx-auto space-y-3 max-w-7xl sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <button 
              onClick={() => navigate(`/courses/${courseId}`)} 
              className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-gray-900 mt-3"
            >
              <ArrowLeft className="w-4 h-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base text-center text-primary-800 ">Back to Course</span>
            </button>
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 transition-colors bg-gray-100 rounded-lg sm:hidden hover:bg-gray-200"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate sm:text-xl">{course?.title}</h1>
            <p className="text-xs text-gray-600 sm:text-sm">Continue your learning journey</p>
          </div>
          
          {progress && (
            <div className="w-full text-right sm:w-auto">
              <div className="mb-1 text-xs text-gray-600 sm:text-sm">
                Progress: {Math.round(progress.completionPercentage || 0)}%
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full sm:w-24">
                <div
                  className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                  style={{ width: `${Math.round(progress.completionPercentage || 0)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-3 py-4 mx-auto max-w-7xl sm:px-4 sm:py-6 lg:grid-cols-4 sm:gap-6">
        {/* Sidebar - Mobile Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <div className="absolute top-0 left-0 w-4/5 h-full max-w-sm p-4 overflow-y-auto bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
              {renderMobileSidebarContent()}
            </div>
          </div>
        )}

        {/* Sidebar - Desktop */}
        <div className="hidden space-y-4 lg:block lg:col-span-1">
          <button
            type="button"
            className={`flex items-center p-4 rounded-lg shadow-sm w-full ${isCourseCompleted() ? "bg-green-50 border border-green-200" : "bg-gray-100 border border-gray-200"} cursor-pointer transition-colors`}
            onClick={handleCertificateClick}
          >
            {isCourseCompleted() ? <Award className="w-6 h-6 mr-3 text-green-600" /> : <Lock className="w-6 h-6 mr-3 text-gray-400" />}
            <span className={`${isCourseCompleted() ? "text-green-800" : "text-gray-600"} font-medium`}>
              {isCourseCompleted() ? "Download Certificate" : "Certificate Locked"}
            </span>
          </button>

          {renderModuleSidebar()}
        </div>

        {/* Video Player */}
        <div className="lg:col-span-3">
          {selectedLesson ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white rounded-lg shadow-sm sm:p-6"
            >
              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  {/* Show which module this lesson belongs to */}
                  {course.modules.map(module => {
                    const lessonInModule = module.subcourses.some(l => l._id === selectedLesson._id)
                    if (lessonInModule) {
                      return (
                        <span key={module._id} className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs">
                          {module.name}
                        </span>
                      )
                    }
                    return null
                  })}
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">{selectedLesson.title}</h2>
                {selectedLesson.description && <p className="mb-4 text-sm text-gray-600 sm:text-base">{selectedLesson.description}</p>}
              </div>
              
              {renderVideoPlayer(selectedLesson)}

              {isLessonCompleted(selectedLesson._id) && (
                <div className="flex items-center p-3 mt-4 space-x-3 border border-green-200 rounded-lg bg-green-50 sm:p-4">
                  <CheckCircle className="w-5 h-5 text-green-600 sm:h-6 sm:w-6" />
                  <div>
                    <p className="text-sm font-medium text-green-800 sm:text-base">Lesson Completed!</p>
                    <p className="text-xs text-green-600 sm:text-sm">Great job! Continue to the next lesson.</p>
                  </div>
                </div>
              )}

              {selectedLesson.resources?.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h3 className="mb-3 text-base font-semibold text-gray-900 sm:text-lg sm:mb-4">Resources</h3>
                  <div className="space-y-2">
                    {selectedLesson.resources.map((res, idx) => (
                      <a 
                        key={idx} 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center p-3 space-x-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-blue-600 bg-blue-100 rounded-full sm:w-8 sm:h-8">
                          {res.type?.toUpperCase()?.charAt(0) || "L"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{res.title}</p>
                          <p className="text-xs text-gray-600">Click to download/view</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="p-6 text-center bg-white rounded-lg shadow-sm sm:p-12">
              <Play className="w-12 h-12 mx-auto mb-3 text-gray-300 sm:h-16 sm:w-16 sm:mb-4" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">Select a Lesson</h3>
              <p className="text-sm text-gray-600 sm:text-base">Choose a lesson from the sidebar to start learning</p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg sm:hidden hover:bg-blue-700"
              >
                Open Lessons
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LearnPage