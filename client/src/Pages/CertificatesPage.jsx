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

      // Ensure each certificate has a completion value
      const withCompletion = data.map((cert) => ({
        ...cert,
        completion: cert.completion || 0,
      }))

      setCertificates(withCompletion)
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
        if (certificate.completion === 100) {
          await handleDownload(certificate.certificateId)
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
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
    const unlocked = certificates.filter((cert) => cert.completion === 100)
    const averageScore = unlocked.reduce((sum, cert) => sum + (cert.finalScore || 0), 0) / (unlocked.length || 1)
    const topGrades = unlocked.filter((cert) => ["A+", "A", "A-"].includes(cert.grade)).length

    return { totalCertificates, thisYear, averageScore: Math.round(averageScore), topGrades }
  }

  const stats = getCertificateStats()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Award className="h-8 w-8 text-primary-600" />
                <span>My Certificates</span>
              </h1>
              <p className="text-gray-600 mt-2">View and manage your earned certificates</p>
            </div>
            {certificates.some((c) => c.completion === 100) && (
              <button onClick={downloadAllCertificates} className="btn btn-primary flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download All</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        {certificates.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="stat-card flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">Total Certificates</p>
                <p className="text-lg font-bold">{stats.totalCertificates}</p>
              </div>
              <Trophy className="h-8 w-8 text-primary-600" />
            </div>
            <div className="stat-card flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">This Year</p>
                <p className="text-lg font-bold">{stats.thisYear}</p>
              </div>
              <Calendar className="h-8 w-8 text-success-600" />
            </div>
            <div className="stat-card flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-lg font-bold">{stats.averageScore}%</p>
              </div>
              <BookOpen className="h-8 w-8 text-warning-600" />
            </div>
            <div className="stat-card flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
              <div>
                <p className="text-sm text-gray-500">Top Grades</p>
                <p className="text-lg font-bold">{stats.topGrades}</p>
              </div>
              <Award className="h-8 w-8 text-error-600" />
            </div>
          </motion.div>
        )}

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <motion.div className="text-center py-16" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 mb-6">Complete courses to earn your first certificate!</p>
            <a href="/courses" className="btn btn-primary">Browse Courses</a>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <CertificateCard
                key={certificate.certificateId}
                certificate={certificate}
                onDownload={handleDownload}
                onShare={handleShare}
                onView={handleView}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default CertificatesPage
