"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { BookOpen, Clock, Award, TrendingUp, Play, Download, Eye, User, Edit2, Menu } from "lucide-react"
import { fetchUserEnrollments, fetchUserProgress, fetchUserCertificates } from "../store/slices/enrollmentSlice"
import { loadUser } from "../store/slices/authSlice"
import ProfileForm from "../Components/ProfileForm"
import { createApiUrl } from "../config/api"

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { enrollments, progress, certificates, isLoading } = useSelector((state) => state.enrollment)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (user) {
      dispatch(fetchUserEnrollments())
      dispatch(fetchUserCertificates())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (enrollments.length > 0) {
      enrollments.forEach((enrollment, index) => {
        if (
          enrollment &&
          enrollment.course &&
          enrollment.course._id &&
          typeof enrollment.course._id === "string" &&
          enrollment.course._id.trim() !== "" &&
          enrollment.course._id !== "undefined" &&
          enrollment.course._id !== "null"
        ) {
          // Add delay between requests to avoid rate limiting (200ms * index)
          setTimeout(() => {
            dispatch(fetchUserProgress(enrollment.course._id));
          }, index * 200);
        } else {
          console.warn("Skipping fetchUserProgress due to invalid enrollment data:", enrollment);
        }
      });
    }
  }, [dispatch, enrollments])

  const stats = [
    {
      icon: BookOpen,
      label: "Enrolled Courses",
      value: enrollments.length,
      color: "bg-blue-100 text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: BookOpen,
      label: "My Enrollments",
      value: enrollments.length,
      color: "bg-green-100 text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Award,
      label: "Certificates",
      value: certificates.length,
      color: "bg-purple-100 text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: TrendingUp,
      label: "Avg Progress",
      value: `${Math.round(
        Object.values(progress).reduce((total, p) => total + (p.completionPercentage || 0), 0) /
          (Object.keys(progress).length || 1),
      )}%`,
      color: "bg-orange-100 text-orange-600",
      bgColor: "bg-orange-50"
    },
  ]

  const handleProfileUpdate = (updatedUser) => {
    dispatch({ type: 'auth/userUpdated', payload: updatedUser })
    setShowProfileForm(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="bg-gray-300 h-6 w-48 rounded mb-6 md:h-8 md:w-64 md:mb-8"></div>
            
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 md:gap-6 md:mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 md:p-6">
                  <div className="bg-gray-300 h-8 w-8 rounded-lg mb-3 md:h-12 md:w-12 md:mb-4"></div>
                  <div className="bg-gray-300 h-3 rounded mb-2 md:h-4"></div>
                  <div className="bg-gray-300 h-5 w-12 rounded md:h-6"></div>
                </div>
              ))}
            </div>
            
            {/* Content grid skeleton */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 md:p-6">
                  <div className="bg-gray-300 h-5 rounded mb-4 md:h-6"></div>
                  <div className="space-y-3">
                    <div className="bg-gray-300 h-16 rounded md:h-20"></div>
                    <div className="bg-gray-300 h-16 rounded md:h-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl">
              Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'there'}!</span>
            </h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 md:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600 md:text-base">Continue your learning journey and track your progress</p>
        </div>

        {/* Mobile Stats Tabs */}
        <div className="mb-4 md:hidden">
          <div className="flex overflow-x-auto gap-1 pb-2">
            {stats.map((stat, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(stat.label.toLowerCase().replace(' ', '-'))}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                  activeTab === stat.label.toLowerCase().replace(' ', '-')
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {stat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid - Desktop */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4 md:p-2 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-around ">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0 md:w-12 md:h-12 md:mb-2`}>
                  <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="flex-1 md:flex-initial">
                  <p className="text-xs text-gray-800 mb-1 md:text-sm">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 md:text-xl">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Stats Display */}
        <div className="md:hidden mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`mb-3 rounded-lg p-4 ${stat.bgColor} ${
                activeTab === stat.label.toLowerCase().replace(' ', '-') ? 'block' : 'hidden'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Personal Information & Profile Form */}
          <div className="lg:col-span-2">
            {showProfileForm ? (
              <ProfileForm
                user={user}
                onSave={handleProfileUpdate}
                onCancel={() => setShowProfileForm(false)}
                startEditing={true}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center md:text-lg">
                    <User className="h-4 w-4 mr-2 md:h-5 md:w-5" />
                    Personal Information
                  </h3>
                  <button
                    onClick={() => setShowProfileForm(true)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs md:text-sm"
                  >
                    <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2 md:text-sm">Bio</h4>
                  <div className="text-gray-600 bg-gray-50 p-3 rounded-md min-h-[80px] text-sm md:text-base">
                    {user?.profile?.bio || (
                      <span className="text-gray-500 italic">
                        No bio added yet. Click edit to add your bio.
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs md:text-sm">
                  {user?.profile?.website && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="font-medium text-gray-700">Website:</span>
                      <a
                        href={user.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate max-w-full"
                      >
                        {user.profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className="text-gray-600 capitalize">{user?.role}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-600 truncate">{user?.email}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Certificates */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 md:text-lg">Recent Certificates</h3>
              <Link 
                to="/certificates" 
                className="text-blue-600 hover:text-blue-800 text-xs font-medium md:text-sm"
              >
                View All →
              </Link>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-4">
                <Award className="h-10 w-10 text-gray-300 mx-auto mb-2 md:h-12 md:w-12" />
                <p className="text-gray-600 text-sm mb-1">No certificates earned yet</p>
                <p className="text-gray-500 text-xs">Complete courses to earn certificates</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {certificates.slice(0, 3).map((certificate, idx) => (
                  <div 
                    key={certificate._id || certificate.certificateId || certificate.id || idx} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {certificate.courseName}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Earned on {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded whitespace-nowrap">
                          {certificate.grade}
                        </span>
                        {certificate.finalScore && (
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {certificate.finalScore}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          window.open(
                            createApiUrl(`certificates/pdf/${certificate.certificateId}`),
                            "_blank",
                          )
                        }
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="View Certificate"
                      >
                        <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = createApiUrl(`certificates/download/${certificate.certificateId}`)
                          link.download = `${certificate.certificateNumber || 'certificate'}.pdf`
                          link.click()
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Download Certificate"
                      >
                        <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Mobile Bottom Bar */}
        {!showProfileForm && (
          <div className="fixed inset-x-0 bottom-0 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden">
            <div className="flex items-center justify-between">
              <div className="text-xs">
                <p className="font-medium text-gray-900">{enrollments.length} Courses</p>
                <p className="text-gray-500">{certificates.length} Certificates</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/courses"
                  className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Browse Courses
                </Link>
                <button
                  onClick={() => setShowProfileForm(true)}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary - Mobile Only */}
        <div className="md:hidden mt-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Progress Summary</h4>
            <div className="grid grid-cols-2 gap-3">
              {stats.slice(0, 2).map((stat, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${stat.color} mb-2`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
              {stats.slice(2, 4).map((stat, index) => (
                <div key={index + 2} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${stat.color} mb-2`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage