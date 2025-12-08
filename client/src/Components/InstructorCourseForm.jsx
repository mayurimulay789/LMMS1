"use client"

import { useState, useEffect } from "react"
import { Plus, Upload, X, Save, Eye, Edit, Trash2, ImageIcon, Clock } from "lucide-react"
import { apiRequest } from "../config/api"

const InstructorCourseForm = ({ onCourseCreated, onCourseUpdated }) => {
  const [courses, setCourses] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [courseCount, setCourseCount] = useState(0)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    level: "Beginner",
    thumbnail: null,
    modules: [{
      id: Date.now(),
      name: "Module 1: Introduction",
      order: 1,
      subcourses: []
    }],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await apiRequest("instructor/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCourses(data)
        setCourseCount(data.length)
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
    // Use XMLHttpRequest for multipart upload (more reliable and matches admin flow)
    const formDataUpload = new FormData()
    formDataUpload.append(type === 'thumbnail' ? 'thumbnail' : 'video', file)

    const endpoint = type === 'thumbnail' ? 'course-media' : 'lesson-video'

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error('No authentication token found')

      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")

      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.open('POST', `${API_BASE_URL}/upload/${endpoint}`)
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText)
              if (data && data.data && data.data.url) {
                resolve(data.data.url)
              } else {
                reject(new Error('Upload succeeded but no URL returned'))
              }
            } catch (e) {
              reject(new Error('Invalid JSON response from upload'))
            }
          } else {
            let errMsg = `Upload failed with status ${xhr.status}`
            try {
              const err = JSON.parse(xhr.responseText)
              errMsg = err.message || err.error || errMsg
            } catch (e) {}
            reject(new Error(errMsg))
          }
        }

        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.ontimeout = () => reject(new Error('Upload timed out'))

        // Longer timeout for uploads
        xhr.timeout = 10 * 60 * 1000
        xhr.send(formDataUpload)
      })
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      return null
    }
  }

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = await handleFileUpload(file, "thumbnail")
      if (url) {
        setFormData((prev) => ({
          ...prev,
          thumbnail: url,
        }))
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
      const endpoint = editingCourse
        ? `instructor/courses/${editingCourse._id}`
        : "instructor/courses"

      const submitData = {
        ...formData,
        modules: formData.modules.map(module => ({
          ...module,
          subcourses: module.subcourses.map((subcourse, index) => ({
            ...subcourse,
            order: subcourse.order || index + 1,
          }))
        }))
      }

      const response = await apiRequest(endpoint, {
        method: editingCourse ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        resetForm()
        fetchCourses()
        setCourseCount(prev => editingCourse ? prev : prev + 1)
        if (editingCourse) {
          onCourseUpdated && onCourseUpdated()
        } else {
          onCourseCreated && onCourseCreated()
        }
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
      modules: [{
        id: Date.now(),
        name: "Module 1: Introduction",
        order: 1,
        subcourses: []
      }],
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
      modules: course.modules?.map((module, index) => ({
        ...module,
        id: module._id || module.id || Date.now() + index,
        subcourses: module.subcourses?.map((sub, subIndex) => ({
          ...sub,
          id: sub._id || sub.id || Date.now() + subIndex,
        })) || []
      })) || [{
        id: Date.now(),
        name: "Module 1: Introduction",
        order: 1,
        subcourses: []
      }],
    })
    setIsCreating(true)
  }

  const deleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const token = localStorage.getItem("token")
        const response = await apiRequest(`instructor/courses/${courseId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          fetchCourses()
          setCourseCount(prev => prev - 1)
        }
      } catch (error) {
        console.error("Error deleting course:", error)
      }
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
          <p className="text-sm text-gray-600">Total Courses: {courseCount}</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Course</span>
        </button>
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
                  <span className="text-sm text-gray-600">Upload Thumbnail</span>
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
                      />
                    ) : (
                      <img
                        src={formData.thumbnail || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modules and Lessons */}
            <div className="space-y-6">
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

              {formData.modules.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Module</h4>
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                    <input
                      type="text"
                      value={module.name}
                      onChange={(e) => updateModuleName(module.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter module name"
                    />
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Lessons</label>
                    <button
                      type="button"
                      onClick={() => addLesson(module.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Lesson</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {module.subcourses.map((lesson, index) => (
                      <div key={lesson.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-medium text-gray-900">Lesson {index + 1}</h5>
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

                  {module.subcourses.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No lessons in this module yet. Add a lesson above.</p>
                  )}
                </div>
              ))}
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
          <h4 className="text-lg font-medium text-gray-900">My Courses</h4>
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
                      />
                    ) : (
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="h-full w-full object-cover"
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
                  <button
                    onClick={() => window.open(`/courses/${course._id}`, "_blank")}
                    className="text-blue-600 hover:text-blue-800 p-2"
                  >
                    <Eye className="h-4 w-4" />
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

export default InstructorCourseForm
