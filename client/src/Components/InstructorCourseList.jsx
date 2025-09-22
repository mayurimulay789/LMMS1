"use client"

import { useState, useEffect } from "react"
import { Edit, Plus, Trash2 } from "lucide-react"
import InstructorCourseForm from "./InstructorCourseForm"

const InstructorCourseList = () => {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:2000/api/instructor/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/instructor/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        setCourses((prev) => prev.filter((c) => c._id !== courseId))
      }
    } catch (error) {
      console.error("Error deleting course:", error)
    }
  }

  const handleCreateCourse = () => {
    setEditingCourse(null)
    setShowForm(true)
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setShowForm(true)
  }

  const handleFormSuccess = (savedCourse) => {
    if (editingCourse) {
      // update existing
      setCourses((prev) => prev.map((c) => (c._id === savedCourse._id ? savedCourse : c)))
    } else {
      // add new
      setCourses((prev) => [...prev, savedCourse])
    }
    setShowForm(false)
    setEditingCourse(null)
  }

  const filteredCourses = courses.filter((course) => {
    const matchesStatus = filterStatus === "all" || course.status === filterStatus
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p>Loading courses...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-gray-900">My Courses</h3>
        <button
          onClick={handleCreateCourse}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-lg w-64"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredCourses.length === 0 ? (
          <p className="p-6 text-gray-600">No courses found.</p>
        ) : (
          <div className="divide-y">
            {filteredCourses.map((course) => (
              <div key={course._id} className="p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditCourse(course)} className="text-green-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteCourse(course._id)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
            <button
              onClick={() => {
                setShowForm(false)
                setEditingCourse(null)
              }}
              className="absolute top-3 right-3 text-gray-600"
            >
              ✕
            </button>
            <InstructorCourseForm
              mode={editingCourse ? "edit" : "create"}
              course={editingCourse}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default InstructorCourseList
