"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Upload, X, Save, Eye, Edit, Trash2, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Menu } from "lucide-react"
import { getImageWithFallback } from "../utils/imageUtils"

const AdminCourseForm = () => {
  const [courses, setCourses] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    level: "Beginner",
    thumbnail: null,
    thumbnailSource: null,
    modules: [{
      id: Date.now(),
      name: "Module 1: Introduction",
      order: 1,
      subcourses: []
    }],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [thumbnailMode, setThumbnailMode] = useState('upload')
  const [thumbnailLink, setThumbnailLink] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState('')
  const [uploadError, setUploadError] = useState(null)
  const [uploadWarning, setUploadWarning] = useState(null)
  const [uploadTime, setUploadTime] = useState(0)
  const [expandedModules, setExpandedModules] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const fileInputRef = useRef(null)

  // File size limits (in bytes)
  const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024, // 5MB
    video: 150 * 1024 * 1024, // 150MB
  }

  // Helper functions for YouTube URLs
  const isYouTubeURL = (url) => {
    if (!url) return false
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/
    return youtubeRegex.test(url)
  }

  const getYouTubeThumbnail = (url) => {
    if (!isYouTubeURL(url)) return url
    
    let videoId = null
    
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0]
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0]
    }
    
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : url
  }

  // Validate file before upload
  const validateFile = (file, type) => {
    const maxSize = type === 'thumbnail' ? FILE_SIZE_LIMITS.video : FILE_SIZE_LIMITS.video
    
    if (file.size > maxSize) {
      const sizeInMB = (maxSize / (1024 * 1024)).toFixed(0)
      throw new Error(`File too large. Maximum size for ${type} is ${sizeInMB}MB`)
    }

    // Validate file types
    if (type === 'thumbnail') {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/mov', 'video/avi', 'video/x-matroska']
      
      if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG, MOV, AVI, MKV)')
      }
    }

    return true
  }

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Calculate upload speed
  const calculateUploadSpeed = (bytesLoaded, timeElapsed) => {
    const bytesPerSecond = bytesLoaded / (timeElapsed / 1000)
    if (bytesPerSecond > 1024 * 1024) {
      return (bytesPerSecond / (1024 * 1024)).toFixed(2) + ' MB/s'
    } else if (bytesPerSecond > 1024) {
      return (bytesPerSecond / 1024).toFixed(2) + ' KB/s'
    } else {
      return bytesPerSecond.toFixed(2) + ' B/s'
    }
  }

  const handleThumbnailLinkAdd = async () => {
    if (thumbnailLink.trim()) {
      setFormData(prev => ({
        ...prev,
        thumbnail: thumbnailLink.trim(),
        thumbnailSource: 'link'
      }))
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
      const response = await fetch(`${API_BASE_URL}/admin/courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileUpload = async (file, type) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadSpeed('')
    setUploadTime(0)
    setUploadError(null)
    setUploadWarning(null)

    const startTime = Date.now()
    let loaded = 0

    try {
      console.log('Starting optimized file upload:', {
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        isLarge: file.size > 50 * 1024 * 1024
      })

      // Validate file first
      validateFile(file, type)

      const formDataUpload = new FormData()
      formDataUpload.append(type === 'thumbnail' ? 'thumbnail' : 'video', file)

      const endpoint = type === 'thumbnail' ? 'course-media' : 'lesson-video'

      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
      
      console.log('Uploading to:', `${API_BASE_URL}/upload/${endpoint}`)

      // Use XMLHttpRequest for better progress tracking
      const xhr = new XMLHttpRequest()
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            loaded = event.loaded
            const percentComplete = (event.loaded / event.total) * 100
            const currentTime = Date.now()
            const timeElapsed = currentTime - startTime
            
            setUploadProgress(Math.round(percentComplete))
            setUploadSpeed(calculateUploadSpeed(loaded, timeElapsed))
            setUploadTime(timeElapsed)
            
            console.log(`Upload progress: ${Math.round(percentComplete)}% - ${calculateUploadSpeed(loaded, timeElapsed)}`)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText)
            console.log('Upload successful:', data)
            
            const totalTime = Date.now() - startTime
            const averageSpeed = calculateUploadSpeed(file.size, totalTime)
            
            console.log(`Upload completed in ${(totalTime / 1000).toFixed(2)}s - Average speed: ${averageSpeed}`)
            
            if (!data.success) {
              reject(new Error(data.message || 'Upload failed: Server returned unsuccessful response'))
            } else if (!data.data?.url) {
              reject(new Error('Upload failed: No URL returned from server'))
            } else {
              // Show optimization tips for large files
              if (file.size > 50 * 1024 * 1024) {
                setUploadWarning(`Large file uploaded successfully (${formatFileSize(file.size)}) in ${(totalTime / 1000).toFixed(2)}s. Consider compressing videos for better performance.`)
              }
              
              resolve(data.data.url)
            }
          } else {
            let errorData
            try {
              errorData = JSON.parse(xhr.responseText)
            } catch (e) {
              errorData = { message: `Upload failed with status: ${xhr.status} ${e}` }
            }
            reject(new Error(errorData.message || errorData.error || `Upload failed: ${xhr.status}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed due to network error. Please check your connection.'))
        })

        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout. Please try again with a smaller file or better connection.'))
        })

        // Set longer timeout for large files (10 minutes)
        xhr.timeout = 10 * 60 * 1000

        xhr.open('POST', `${API_BASE_URL}/upload/${endpoint}`)
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        xhr.send(formDataUpload)
      })

    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      setUploadError(error.message)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    console.log('Selected file for thumbnail:', {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type
    })

    try {
      const url = await handleFileUpload(file, "thumbnail")
      if (url) {
        console.log('Setting thumbnail URL:', url)
        setFormData((prev) => ({
          ...prev,
          thumbnail: url,
          thumbnailSource: 'upload'
        }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      // Error is already displayed via uploadError state
    }
  }

  const addModule = () => {
    const newModuleOrder = formData.modules.length + 1
    const newModuleId = Date.now() + newModuleOrder
    setFormData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          id: newModuleId,
          name: `Module ${newModuleOrder}: New Module`,
          order: newModuleOrder,
          subcourses: []
        }
      ]
    }))
    setExpandedModules(prev => [...prev, newModuleId])
  }

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const updateModuleName = (moduleId, name) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId ? { ...module, name } : module
      )
    }))
  }

  const removeModule = (moduleId) => {
    if (formData.modules.length > 1) {
      setFormData((prev) => ({
        ...prev,
        modules: prev.modules
          .filter(module => module.id !== moduleId)
          .map((module, index) => ({ ...module, order: index + 1 }))
      }))
      setExpandedModules(prev => prev.filter(id => id !== moduleId))
    }
  }

  const addLesson = (moduleId) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            subcourses: [
              ...module.subcourses,
              {
                id: Date.now(),
                title: "",
                description: "",
                videoUrl: "",
                order: module.subcourses.length + 1,
                materials: [],
              },
            ],
          }
        }
        return module
      }),
    }))
  }

  const updateLesson = (moduleId, lessonId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) => {
        if (module.id === moduleId) {
          return {
            ...module,
            subcourses: module.subcourses.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            ),
          }
        }
        return module
      }),
    }))
  }

  const removeLesson = (moduleId, lessonId) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.map((module) => {
        if (module.id === moduleId) {
          const updatedSubcourses = module.subcourses.filter((lesson) => lesson.id !== lessonId)
          return {
            ...module,
            subcourses: updatedSubcourses.map((sub, index) => ({ ...sub, order: index + 1 })),
          }
        }
        return module
      }),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
      const url = editingCourse
        ? `${API_BASE_URL}/admin/courses/${editingCourse._id}`
        : `${API_BASE_URL}/admin/courses`

      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        level: formData.level,
        thumbnail: formData.thumbnail,
        thumbnailSource: formData.thumbnailSource,
        modules: formData.modules.map(module => ({
          ...module,
          subcourses: module.subcourses.map((subcourse, index) => ({
            ...subcourse,
            order: subcourse.order || index + 1,
          }))
        }))
      }

      console.log('Submitting course data:', submitData)

      const response = await fetch(url, {
        method: editingCourse ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        resetForm()
        fetchCourses()
        alert(editingCourse ? "Course updated successfully!" : "Course created successfully!")
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message || 'Failed to save course'}`)
      }
    } catch (error) {
      console.error("Error saving course:", error)
      alert("Error saving course. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      price: "",
      level: "Beginner",
      thumbnail: null,
      thumbnailSource: null,
      modules: [{
        id: Date.now(),
        name: "Module 1: Introduction",
        order: 1,
        subcourses: []
      }],
    })
    setIsCreating(false)
    setEditingCourse(null)
    setThumbnailMode('upload')
    setThumbnailLink('')
    setIsUploading(false)
    setUploadProgress(0)
    setUploadSpeed('')
    setUploadTime(0)
    setUploadError(null)
    setUploadWarning(null)
    setExpandedModules([])
  }

  const startEditing = (course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      level: course.level || "Beginner",
      thumbnail: course.thumbnail,
      thumbnailSource: course.thumbnailSource || (course.thumbnail ? 'upload' : null),
      modules: course.modules || [{
        id: Date.now(),
        name: "Module 1: Introduction",
        order: 1,
        subcourses: []
      }],
    })
    setIsCreating(true)
    
    if (course.thumbnailSource === 'link') {
      setThumbnailMode('link')
      setThumbnailLink(course.thumbnail || '')
    } else {
      setThumbnailMode('upload')
      setThumbnailLink('')
    }
    
    // Expand all modules when editing
    const moduleIds = course.modules?.map(module => module.id) || []
    setExpandedModules(moduleIds)
  }

  const deleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const token = localStorage.getItem("token")
        const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
        const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          fetchCourses()
          alert("Course deleted successfully!")
        }
      } catch (error) {
        console.error("Error deleting course:", error)
        alert("Error deleting course. Please try again.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm">
        <div className="space-y-4 animate-pulse">
          <div className="w-1/4 h-4 bg-gray-300 rounded"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Course Management</h3>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className={`flex flex-col gap-2 md:flex-row md:space-x-2 ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 md:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm md:text-base">Create Course</span>
          </button>
        </div>
      </div>

      {/* Course Form */}
      {isCreating && (
        <div className="p-4 bg-white rounded-lg shadow-sm md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-gray-900">{editingCourse ? "Edit Course" : "Create New Course"}</h4>
            <button 
              onClick={resetForm} 
              className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Course Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:text-base"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:text-base"
                >
                  <option value="">Select Category</option>
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Business">Business</option>
                  <option value="Creative">Creative</option>
                  <option value="Technology">Technology</option>
                  <option value="Health">Health</option>
                  <option value="Language">Language</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:text-base"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:text-base"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:text-base md:rows-4"
              />
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Course Thumbnail</label>
              
              {/* Upload Progress */}
              {isUploading && (
                <div className="p-3 mb-3 border border-blue-200 rounded-lg bg-blue-50 md:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      <span className="text-xs font-medium text-blue-700 md:text-sm">Uploading...</span>
                    </div>
                    <div className="text-xs text-blue-600 md:text-sm">
                      {uploadProgress}%
                    </div>
                  </div>
                  <div className="w-full h-2 mb-2 bg-blue-200 rounded-full">
                    <div 
                      className="h-2 transition-all duration-300 ease-out bg-blue-600 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-blue-600">
                    <span className="text-xs md:text-sm">Speed: {uploadSpeed}</span>
                    <span className="text-xs md:text-sm">Time: {(uploadTime / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              )}

              {/* Upload Warning */}
              {uploadWarning && (
                <div className="p-3 mb-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex items-start">
                    <AlertCircle className="flex-shrink-0 w-4 h-4 mt-0.5 mr-2 text-yellow-600" />
                    <div className="text-xs text-yellow-700 md:text-sm">
                      {uploadWarning}
                    </div>
                    <button
                      onClick={() => setUploadWarning(null)}
                      className="flex-shrink-0 ml-2 text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="p-3 mb-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start">
                    <div className="flex-1 text-xs text-red-600 md:text-sm">
                      <strong>Upload failed:</strong> {uploadError}
                    </div>
                    <button
                      onClick={() => setUploadError(null)}
                      className="flex-shrink-0 ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-red-500">
                    Try using a smaller file or different format. You can also use external URLs.
                  </div>
                </div>
              )}

              {/* Thumbnail Options Tabs */}
              <div className="flex mb-4 space-x-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setThumbnailMode('upload')}
                  className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-lg md:px-4 md:text-sm ${
                    thumbnailMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailMode('link')}
                  className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-lg md:px-4 md:text-sm ${
                    thumbnailMode === 'link'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  External Link
                </button>
              </div>

              {/* Upload Mode */}
              {thumbnailMode === 'upload' && (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:space-x-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className={`border-2 border-dashed rounded-lg p-3 md:p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2 md:flex-row md:min-w-[200px] ${
                        isUploading 
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-xs md:text-sm">
                        {isUploading ? 'Uploading...' : 'Upload Thumbnail'}
                      </span>
                    </label>
                    {formData.thumbnail && formData.thumbnailSource === 'upload' && (
                      <div className="relative flex items-center justify-center w-full h-40 overflow-hidden bg-gray-100 rounded-lg md:w-16 md:h-16">
                        {formData.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i) ? (
                          <video
                            src={formData.thumbnail}
                            className="object-cover w-full h-full"
                            muted
                            controls={false}
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={formData.thumbnail}
                            alt="Thumbnail preview"
                            className="object-cover w-full h-full"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, thumbnail: null, thumbnailSource: null }))}
                          className="absolute p-1 text-white bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                          disabled={isUploading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {formData.thumbnailSource === 'upload' && formData.thumbnail && !isUploading && (
                    <div className="flex items-center p-2 space-x-2 text-xs text-green-600 rounded bg-green-50">
                      <CheckCircle className="w-4 h-4" />
                      <span>File uploaded successfully</span>
                    </div>
                  )}
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>✅ Supports: Images (JPG, PNG, GIF, WebP) up to 5MB</p>
                    <p>✅ Videos (MP4, WebM, OGG, MOV, AVI, MKV) up to 150MB</p>
                  </div>
                </div>
              )}

              {/* Link Mode */}
              {thumbnailMode === 'link' && (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:space-x-4">
                    <input
                      type="url"
                      value={thumbnailLink}
                      onChange={(e) => setThumbnailLink(e.target.value)}
                      placeholder="Enter image/video URL (YouTube, external images, etc.)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleThumbnailLinkAdd}
                      className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Apply Link
                    </button>
                  </div>
                  {formData.thumbnail && formData.thumbnailSource === 'link' && (
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:space-x-4">
                      <div className="relative flex items-center justify-center w-full h-40 overflow-hidden bg-gray-100 rounded-lg md:w-16 md:h-16">
                        {isYouTubeURL(formData.thumbnail) ? (
                          <img
                            src={getYouTubeThumbnail(formData.thumbnail)}
                            alt="YouTube thumbnail"
                            className="object-cover w-full h-full"
                          />
                        ) : formData.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i) ? (
                          <video
                            src={formData.thumbnail}
                            className="object-cover w-full h-full"
                            muted
                            controls={false}
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={formData.thumbnail}
                            alt="External thumbnail"
                            className="object-cover w-full h-full"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, thumbnail: null, thumbnailSource: null }))
                            setThumbnailLink('')
                          }}
                          className="absolute p-1 text-white bg-red-500 rounded-full top-2 right-2 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="p-2 text-xs text-blue-600 rounded bg-blue-50">
                          ✓ External Link Applied
                        </div>
                        {isYouTubeURL(formData.thumbnail) && (
                          <div className="p-1 mt-1 text-xs text-purple-600 rounded bg-purple-50">
                            YouTube video detected
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Supports: YouTube URLs, direct image links, video links
                  </p>
                </div>
              )}
            </div>

            {/* Modules and Lessons */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Course Modules</label>
                <button
                  type="button"
                  onClick={addModule}
                  className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Module</span>
                </button>
              </div>

              <div className="space-y-4 md:space-y-6">
                {formData.modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleModuleExpansion(module.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
                            {module.order}
                          </div>
                          <input
                            type="text"
                            value={module.name}
                            onChange={(e) => updateModuleName(module.id, e.target.value)}
                            className="p-0 text-base font-medium text-gray-900 bg-transparent border-none focus:ring-0"
                            required
                            placeholder="Module Name"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            addLesson(module.id)
                            if (!expandedModules.includes(module.id)) {
                              toggleModuleExpansion(module.id)
                            }
                          }}
                          className="p-1 text-green-600 rounded hover:bg-green-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {formData.modules.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeModule(module.id)
                            }}
                            className="p-1 text-red-600 rounded hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedModules.includes(module.id) && (
                      <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="space-y-4">
                          {module.subcourses.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-4">
                                <h6 className="font-medium text-gray-900">
                                  <span className="inline-block w-6 h-6 mr-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-full flex items-center justify-center">
                                    {lessonIndex + 1}
                                  </span>
                                  Lesson {lessonIndex + 1}
                                </h6>
                                <button
                                  type="button"
                                  onClick={() => removeLesson(module.id, lesson.id)}
                                  className="p-1 text-red-600 rounded hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Lesson Title</label>
                                  <input
                                    type="text"
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(module.id, lesson.id, "title", e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="block mb-1 text-sm font-medium text-gray-700">Video URL</label>
                                  <input
                                    type="url"
                                    value={lesson.videoUrl}
                                    onChange={(e) => updateLesson(module.id, lesson.id, "videoUrl", e.target.value)}
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>

                              <div className="mt-4">
                                <label className="block mb-1 text-sm font-medium text-gray-700">Lesson Description</label>
                                <textarea
                                  value={lesson.description}
                                  onChange={(e) => updateLesson(module.id, lesson.id, "description", e.target.value)}
                                  rows={2}
                                  required
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          ))}
                          
                          {module.subcourses.length === 0 && (
                            <div className="p-4 text-center border-2 border-dashed border-gray-300 rounded-lg">
                              <p className="text-gray-500">No lessons added yet. Click the + button above to add a lesson.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col-reverse gap-3 pt-4 border-t border-gray-200 md:flex-row md:justify-end md:space-x-4 md:gap-0">
              <button
                type="button"
                onClick={resetForm}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 md:w-auto"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed md:w-auto"
                disabled={isUploading}
              >
                <Save className="w-4 h-4" />
                <span>{editingCourse ? "Update Course" : "Create Course"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 md:p-6">
          <h4 className="text-lg font-medium text-gray-900">Existing Courses</h4>
        </div>

        <div className="divide-y divide-gray-200">
          {courses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No courses found. Create your first course!</p>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course._id} className="p-4 hover:bg-gray-50 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-full h-40 overflow-hidden bg-gray-100 rounded-lg md:w-16 md:h-16">
                        {course.thumbnail && course.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i) ? (
                          <video
                            src={course.thumbnail}
                            className="object-cover w-full h-full"
                            muted
                            controls={false}
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={getImageWithFallback(course.thumbnail, 'thumbnail', { title: course.title, category: course.category })}
                            alt={course.title}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="mb-1 text-lg font-medium text-gray-900">{course.title}</h5>
                      <p className="mb-3 text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-3 md:gap-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {course.category}
                        </span>
                        <span className="text-sm font-medium text-gray-900">₹{course.price}</span>
                        <span className="text-sm text-gray-500">
                          {course.enrollments || 0} {course.enrollments === 1 ? 'enrollment' : 'enrollments'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            course.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {course.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {course.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 md:pt-0 md:border-t-0 md:justify-end md:space-x-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`/courses/${course._id}`, "_blank")}
                        className="p-2 text-blue-600 rounded hover:bg-blue-50"
                        title="Preview Course"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => startEditing(course)} 
                        className="p-2 text-green-600 rounded hover:bg-green-50"
                        title="Edit Course"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => deleteCourse(course._id)} 
                        className="p-2 text-red-600 rounded hover:bg-red-50"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCourseForm