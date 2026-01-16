"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Award, Download, Search, Filter, Calendar, BookOpen, Trophy, X, Menu, ChevronDown } from "lucide-react"
import toast from "react-hot-toast"
import { createApiUrl } from "../config/api"
import CertificateCard from "../Components/CertificateCard"

const CertificatesPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [certificates, setCertificates] = useState([])
  const [filteredCertificates, setFilteredCertificates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)

  useEffect(() => {
    fetchCertificates()
  }, [])

  useEffect(() => {
    filterAndSortCertificates()
  }, [certificates, searchTerm, sortBy])

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      const url = createApiUrl("certificates/me")
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch certificates")
      }

      const data = await response.json()
      setCertificates(data)
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast.error("Failed to load certificates")
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortCertificates = () => {
    const filtered = certificates.filter(
      (cert) =>
        cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.instructor.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort certificates
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.issueDate) - new Date(b.issueDate))
        break
      case "course-name":
        filtered.sort((a, b) => a.courseName.localeCompare(b.courseName))
        break
      case "instructor":
        filtered.sort((a, b) => a.instructor.localeCompare(b.instructor))
        break
      case "grade":
        filtered.sort((a, b) => {
          const gradeOrder = { "A+": 10, A: 9, "A-": 8, "B+": 7, B: 6, "B-": 5, "C+": 4, C: 3, "C-": 2, D: 1, F: 0 }
          return (gradeOrder[b.grade] || 0) - (gradeOrder[a.grade] || 0)
        })
        break
      default:
        break
    }

    setFilteredCertificates(filtered)
  }

  const handleDownload = async (certificateId) => {
    try {
      const downloadUrl = createApiUrl(`certificates/download/${certificateId}`)
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to download certificate")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `certificate-${certificateId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Certificate downloaded successfully!")
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to download certificate")
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Link copied to clipboard!")
    } catch (error) {
      console.error("Copy failed:", error)
      toast.error("Failed to copy link")
    }
  }

  const shareToSocial = (platform, certificate) => {
    const text = `I just earned a certificate in ${certificate.courseName}! 🎓`
    const url = `${window.location.origin}/verify-certificate/${certificate.certificateId}`

    let shareLink = ""
    switch (platform) {
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
        break
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "email":
        shareLink = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`Check out my certificate: ${url}`)}`
        break
      default:
        return
    }

    window.open(shareLink, "_blank", "width=600,height=400")
  }

  const downloadAllCertificates = async () => {
    try {
      setIsDownloadingAll(true)
      toast.loading("Preparing download...")

      for (const certificate of certificates) {
        await handleDownload(certificate.certificateId)
        // Add small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      toast.dismiss()
      toast.success("All certificates downloaded!")
    } catch (error) {
      toast.dismiss()
      toast.error("Failed to download all certificates")
    } finally {
      setIsDownloadingAll(false)
    }
  }

  const getCertificateStats = () => {
    const totalCertificates = certificates.length
    const thisYear = certificates.filter(
      (cert) => new Date(cert.issueDate).getFullYear() === new Date().getFullYear(),
    ).length
    const averageScore = certificates.reduce((sum, cert) => sum + (cert.finalScore || 0), 0) / totalCertificates || 0
    const topGrades = certificates.filter((cert) => ["A+", "A", "A-"].includes(cert.grade)).length

    return { totalCertificates, thisYear, averageScore: Math.round(averageScore), topGrades }
  }

  const stats = getCertificateStats()

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 md:py-8 bg-gray-50">
        <div className="px-3 mx-auto max-w-7xl sm:px-4 lg:px-8">
          <div className="animate-pulse">
            <div className="w-1/2 h-6 mb-4 bg-gray-200 rounded md:w-1/4 md:h-8"></div>
            <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-lg shadow-sm md:p-6">
                  <div className="w-3/4 h-3 mb-3 bg-gray-200 rounded md:w-full md:h-4 md:mb-4"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded md:w-full md:h-6"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-lg shadow-sm md:p-6">
                  <div className="w-3/4 h-4 mb-3 bg-gray-200 rounded md:mb-4"></div>
                  <div className="w-1/2 h-3 mb-2 bg-gray-200 rounded"></div>
                  <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-4 bg-gray-50 md:py-8">
      <div className="px-3 mx-auto max-w-7xl sm:px-4 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 md:text-3xl md:gap-3">
                  <Award className="w-6 h-6 text-primary-600 md:w-8 md:h-8" />
                  <span>My Certificates</span>
                </h1>
                <p className="mt-1 text-sm text-gray-600 md:mt-2 md:text-base">View and manage your earned certificates</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 md:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            {certificates.length > 0 && (
              <button
                onClick={downloadAllCertificates}
                disabled={isDownloadingAll}
                className={`flex items-center justify-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed w-full md:w-auto ${mobileMenuOpen ? 'flex' : 'hidden md:flex'}`}
              >
                <Download className="w-4 h-4" />
                <span>{isDownloadingAll ? 'Downloading...' : 'Download All'}</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 md:gap-6 md:mb-8"
          >
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 md:text-sm">Total Certificates</p>
                  <p className="mt-1 text-xl font-bold text-gray-900 md:text-2xl">{stats.totalCertificates}</p>
                </div>
                <Trophy className="w-6 h-6 text-blue-600 md:w-8 md:h-8" />
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 md:text-sm">This Year</p>
                  <p className="mt-1 text-xl font-bold text-gray-900 md:text-2xl">{stats.thisYear}</p>
                </div>
                <Calendar className="w-6 h-6 text-green-600 md:w-8 md:h-8" />
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 md:text-sm">Average Score</p>
                  <p className="mt-1 text-xl font-bold text-gray-900 md:text-2xl">{stats.averageScore}%</p>
                </div>
                <BookOpen className="w-6 h-6 text-yellow-600 md:w-8 md:h-8" />
              </div>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 md:text-sm">Top Grades</p>
                  <p className="mt-1 text-xl font-bold text-gray-900 md:text-2xl">{stats.topGrades}</p>
                </div>
                <Award className="w-6 h-6 text-red-600 md:w-8 md:h-8" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Search and Filter */}
        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm md:p-6 md:mb-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:text-base"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8 md:text-base"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="course-name">Course Name</option>
                      <option value="instructor">Instructor</option>
                      <option value="grade">Grade</option>
                    </select>
                    <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-3 top-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="py-12 text-center md:py-16"
          >
            <Award className="w-12 h-12 mx-auto mb-3 text-gray-300 md:w-16 md:h-16 md:mb-4" />
            <h3 className="mb-1 text-lg font-semibold text-gray-900 md:text-xl md:mb-2">No Certificates Yet</h3>
            <p className="mb-3 text-sm text-gray-600 md:mb-4 md:text-base">You haven't earned any certificates yet. Start learning to unlock your achievements!</p>
            <p className="mb-4 text-xs text-gray-500 md:mb-6 md:text-sm">Complete courses, pass assessments, and get recognized for your skills.</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center md:gap-3">
              <a href="/courses" className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 md:px-6 md:py-2 md:text-base">
                Browse Courses
              </a>
              <a href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 md:px-6 md:py-2 md:text-base">
                View Dashboard
              </a>
            </div>
          </motion.div>
        ) : filteredCertificates.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center md:py-16">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 md:w-16 md:h-16 md:mb-4" />
            <h3 className="mb-1 text-lg font-semibold text-gray-900 md:text-xl md:mb-2">No Certificates Found</h3>
            <p className="text-sm text-gray-600 md:text-base">Try adjusting your search terms or filters.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6"
          >
            {filteredCertificates.map((certificate, index) => (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CertificateCard
                  certificate={certificate}
                  onDownload={handleDownload}
                  onShare={() => {}}
                  onView={() => {}}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile Empty State (Alternative) */}
        {certificates.length === 0 && (
          <div className="md:hidden">
            <div className="fixed inset-x-0 bottom-0 p-4 bg-white border-t border-gray-200 shadow-lg">
              <div className="text-center">
                <h4 className="mb-2 font-medium text-gray-900">Ready to earn your first certificate?</h4>
                <p className="mb-3 text-sm text-gray-600">Start learning today and showcase your achievements</p>
                <a
                  href="/courses"
                  className="inline-block w-full px-4 py-3 font-medium text-center text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Explore Courses
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Stats Summary */}
        {certificates.length > 0 && (
          <div className="fixed inset-x-0 bottom-0 p-4 bg-white border-t border-gray-200 shadow-lg md:hidden">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{stats.totalCertificates} Certificates</p>
                <p className="text-gray-500">{stats.topGrades} Top Grades</p>
              </div>
              <button
                onClick={downloadAllCertificates}
                disabled={isDownloadingAll}
                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isDownloadingAll ? 'Downloading...' : 'Download All'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CertificatesPage