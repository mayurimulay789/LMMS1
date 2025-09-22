"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Users, BookOpen, DollarSign, TrendingUp, Download, BarChart3, MessageSquare, Clock, BarChart } from "lucide-react"
import InstructorReportsChart from "../Components/InstructorReportsChart"
import InstructorStudentTable from "../Components/InstructorStudentTable"
import InstructorCourseList from "../Components/InstructorCourseList"

const InstructorDashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingQuestions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInstructorStats()
  }, [])

  const fetchInstructorStats = async () => {
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        console.error("No token found!")
        setIsLoading(false)
        return
      }

      const response = await fetch("http://localhost:2000/api/instructor/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error("Failed to fetch instructor stats:", response.status)
      }
    } catch (error) {
      console.error("Error fetching instructor stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-blue-500",
      change: "+8%",
    },
    {
      title: "My Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "bg-green-500",
      change: "+2",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-500",
      change: "+15%",
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "+0.3",
    },
    {
      title: "Pending Questions",
      value: stats.pendingQuestions,
      icon: MessageSquare,
      color: "bg-red-500",
      change: "+5",
    },
  ]

//   const tabs = [
//     { id: "overview", label: "Overview" },
//     { id: "students", label: "Students" },
//     { id: "courses", label: "My Courses" },
//     { id: "analytics", label: "Analytics" },
//   ]

const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    { id: "communications", label: "Communications", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
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
              <p className="text-gray-600">Manage your courses and track student progress</p>
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
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
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

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New enrollment in React Masterclass</p>
                    <p className="text-xs text-gray-600">Student: john.doe@example.com - 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New question in JavaScript Basics</p>
                    <p className="text-xs text-gray-600">Student: jane.smith@example.com - 15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Course completion</p>
                    <p className="text-xs text-gray-600">Student: mike.johnson@example.com completed Node.js Advanced - 1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Live Sessions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Advanced React Patterns</p>
                    <p className="text-xs text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Tomorrow, 3:00 PM - 4:30 PM
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Start
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">JavaScript Q&A Session</p>
                    <p className="text-xs text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      In 3 days, 5:00 PM - 6:00 PM
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Prepare
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && <InstructorStudentTable />}
        {activeTab === "courses" && <InstructorCourseList />}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <InstructorReportsChart type="detailed" />
          </div>
        )}
      </div>
    </div>
  )
}

export default InstructorDashboardPage