"use client"

import { useState } from "react"
import { Download, Award, Calendar, User, BookOpen } from "lucide-react"
import { motion } from "framer-motion"

const CertificateCard = ({ certificate, onDownload }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      await onDownload(certificate.certificateId)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getGradeColor = (grade) => {
    const gradeColors = {
      "A+": "text-green-600 bg-green-100",
      A: "text-green-600 bg-green-100",
      "A-": "text-green-600 bg-green-100",
      "B+": "text-blue-600 bg-blue-100",
      B: "text-blue-600 bg-blue-100",
      "B-": "text-blue-600 bg-blue-100",
      "C+": "text-yellow-600 bg-yellow-100",
      C: "text-yellow-600 bg-yellow-100",
      "C-": "text-yellow-600 bg-yellow-100",
      D: "text-orange-600 bg-orange-100",
      F: "text-red-600 bg-red-100",
    }
    return gradeColors[grade] || "text-gray-600 bg-gray-100"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="certificate-card group"
    >
      {/* Certificate Preview */}
      <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-secondary-100/20" />
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-primary-600" />
              <span className="certificate-badge">
                <span className="mr-1">🏆</span>
                Certificate
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {certificate.grade && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(certificate.grade)}`}>
                  {certificate.grade}
                </span>
              )}
              {certificate.finalScore && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {certificate.finalScore}%
                </span>
              )}
            </div>
          </div>

          {/* Course Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{certificate.courseName}</h3>

          {/* Certificate Details */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Instructor: {certificate.instructor}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Completed: {formatDate(certificate.completionDate)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Certificate ID: {certificate.certificateNumber || certificate.certificateId}</span>
            </div>
          </div>

          {/* Skills */}
          {certificate.skills && certificate.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Skills Acquired:</p>
              <div className="flex flex-wrap gap-1">
                {certificate.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
                {certificate.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{certificate.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center justify-center w-full">
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="btn btn-sm btn-primary flex items-center space-x-1 w-full justify-center"
          >
            {isLoading ? <div className="spinner h-4 w-4" /> : <Download className="h-4 w-4" />}
            <span>{isLoading ? "Downloading..." : "Download"}</span>
          </button>
        </div>

        {/* Issue Date */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Issued on {formatDate(certificate.issueDate || certificate.createdAt)}
          </p>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all duration-300 rounded-lg pointer-events-none" />
    </motion.div>
  )
}

export default CertificateCard
