"use client"

import { useState, useEffect } from "react"
import { Plus, Upload, X, Save } from "lucide-react"
import { useSelector } from "react-redux"

const InstructorCourseForm = ({ mode, course, onSuccess }) => {
  const { user } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    level: "Beginner",
    thumbnail: null,
    instructor: user ? user.name : null,
    lessons: [],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (mode === "edit" && course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        price: course.price || "",
        level: course.level || "Beginner",
        thumbnail: course.thumbnail || null,
        instructor: user ? user.name : null,
        lessons: course.lessons || [],
      })
    }
  }, [mode, course, user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const uploadData = new FormData()
    uploadData.append("thumbnail", file)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:2000/api/upload/course-thumbnail", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      })
      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, thumbnail: data.data.url }))
      }
    } catch (err) {
      console.error("Thumbnail upload error:", err)
    }
  }

  const addLesson = () => {
    setFormData((prev) => ({
      ...prev,
      lessons: [
        ...prev.lessons,
        { id: Date.now(), title: "", description: "", videoUrl: "", order: prev.lessons.length + 1 },
      ],
    }))
  }

  const updateLesson = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.map((lesson) => (lesson.id === id ? { ...lesson, [field]: value } : lesson)),
    }))
  }

  const removeLesson = (id) => {
    setFormData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((lesson) => lesson.id !== id),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const url =
        mode === "edit"
          ? `http://localhost:2000/api/instructor/courses/${course._id}`
          : "http://localhost:2000/api/instructor/courses"

      const payload = {
        ...formData,
        lessons: formData.lessons.map((l, i) => ({ ...l, order: i + 1 })),
      }

      const response = await fetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const savedCourse = await response.json()
        onSuccess(savedCourse)
      } else {
        console.error("Failed to save course")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">
        {mode === "edit" ? "Edit Course" : "Create New Course"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            >
              <option value="">Select</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Business">Business</option>
            </select>
          </div>
        </div>

        {/* Price & Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded-lg"
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium">Course Thumbnail</label>
          <div className="flex items-center space-x-4 mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              id="thumbnail-upload"
              className="hidden"
            />
            <label
              htmlFor="thumbnail-upload"
              className="px-3 py-2 bg-gray-100 border rounded-lg cursor-pointer flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </label>
            {formData.thumbnail && (
              <img src={formData.thumbnail} alt="thumbnail" className="h-16 w-16 rounded object-cover" />
            )}
          </div>
        </div>

        {/* Lessons */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Lessons</label>
            <button
              type="button"
              onClick={addLesson}
              className="text-blue-600 text-sm flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="space-y-4">
            {formData.lessons.map((lesson, idx) => (
              <div key={lesson.id || idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium">Lesson {idx + 1}</h5>
                  <button
                    type="button"
                    onClick={() => removeLesson(lesson.id)}
                    className="text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Lesson Title"
                  value={lesson.title}
                  onChange={(e) => updateLesson(lesson.id, "title", e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg mb-2"
                />
                <input
                  type="url"
                  placeholder="Video URL"
                  value={lesson.videoUrl}
                  onChange={(e) => updateLesson(lesson.id, "videoUrl", e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg mb-2"
                />
                <textarea
                  placeholder="Lesson Description"
                  value={lesson.description}
                  onChange={(e) => updateLesson(lesson.id, "description", e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? "Saving..." : mode === "edit" ? "Update Course" : "Create Course"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default InstructorCourseForm
