"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { BookOpen, Clock, Award, TrendingUp, Play, Download, Eye, User, Edit2 } from "lucide-react"
import { fetchUserEnrollments, fetchUserProgress, fetchUserCertificates } from "../store/slices/enrollmentSlice"
import { loadUser } from "../store/slices/authSlice"
import ProfileForm from "../Components/ProfileForm"

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { enrollments, progress, certificates, isLoading } = useSelector((state) => state.enrollment)
  const [showProfileForm, setShowProfileForm] = useState(false)

  useEffect(() => {
    if (user) {
      dispatch(fetchUserEnrollments())
      dispatch(fetchUserProgress(user.id))
      dispatch(fetchUserCertificates(user.id))
    }
  }, [dispatch, user])

  const stats = [
    {
      icon: BookOpen,
      label: "Enrolled Courses",
      value: enrollments.length,
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Clock,
      label: "Hours Learned",
      value: Object.values(progress).reduce((total, p) => total + (p.hoursSpent || 0), 0),
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Award,
      label: "Certificates",
      value: certificates.length,
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: TrendingUp,
      label: "Avg Progress",
      value: `${Math.round(
        Object.values(progress).reduce((total, p) => total + (p.completionPercentage || 0), 0) /
          (Object.keys(progress).length || 1),
      )}%`,
      color: "bg-orange-100 text-orange-600",
    },
  ]

  const handleProfileUpdate = (updatedUser) => {
    dispatch({ type: 'auth/userUpdated', payload: updatedUser })
    setShowProfileForm(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-64 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="bg-gray-300 h-12 w-12 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-6 w-16 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Continue your learning journey and track your progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Sidebar Sections Adjusted */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personal Information & Profile Form */}
          {showProfileForm ? (
            <ProfileForm
              user={user}
              onSave={handleProfileUpdate}
              onCancel={() => setShowProfileForm(false)}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-md min-h-[80px]">
                  {user?.profile?.bio || "No bio added yet. Click edit to add your bio."}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {user?.profile?.website && (
                  <div>
                    <span className="font-medium text-gray-700">Website: </span>
                    <a
                      href={user.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {user.profile.website}
                    </a>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Role: </span>
                  <span className="text-gray-600 capitalize">{user?.role}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email: </span>
                  <span className="text-gray-600">{user?.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <p className="text-gray-900">Completed "React Hooks"</p>
                  <p className="text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-sm">
                  <p className="text-gray-900">Started "Advanced JavaScript"</p>
                  <p className="text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="text-sm">
                  <p className="text-gray-900">Earned certificate</p>
                  <p className="text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Certificates */}
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Certificates</h3>
              <Link to="/certificates" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All →
              </Link>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-4">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No certificates earned yet</p>
                <p className="text-gray-500 text-xs">Complete courses to earn certificates</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.slice(0, 3).map((certificate) => (
                  <div key={certificate._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{certificate.courseName}</p>
                      <p className="text-xs text-gray-600">
                        Earned on {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {certificate.grade}
                        </span>
                        {certificate.finalScore && (
                          <span className="text-xs text-gray-600">{certificate.finalScore}%</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          window.open(
                            `http://localhost:2000/api/certificates/pdf/${certificate.certificateId}`,
                            "_blank",
                          )
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = `http://localhost:2000/api/certificates/download/${certificate.certificateId}`
                          link.download = `${certificate.certificateNumber}.pdf`
                          link.click()
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
