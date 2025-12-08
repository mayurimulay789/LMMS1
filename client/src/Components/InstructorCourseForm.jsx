"use client"

import { useState, useEffect } from "react"
import { Plus, Upload, X, Save, Eye, Edit, Trash2, ImageIcon, Clock } from "lucide-react"
import { apiRequest, uploadCourseThumbnail } from "../config/api"

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
  const [uploading, setUploading] = useState(false)

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

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG) file.')
      return
    }
    
    // Validate file size (150MB max)
    const maxSize = 150 * 1024 * 1024 // 150MB
    if (file.size > maxSize) {
      alert('File size exceeds 150MB limit. Please select a smaller file.')
      return
    }
    
    setUploading(true)
    try {
      console.log("📤 Uploading thumbnail:", file.name, file.type, file.size)
      
      // Use the specialized upload function
      const response = await uploadCourseThumbnail(file)
      
      if (response && response.data && response.data.data && response.data.data.url) {
        console.log("✅ Upload successful, URL:", response.data.data.url)
        setFormData((prev) => ({
          ...prev,
          thumbnail: response.data.data.url,
        }))
      } else {
        console.error("❌ Upload response missing URL:", response)
        alert("Upload failed: No URL returned")
      }
    } catch (error) {
      console.error("❌ Upload failed:", error.message || error)
      alert(`Failed to upload thumbnail: ${error.message || "Unknown error"}`)
    } finally {
      setUploading(false)
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault()

  //   try {
  //     const token = localStorage.getItem("token")
  //     const endpoint = editingCourse
  //       ? `instructor/courses/${editingCourse._id}`
  //       : "instructor/courses"

  //     const submitData = {
  //       ...formData,
  //       modules: formData.modules.map(module => ({
  //         ...module,
  //         subcourses: module.subcourses.map((subcourse, index) => ({
  //           ...subcourse,
  //           order: subcourse.order || index + 1,
  //         }))
  //       }))
  //     }

  //     const response = await apiRequest(endpoint, {
  //       method: editingCourse ? "PUT" : "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(submitData),
  //     })

  //     if (response.ok) {
  //       resetForm()
  //       fetchCourses()
  //       setCourseCount(prev => editingCourse ? prev : prev + 1)
  //       if (editingCourse) {
  //         onCourseUpdated && onCourseUpdated()
  //       } else {
  //         onCourseCreated && onCourseCreated()
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error saving course:", error)
  //   }
  // }

  const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    const token = localStorage.getItem("token")
    const endpoint = editingCourse
      ? `instructor/courses/${editingCourse._id}`
      : "instructor/courses"

    // Prepare the data in the format backend expects
    const submitData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      level: formData.level,
      thumbnail: formData.thumbnail,
      modules: formData.modules.map(module => ({
        name: module.name,
        order: module.order,
        subcourses: module.subcourses.map((subcourse, index) => ({
          title: subcourse.title,
          description: subcourse.description,
          videoUrl: subcourse.videoUrl,
          order: subcourse.order || index + 1,
          materials: subcourse.materials || []
        }))
      }))
    }

    console.log("📤 Submitting course data:", JSON.stringify(submitData, null, 2))

    const response = await apiRequest(endpoint, {
      method: editingCourse ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData),
    })

    console.log("✅ Course saved response:", response)

    if (response.ok) {
      alert(editingCourse ? "Course updated successfully!" : "Course created successfully!")
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
    console.error("❌ Error saving course:", error)
    alert(`Failed to save course: ${error.message || "Unknown error"}`)
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
      <div className="p-6 bg-white rounded-lg shadow-sm">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Management</h3>
          <p className="text-sm text-gray-600">Total Courses: {courseCount}</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Course Form */}
      {isCreating && (
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-gray-900">{editingCourse ? "Edit Course" : "Create New Course"}</h4>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Course Title</label>
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
                <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
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
                <label className="block mb-2 text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Level</label>
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
              <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
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
              <label className="block mb-2 text-sm font-medium text-gray-700">Course Thumbnail</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="thumbnail-upload"
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer flex items-center space-x-2 ${uploading ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'}`}
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload Thumbnail</span>
                    </>
                  )}
                </label>
                {formData.thumbnail && (
                  <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-100 rounded-lg">
                    {formData.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i) ? (
                      <video
                        src={formData.thumbnail}
                        className="object-cover w-full h-full"
                        muted
                        controls={false}
                        preload="metadata"
                        onError={(e) => {
                          console.error('Video load error:', formData.thumbnail);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <img
                        src={formData.thumbnail}
                        alt="Thumbnail preview"
<<<<<<< HEAD
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.error('Image load error:', formData.thumbnail);
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBDMjYuNDggMjAgMjIgMjQuNDggMjIgMzBDMjIgMzUuNTIgMjYuNDggNDAgMzIgNDBDMzcuNTIgNDAgNDIgMzUuNTIgNDIgMzBDNDIgMjQuNDggMzcuNTIgMjAgMzIgMjBaTTMyIDM2QzI4LjY5IDM2IDI2IDMzLjMxIDI2IDMwQzI2IDI2LjY5IDI4LjY5IDI0IDMyIDI0QzM1LjMxIDI0IDM4IDI2LjY5IDM4IDMwQzM4IDMzLjMxIDM1LjMxIDM2IDMyIDM2WiIgZmlsbD0iIzlDQTNCMCIvPjwvc3ZnPg==';
                        }}
=======
                        className="object-cover w-full h-full"
>>>>>>> b7c03ac8588b8d2f5150cf548d2a9fd30d283536
                      />
                    )}
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP, MP4, WebM, OGG (Max 150MB)
              </p>
            </div>

            {/* Modules and Lessons */}
            <div className="space-y-6">
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

              {formData.modules.map((module) => (
                <div key={module.id} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Module</h4>
                    {formData.modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(module.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Module Name</label>
                    <input
                      type="text"
                      value={module.name}
                      onChange={(e) => updateModuleName(module.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter module name"
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">Lessons</label>
                    <button
                      type="button"
                      onClick={() => addLesson(module.id)}
                      className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Lesson</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {module.subcourses.map((lesson, index) => (
                      <div key={lesson.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-medium text-gray-900">Lesson {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeLesson(module.id, lesson.id)}
                            className="text-red-600 hover:text-red-800"
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Video URL</label>
                            <input
                              type="url"
                              value={lesson.videoUrl}
                              onChange={(e) => updateLesson(module.id, lesson.id, "videoUrl", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="https://youtube.com/..."
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block mb-1 text-sm font-medium text-gray-700">Lesson Description</label>
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
                    <p className="text-sm italic text-gray-500">No lessons in this module yet. Add a lesson above.</p>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
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
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">My Courses</h4>
        </div>

        <div className="divide-y divide-gray-200">
          {courses.map((course) => (
            <div key={course._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
<<<<<<< HEAD
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {course.thumbnail ? (
                      course.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i) ? (
                        <video
                          src={course.thumbnail}
                          className="h-full w-full object-cover"
                          muted
                          controls={false}
                          preload="metadata"
                          onError={(e) => {
                            console.error('Video load error for course:', course.title, course.thumbnail);
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full w-full"><svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>';
                          }}
                        />
                      ) : (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error('Image load error for course:', course.title, course.thumbnail);
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMzIgMjBDMjYuNDggMjAgMjIgMjQuNDggMjIgMzBDMjIgMzUuNTIgMjYuNDggNDAgMzIgNDBDMzcuNTIgNDAgNDIgMzUuNTIgNDIgMzBDNDIgMjQuNDggMzcuNTIgMjAgMzIgMjBaTTMyIDM2QzI4LjY5IDM2IDI2IDMzLjMxIDI2IDMwQzI2IDI2LjY5IDI4LjY5IDI0IDMyIDI0QzM1LjMxIDI0IDM4IDI2LjY5IDM4IDMwQzM4IDMzLjMxIDM1LjMxIDM2IDMyIDM2WiIgZmlsbD0iIzlDQTNCMCIvPjwvc3ZnPg==';
                          }}
                        />
                      )
                    ) : (
                      <ImageIcon className="h-8 w-8 text-gray-400" />
=======
                  <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-100 rounded-lg">
                    {course.thumbnail && course.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i) ? (
                      <video
                        src={course.thumbnail}
                        className="object-cover w-full h-full"
                        muted
                        controls={false}
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="object-cover w-full h-full"
                      />
>>>>>>> b7c03ac8588b8d2f5150cf548d2a9fd30d283536
                    )}
                  </div>
                  <div>
                    <h5 className="text-lg font-medium text-gray-900">{course.title}</h5>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-gray-500">Category: {course.category}</span>
                      <span className="text-sm text-gray-500">Price: ₹{course.price}</span>
                      <span className="text-sm text-gray-500">Enrollments: {course.enrollments}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(`/courses/${course._id}`, "_blank")}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="View Course"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => startEditing(course)} 
                    className="p-2 text-green-600 hover:text-green-800"
                    title="Edit Course"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={() => deleteCourse(course._id)} 
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
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