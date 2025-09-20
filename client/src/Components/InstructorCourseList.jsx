"use client"

import { useState, useEffect } from "react"
import { Eye, Edit, BarChart3, Plus, ImageIcon } from "lucide-react"

const InstructorCourseList = () => {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:2000/api/instructor/courses", {
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
    } finally {
      setIsLoading(false)
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
        <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
        <button
          onClick={() => window.open("/instructor/courses/create", "_self")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">Course List</h4>
        </div>

        <div className="divide-y divide-gray-200">
          {courses.map((course) => (
            <div key={course._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <ImageIcon
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                  <div>
                    <h5 className="text-lg font-medium text-gray-900">{course.title}</h5>
                    <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">Students: {course.enrollments || 0}</span>
                      <span className="text-sm text-gray-500">Rating: {course.rating || 0}/5</span>
                      <span className="text-sm text-gray-500">Revenue: ${course.revenue || 0}</span>
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
                    title="View Course"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => window.open(`/instructor/courses/${course._id}/edit`, "_self")}
                    className="text-green-600 hover:text-green-800 p-2"
                    title="Edit Course"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => window.open(`/instructor/courses/${course._id}/analytics`, "_self")}
                    className="text-purple-600 hover:text-purple-800 p-2"
                    title="View Analytics"
                  >
                    <BarChart3 className="h-4 w-4" />
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

export default InstructorCourseList