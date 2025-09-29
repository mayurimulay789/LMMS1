"use client"

import { useState, useEffect } from "react"
import { Plus, Upload, X, Save, Eye, Edit, Trash2, ImageIcon, Clock } from "lucide-react"

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
    lessons: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:2000/api/admin/courses", {
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
      // Mock data for demonstration
      setCourses([
        {
          _id: "1",
          title: "JavaScript Fundamentals",
          description: "Learn the basics of JavaScript programming",
          category: "Programming",
          price: 99,
          instructor: "John Doe",
          thumbnail: "/placeholder.svg",
          lessons: 12,
          enrollments: 150,
          status: "published",
        },
        {
          _id: "2",
          title: "React Development",
          description: "Build modern web applications with React",
          category: "Programming",
          price: 149,
          instructor: "Jane Smith",
          thumbnail: "/placeholder.svg",
          lessons: 18,
          enrollments: 89,
          status: "draft",
        },
      ])
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
      const response = await fetch(`http://localhost:2000/api/upload/${endpoint}`, {
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



  const addLesson = () => {
    setFormData((prev) => ({
      ...prev,
      lessons: [
        ...prev.lessons,
        {
          id: Date.now(),
          title: "",
          description: "",
          videoUrl: "",
          order: prev.lessons.length + 1, // Add order field
          materials: [],
        },
      ],
    }))
  }

  const updateLesson = (lessonId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, [field]: value } : lesson)),
    }))
  }

  const removeLesson = (lessonId) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      const url = editingCourse
        ? `http://localhost:2000/api/admin/courses/${editingCourse._id}`
        : "http://localhost:2000/api/admin/courses"

      // Transform lessons to include order field for API
      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        level: formData.level,
        thumbnail: formData.thumbnail,
        lessons: formData.lessons.map((lesson, index) => ({
          ...lesson,
          order: lesson.order || index + 1, // Ensure order is set
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
      lessons: [],
    })
    setIsCreating(false)
    setEditingCourse(null)
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
      lessons: course.lessons || [],
    })
    setIsCreating(true)
  }

  const deleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:2000/api/admin/courses/${courseId}`, {
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
      const response = await fetch(`http://localhost:2000/api/admin/courses/${courseId}/recalculate-duration`, {
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
                  className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Upload Thumbnail (Image or Video)</span>
                </label>
                {formData.thumbnail && (
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
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
                          console.log('Video src:', formData.thumbnail)
                          // Fallback to showing file type indicator
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
                        src={formData.thumbnail || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.log('Image load error:', e)
                          console.log('Image src:', formData.thumbnail)
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
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Supports: Images (JPG, PNG, GIF) and Videos (MP4, WebM, MOV)</p>
            </div>

            {/* Lessons */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Course Lessons</label>
                <button
                  type="button"
                  onClick={addLesson}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Lesson</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.lessons.map((lesson, index) => (
                  <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium text-gray-900">Lesson {index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeLesson(lesson.id)}
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
                          onChange={(e) => updateLesson(lesson.id, "title", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                        <input
                          type="url"
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(lesson.id, "videoUrl", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Description</label>
                      <textarea
                        value={lesson.description}
                        onChange={(e) => updateLesson(lesson.id, "description", e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.log('Course image load error:', e)
                          console.log('Course image src:', course.thumbnail)
                          e.target.style.display = 'none'
                          const fallback = e.target.parentElement.querySelector('.course-image-fallback') || document.createElement('div')
                          fallback.className = 'course-image-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-xs text-gray-600 font-medium'
                          fallback.textContent = 'IMG'
                          if (!e.target.parentElement.querySelector('.course-image-fallback')) {
                            e.target.parentElement.appendChild(fallback)
                          }
                        }}
                        onLoad={(e) => {
                          console.log('Course image loaded successfully')
                          const fallback = e.target.parentElement.querySelector('.course-image-fallback')
                          if (fallback) fallback.remove()
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
