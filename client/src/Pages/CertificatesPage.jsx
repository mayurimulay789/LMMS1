"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Award, Download, Search, Calendar, BookOpen, Trophy, X } from "lucide-react"
import toast from "react-hot-toast"
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
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchCertificates()
  }, [])

  useEffect(() => {
    filterAndSortCertificates()
  }, [certificates, searchTerm, sortBy])

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/certificates/me", {
        headers: {
          Authorization: `Bearer ${token}`,
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
        cert.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
        const gradeOrder = { "A+": 10, A: 9, "A-": 8, "B+": 7, B: 6, "B-": 5, "C+": 4, C: 3, "C-": 2, D: 1, F: 0 }
        filtered.sort((a, b) => (gradeOrder[b.grade] || 0) - (gradeOrder[a.grade] || 0))
        break
      default:
        break
    }

    setFilteredCertificates(filtered)
  }

  const handleDownload = async (certificateId) => {
    try {
      const response = await fetch(`/api/certificates/download/${certificateId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Failed to download certificate")

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

  const handleShare = (certificate) => {
    setSelectedCertificate(certificate)
    setShareUrl(
      certificate.verificationUrl || `${window.location.origin}/verify-certificate/${certificate.certificateId}`
    )
    setShowShareModal(true)
  }

  const handleView = (certificate) => {
    window.open(`/api/certificates/pdf/${certificate.certificateId}`, "_blank")
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
    const url = shareUrl

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
      toast.loading("Preparing download...")
      for (const certificate of certificates) {
        await handleDownload(certificate.certificateId)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      toast.dismiss()
      toast.success("All unlocked certificates downloaded!")
    } catch (error) {
      toast.dismiss()
      toast.error("Failed to download all certificates")
    }
  }

  const getCertificateStats = () => {
    const totalCertificates = certificates.length
    const thisYear = certificates.filter(
      (cert) => new Date(cert.issueDate).getFullYear() === new Date().getFullYear()
    ).length
    const averageScore = certificates.reduce((sum, cert) => sum + (cert.finalScore || 0), 0) / totalCertificates || 0
    const topGrades = certificates.filter((cert) => ["A+", "A", "A-"].includes(cert.grade)).length
    return { totalCertificates, thisYear, averageScore: Math.round(averageScore), topGrades }
  }

  const stats = getCertificateStats()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center space-x-3 text-3xl font-bold text-gray-900">
                <Award className="w-8 h-8 text-primary-600" />
                <span>My Certificates</span>
              </h1>
              <p className="mt-2 text-gray-600">View and manage your earned certificates</p>
            </div>
            {certificates.length > 0 && (
              <button onClick={downloadAllCertificates} className="btn btn-primary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download All</span>
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
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Total Certificates</p>
                  <p className="stat-value">{stats.totalCertificates}</p>
                </div>
                <Trophy className="h-8 w-8 text-primary-600" />
              </div>
              <Trophy className="h-8 w-8 text-primary-600" />
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">This Year</p>
                  <p className="stat-value">{stats.thisYear}</p>
                </div>
                <Calendar className="h-8 w-8 text-success-600" />
              </div>
              <Calendar className="h-8 w-8 text-success-600" />
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Average Score</p>
                  <p className="stat-value">{stats.averageScore}%</p>
                </div>
                <BookOpen className="h-8 w-8 text-warning-600" />
              </div>
              <BookOpen className="h-8 w-8 text-warning-600" />
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Top Grades</p>
                  <p className="stat-value">{stats.topGrades}</p>
                </div>
                <Award className="h-8 w-8 text-error-600" />
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
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search certificates by course name or instructor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input w-auto">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="course-name">Course Name</option>
                    <option value="instructor">Instructor</option>
                    <option value="grade">Grade</option>
                  </select>
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
            className="text-center py-16"
          >
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 mb-6">Complete courses to earn your first certificate!</p>
            <a href="/courses" className="btn btn-primary">
              Browse Courses
            </a>
          </motion.div>
        ) : filteredCertificates.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCertificates.map((certificate, index) => (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CertificateCard
                  certificate={certificate}
                  onDownload={handleDownload}
                  onShare={handleShare}
                  onView={handleView}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Share Modal */}
        {showShareModal && selectedCertificate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Certificate</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Certificate for:</p>
                <p className="font-medium text-gray-900">{selectedCertificate.courseName}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Link</label>
                <div className="flex">
                  <input type="text" value={shareUrl} readOnly className="input flex-1 rounded-r-none" />
                  <button
                    onClick={() => copyToClipboard(shareUrl)}
                    className="btn btn-outline rounded-l-none border-l-0"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Share on social media:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => shareToSocial("linkedin", selectedCertificate)}
                    className="btn btn-outline flex items-center justify-center space-x-2"
                  >
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => shareToSocial("twitter", selectedCertificate)}
                    className="btn btn-outline flex items-center justify-center space-x-2"
                  >
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => shareToSocial("facebook", selectedCertificate)}
                    className="btn btn-outline flex items-center justify-center space-x-2"
                  >
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareToSocial("email", selectedCertificate)}
                    className="btn btn-outline flex items-center justify-center space-x-2"
                  >
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CertificatesPage
