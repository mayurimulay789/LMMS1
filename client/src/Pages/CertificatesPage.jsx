"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Award, Download, Search, Filter, Calendar, BookOpen, Trophy, X } from "lucide-react"
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
      const response = await fetch(`/api/certificates/download/${certificateId}`, {
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

  const handleShare = (certificate) => {
    setSelectedCertificate(certificate)
    setShareUrl(
      certificate.verificationUrl || `${window.location.origin}/verify-certificate/${certificate.certificateId}`,
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
        // Add small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      toast.dismiss()
      toast.success("All certificates downloaded!")
    } catch (error) {
      toast.dismiss()
      toast.error("Failed to download all certificates")
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
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="w-1/4 h-8 mb-6 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-6 bg-white rounded-lg shadow-sm">
                  <div className="w-3/4 h-4 mb-4 bg-gray-200 rounded"></div>
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
              <button onClick={downloadAllCertificates} className="flex items-center space-x-2 btn btn-primary">
                <Download className="w-4 h-4" />
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
            className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4"
          >
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Total Certificates</p>
                  <p className="stat-value">{stats.totalCertificates}</p>
                </div>
                <Trophy className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">This Year</p>
                  <p className="stat-value">{stats.thisYear}</p>
                </div>
                <Calendar className="w-8 h-8 text-success-600" />
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Average Score</p>
                  <p className="stat-value">{stats.averageScore}%</p>
                </div>
                <BookOpen className="w-8 h-8 text-warning-600" />
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Top Grades</p>
                  <p className="stat-value">{stats.topGrades}</p>
                </div>
                <Award className="w-8 h-8 text-error-600" />
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
            className="p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="text"
                    placeholder="Search certificates by course name or instructor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-auto input">
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
            className="py-16 text-center"
          >
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Certificates Yet</h3>
            <p className="mb-6 text-gray-600">Complete courses to earn your first certificate!</p>
            <a href="/courses" className="btn btn-primary">
              Browse Courses
            </a>
          </motion.div>
        ) : filteredCertificates.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Certificates Found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md p-6 bg-white rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Share Certificate</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="mb-2 text-sm text-gray-600">Certificate for:</p>
                <p className="font-medium text-gray-900">{selectedCertificate.courseName}</p>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">Verification Link</label>
                <div className="flex">
                  <input type="text" value={shareUrl} readOnly className="flex-1 rounded-r-none input" />
                  <button
                    onClick={() => copyToClipboard(shareUrl)}
                    className="border-l-0 rounded-l-none btn btn-outline"
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
                    className="flex items-center justify-center space-x-2 btn btn-outline"
                  >
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => shareToSocial("twitter", selectedCertificate)}
                    className="flex items-center justify-center space-x-2 btn btn-outline"
                  >
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => shareToSocial("facebook", selectedCertificate)}
                    className="flex items-center justify-center space-x-2 btn btn-outline"
                  >
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => shareToSocial("email", selectedCertificate)}
                    className="flex items-center justify-center space-x-2 btn btn-outline"
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
