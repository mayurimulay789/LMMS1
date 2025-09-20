"use client"

import { useState, useEffect } from "react"
import { Search, Mail, MessageSquare, Eye, UserCheck, UserX } from "lucide-react"

const InstructorStudentTable = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCourse, setFilterCourse] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchStudents()
    fetchInstructorCourses()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, filterCourse])

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:2000/api/instructor/students", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInstructorCourses = async () => {
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
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterCourse !== "all") {
      filtered = filtered.filter((student) => student.courseId === filterCourse)
    }

    setFilteredStudents(filtered)
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-100 text-green-800"
    if (progress >= 50) return "bg-blue-100 text-blue-800"
    if (progress >= 25) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>

          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {student.name?.charAt(0).toUpperCase() || "S"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{student.email || "No email"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.courseTitle || "Unknown Course"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${student.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{student.progress || 0}% complete</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : "No activity"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgressColor(
                        student.progress || 0,
                      )}`}
                    >
                      {student.progress >= 80 ? "Completed" : student.progress >= 50 ? "In Progress" : "Just Started"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`/instructor/students/${student._id}`, "_blank")}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View Student"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log(`Message student ${student._id}`)}
                        className="text-purple-600 hover:text-purple-900 p-1"
                        title="Send Message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log(`Email student ${student._id}`)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Send Email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {filteredStudents.length} of {students.length} students
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorStudentTable