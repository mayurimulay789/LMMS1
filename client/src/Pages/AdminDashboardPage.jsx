"use client"

import { useEffect, useState } from "react"
import { Users, BookOpen, TrendingUp, Download } from "lucide-react"
import AdminReportsChart from "../Components/AdminReportsChart"
import AdminUserManagement from "../Components/AdminUserManagement"
import AdminCourseForm from "../Components/AdminCourseForm"
import AdminInstructorApplications from "../Components/AdminInstructorApplications"
import AdminContactMessages from "../Components/AdminContactMessages"
import AdminCoupons from "../Components/AdminCoupons"


import { IndianRupee } from "lucide-react"

// Custom Indian Rupee Icon component
const IndianRupeeIcon = (props) => (
  <IndianRupee {...props} />
)

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? "http://localhost:2000/api" : "https://online.rymaacademy.cloud/api")
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
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
      console.error("Error fetching admin stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      change: stats.changes?.users || "0%",
    },
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "bg-green-500", 
      change: stats.changes?.courses || "0%",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupeeIcon,
      color: "bg-purple-500",
      change: stats.changes?.revenue || "0%", 
    },
    {
      title: "Active Enrollments",
      value: stats.activeEnrollments,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: stats.changes?.enrollments || "0%",
    },
  ]

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "courses", label: "Courses" },
    { id: "reports", label: "Reports" },
    { id: "instructor", label: "Instructor" },
    { id: "contact", label: "Contact" },
    { id: "coupons", label: "Coupons" },
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your LMS platform</p>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === "overview" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-green-600 mt-1 truncate">{stat.change} from last month</p>
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0 ml-3`}>
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <AdminReportsChart type="revenue" />
              <AdminReportsChart type="enrollments" />
            </div>
          </div>
        )}

        {activeTab === "users" && <AdminUserManagement />}
        {activeTab === "courses" && <AdminCourseForm />}
        {activeTab === "reports" && (
          <div className="space-y-6 sm:space-y-8">
            <AdminReportsChart type="detailed" />
          </div>
        )}
        {activeTab === "instructor" && <AdminInstructorApplications />}
        {activeTab === "contact" && <AdminContactMessages />}
        {activeTab === "coupons" && <AdminCoupons />}
      </div>
    </div>
  )
}

export default AdminDashboardPage