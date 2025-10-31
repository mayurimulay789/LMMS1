"use client"

import { useState, useEffect } from "react"
import { Plus, Upload, X, Save, Eye, Edit, Trash2, Clock } from "lucide-react"
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
    thumbnailSource: null, // 'upload' or 'link'
    modules: [{
      id: Date.now(),
      name: "Module 1: Introduction",
      order: 1,
      subcourses: []
    }],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [thumbnailMode, setThumbnailMode] = useState('upload') // 'upload' or 'link'
  const [thumbnailLink, setThumbnailLink] = useState('')

  // Helper functions for YouTube URLs
  const isYouTubeURL = (url) => {
    if (!url) return false
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/
    return youtubeRegex.test(url)
  }

  const getYouTubeThumbnail = (url) => {
    if (!isYouTubeURL(url)) return url
    
    // Extract video ID from various YouTube URL formats
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

  const handleThumbnailLinkAdd = async () => {
    if (thumbnailLink.trim()) {
      setFormData(prev => ({
        ...prev,
        thumbnail: thumbnailLink.trim(),
        thumbnailSource: 'link'
      }))
      
      // Optional: Validate URL in background (no blocking)
      try {
        const token = localStorage.getItem("token")
        const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
        
        fetch(`${API_BASE_URL}/upload/validate-url`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: thumbnailLink.trim() }),
        })
        .then(response => response.json())
        .then(data => {
          console.log('URL validation result:', data)
          if (!data.success) {
            console.warn('URL may not be accessible:', data.data?.error)
          }
        })
        .catch(error => {
          console.log('URL validation failed (non-blocking):', error)
        })
      } catch (error) {
        console.log('URL validation error (non-blocking):', error)
      }
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
      // Show empty state instead of mock data
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
    const formDataUpload = new FormData()
    formDataUpload.append(type === 'thumbnail' ? 'thumbnail' : 'video', file)

    // Use correct endpoints based on file type
    const endpoint = type === 'thumbnail' ? 'course-media' : 'lesson-video'

    try {
      const token = localStorage.getItem("token")
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
      const response = await fetch(`${API_BASE_URL}/upload/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Upload successful:', data)
        console.log('File type:', data.data.type)
        console.log('File URL:', data.data.url)
        return data.data.url
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData)
        return null
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
    }
    return null
  }

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('Selected file:', file)
      console.log('File type:', file.type)
      console.log('File name:', file.name)

      const url = await handleFileUpload(file, "thumbnail")
      if (url) {
        console.log('Setting thumbnail URL:', url)
        setFormData((prev) => ({
          ...prev,
          thumbnail: url,
          thumbnailSource: 'upload'
        }))

        // Test if video URL is accessible
        if (url.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i)) {
          console.log('Testing video URL accessibility...')
          fetch(url, { method: 'HEAD' })
            .then(response => {
              console.log('Video URL accessibility test:', response.status, response.statusText)
            })
            .catch(error => {
              console.error('Video URL accessibility test failed:', error)
            })
        }
      }
    }
  }



  const addModule = () => {
    const newModuleOrder = formData.modules.length + 1
    setFormData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          id: Date.now() + newModuleOrder,
          name: `Module ${newModuleOrder}: New Module`,
          order: newModuleOrder,
          subcourses: []
        }
      ]
    }))
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
      }
    } catch (error) {
      console.error("Error saving course:", error)
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
    
    // Set thumbnail mode and link based on existing data
    if (course.thumbnailSource === 'link') {
      setThumbnailMode('link')
      setThumbnailLink(course.thumbnail || '')
    } else {
      setThumbnailMode('upload')
      setThumbnailLink('')
    }
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
        }
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

  const recalculateCourseDurations = async (courseId) => {
    try {
      const token = localStorage.getItem("token")
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
      const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/recalculate-duration`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Duration recalculated successfully! Total duration: ${data.course.duration} minutes`)
        fetchCourses() // Refresh the courses list
      } else {
        const errorData = await response.json()
        alert(`Error recalculating duration: ${errorData.message}`)
      }
    } catch (error) {
      console.error("Error recalculating course duration:", error)
      alert("Error recalculating course duration")
    }
  }



  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Course Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-medium text-gray-900">{editingCourse ? "Edit Course" : "Create New Course"}</h4>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>



            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
              
              {/* Thumbnail Options Tabs */}
              <div className="flex space-x-1 mb-4">
                <button
                  type="button"
                  onClick={() => setThumbnailMode('upload')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    thumbnailMode === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upload Image/Video
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailMode('link')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
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
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 flex items-center space-x-2 min-w-[200px]"
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload Thumbnail</span>
                    </label>
                    {formData.thumbnail && formData.thumbnailSource === 'upload' && (
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                        {formData.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i) ? (
                          <video
                            src={formData.thumbnail}
                            className="h-full w-full object-cover"
                            muted
                            controls={false}
                            preload="metadata"
                            onMouseEnter={(e) => {
                              e.target.play().catch(err => console.log('Video play failed:', err))
                            }}
                            onMouseLeave={(e) => {
                              e.target.pause()
                              e.target.currentTime = 0
                            }}
                            onError={(e) => {
                              console.log('Video load error:', e)
                              e.target.style.display = 'none'
                              const fallback = e.target.parentElement.querySelector('.video-fallback') || document.createElement('div')
                              fallback.className = 'video-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-xs text-gray-600 font-medium'
                              fallback.textContent = 'VIDEO'
                              if (!e.target.parentElement.querySelector('.video-fallback')) {
                                e.target.parentElement.appendChild(fallback)
                              }
                            }}
                            onLoadedData={(e) => {
                              console.log('Video loaded successfully')
                              const fallback = e.target.parentElement.querySelector('.video-fallback')
                              if (fallback) fallback.remove()
                            }}
                          />
                        ) : (
                          <img
                            src={formData.thumbnail}
                            alt="Thumbnail preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.log('Image load error:', e)
                              e.target.style.display = 'none'
                              const fallback = e.target.parentElement.querySelector('.image-fallback') || document.createElement('div')
                              fallback.className = 'image-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-xs text-gray-600 font-medium'
                              fallback.textContent = 'IMG'
                              if (!e.target.parentElement.querySelector('.image-fallback')) {
                                e.target.parentElement.appendChild(fallback)
                              }
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully')
                              const fallback = e.target.parentElement.querySelector('.image-fallback')
                              if (fallback) fallback.remove()
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, thumbnail: null, thumbnailSource: null }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {formData.thumbnailSource === 'upload' && formData.thumbnail && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                      ✓ Uploaded to Cloudinary: {formData.thumbnail}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Supports: Images (JPG, PNG, GIF) and Videos (MP4, WebM, MOV)</p>
                </div>
              )}

              {/* Link Mode */}
              {thumbnailMode === 'link' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="url"
                      value={thumbnailLink}
                      onChange={(e) => setThumbnailLink(e.target.value)}
                      placeholder="Enter image/video URL (YouTube, external images, etc.)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleThumbnailLinkAdd}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply Link
                    </button>
                  </div>
                  {formData.thumbnail && formData.thumbnailSource === 'link' && (
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
                        {isYouTubeURL(formData.thumbnail) ? (
                          <img
                            src={getYouTubeThumbnail(formData.thumbnail)}
                            alt="YouTube thumbnail"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              const fallback = e.target.parentElement.querySelector('.yt-fallback') || document.createElement('div')
                              fallback.className = 'yt-fallback absolute inset-0 flex items-center justify-center bg-red-100 text-xs text-red-600 font-medium'
                              fallback.textContent = 'YT'
                              if (!e.target.parentElement.querySelector('.yt-fallback')) {
                                e.target.parentElement.appendChild(fallback)
                              }
                            }}
                          />
                        ) : formData.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i) ? (
                          <video
                            src={formData.thumbnail}
                            className="h-full w-full object-cover"
                            muted
                            controls={false}
                            preload="metadata"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              const fallback = e.target.parentElement.querySelector('.video-fallback') || document.createElement('div')
                              fallback.className = 'video-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-xs text-gray-600 font-medium'
                              fallback.textContent = 'VIDEO'
                              if (!e.target.parentElement.querySelector('.video-fallback')) {
                                e.target.parentElement.appendChild(fallback)
                              }
                            }}
                          />
                        ) : (
                          <img
                            src={formData.thumbnail}
                            alt="External thumbnail"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              const fallback = e.target.parentElement.querySelector('.ext-fallback') || document.createElement('div')
                              fallback.className = 'ext-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-xs text-gray-600 font-medium'
                              fallback.textContent = 'EXT'
                              if (!e.target.parentElement.querySelector('.ext-fallback')) {
                                e.target.parentElement.appendChild(fallback)
                              }
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, thumbnail: null, thumbnailSource: null }))
                            setThumbnailLink('')
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                          ✓ External Link Applied: {formData.thumbnail}
                        </div>
                        {isYouTubeURL(formData.thumbnail) && (
                          <div className="text-xs text-purple-600 bg-purple-50 p-1 rounded mt-1">
                            YouTube video detected
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Supports: YouTube URLs, direct image links, video links (no validation - ensure links are accessible)
                  </p>
                </div>
              )}
            </div>

            {/* Modules and Lessons */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Course Modules</label>
                <button
                  type="button"
                  onClick={addModule}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Module</span>
                </button>
              </div>

              <div className="space-y-6">
                {formData.modules.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <input
                        type="text"
                        value={module.name}
                        onChange={(e) => updateModuleName(module.id, e.target.value)}
                        className="text-lg font-medium text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                        placeholder="Module Name"
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => addLesson(module.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        {formData.modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeModule(module.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {module.subcourses.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h6 className="font-medium text-gray-900">Lesson {lessonIndex + 1}</h6>
                            <button
                              type="button"
                              onClick={() => removeLesson(module.id, lesson.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(module.id, lesson.id, "title", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                              <input
                                type="url"
                                value={lesson.videoUrl}
                                onChange={(e) => updateLesson(module.id, lesson.id, "videoUrl", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Description</label>
                            <textarea
                              value={lesson.description}
                              onChange={(e) => updateLesson(module.id, lesson.id, "description", e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingCourse ? "Update Course" : "Create Course"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Existing Courses</h4>
        </div>

        <div className="divide-y divide-gray-200">
          {courses.map((course) => (
            <div key={course._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {course.thumbnail && course.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i) ? (
                      <video
                        src={course.thumbnail}
                        className="h-full w-full object-cover"
                        muted
                        controls={false}
                        preload="metadata"
                        onError={(e) => {
                          console.log('Course video load error:', e)
                          console.log('Course video src:', course.thumbnail)
                          e.target.style.display = 'none'
                          const fallback = e.target.parentElement.querySelector('.course-video-fallback') || document.createElement('div')
                          fallback.className = 'course-video-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-xs text-gray-600 font-medium'
                          fallback.textContent = 'VIDEO'
                          if (!e.target.parentElement.querySelector('.course-video-fallback')) {
                            e.target.parentElement.appendChild(fallback)
                          }
                        }}
                        onLoadedData={(e) => {
                          console.log('Course video loaded successfully')
                          const fallback = e.target.parentElement.querySelector('.course-video-fallback')
                          if (fallback) fallback.remove()
                        }}
                      />
                    ) : (
                      <img
                        src={getImageWithFallback(course.thumbnail, 'thumbnail', { title: course.title, category: course.category })}
                        alt={course.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.log('Course image load error:', e)
                          console.log('Course image src:', course.thumbnail)
                          e.target.style.display = 'none'
                          // Removed fallback block to prevent big block display
                        }}
                        onLoad={() => {
                          console.log('Course image loaded successfully')
                          // Removed fallback block removal
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <h5 className="text-lg font-medium text-gray-900">{course.title}</h5>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">Category: {course.category}</span>
                      <span className="text-sm text-gray-500">Price: ₹{course.price}</span>
                      <span className="text-sm text-gray-500">Enrollments: {course.enrollments}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      course.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {course.status}
                  </span>

                  <button
                    onClick={() => window.open(`/courses/${course._id}`, "_blank")}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => recalculateCourseDurations(course._id)}
                    className="text-purple-600 hover:text-purple-800 p-2"
                    title="Recalculate Duration"
                  >
                    <Clock className="h-4 w-4" />
                  </button>

                  <button onClick={() => startEditing(course)} className="text-green-600 hover:text-green-800 p-2">
                    <Edit className="h-4 w-4" />
                  </button>

                  <button onClick={() => deleteCourse(course._id)} className="text-red-600 hover:text-red-800 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminCourseForm
