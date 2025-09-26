"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Users, BookOpen, TrendingUp, Download } from "lucide-react"
import { IndianRupee } from "lucide-react"
import InstructorCourseForm from "../Components/InstructorCourseForm"
import InstructorReportsChart from "../Components/InstructorReportsChart"

// Custom Indian Rupee Icon component
const IndianRupeeIcon = (props) => (
  <IndianRupee {...props} />
)

const InstructorDashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)

  useEffect(() => {
    fetchInstructorStats()
    fetchCourses()
  }, [])

  useEffect(() => {
    if (activeTab === "courses") {
      fetchCourses()
    } else if (activeTab === "students") {
      fetchStudents()
    } else if (activeTab === "reports") {
      fetchReports()
    }
  }, [activeTab])

  const fetchCourses = async () => {
    setCoursesLoading(true)
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
      setCoursesLoading(false)
    }
  }

  const fetchStudents = async () => {
    setStudentsLoading(true)
    try {
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
      setStudentsLoading(false)
    }
  }

  const fetchReports = async () => {
    setReportsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:2000/api/instructor/reports/revenue", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setReportsLoading(false)
    }
  }

  const deleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/instructor/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setCourses(courses.filter(course => course._id !== courseId))
      } else {
        alert("Failed to delete course")
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      alert("Error deleting course")
    }
  }

  const editCourse = (courseId) => {
    alert(`Edit functionality for course ${courseId} will be implemented here.`)
    // TODO: Implement edit course modal or form
  }

  const createCourse = () => {
    alert("Create course functionality will be implemented here.")
    // TODO: Implement create course modal or form
  }

  const fetchInstructorStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:2000/api/instructor/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching instructor stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "bg-blue-500",
      change: "+5%",
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      icon: Users,
      color: "bg-green-500",
      change: "+12%",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupeeIcon,
      color: "bg-purple-500",
      change: "+23%",
    },
    {
      title: "Active Enrollments",
      value: stats.activeEnrollments,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "+15%",
    },
  ]

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "My Courses" },
    { id: "students", label: "Students" },
    { id: "reports", label: "Reports" },
    { id: "profile", label: "Profile" },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-gray-600">Manage your courses and students</p>
            </div>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center ml-4`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InstructorReportsChart type="revenue" />
              <InstructorReportsChart type="enrollments" />
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <InstructorCourseForm />
        )}

        {activeTab === "students" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Students</h3>

            {studentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : students.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No students enrolled yet.</p>
            ) : (
              <div className="space-y-4">
                {students.map((enrollment) => (
                  <div key={enrollment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{enrollment.user.name}</h4>
                        <p className="text-gray-600 mt-1">{enrollment.user.email}</p>
                        <p className="text-gray-600 mt-1">Course: {enrollment.course.title}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}</span>
                          <span>Status: {enrollment.status}</span>
                        </div>
                      </div>
                      {/* <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                          View Progress
                        </button>
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                          Message
                        </button>
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports</h3>

            {reportsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : reports.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No reports data available.</p>
            ) : (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-900 mb-2">Revenue Reports</h4>
                {reports.map((report, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-900 font-medium">
                          {new Date(report._id.year, report._id.month - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-gray-600">Revenue: ₹{report.revenue}</p>
                        <p className="text-gray-600">Transactions: {report.count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Management</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={user?.name || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={user?.email || ""}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Account Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InstructorDashboardPage
