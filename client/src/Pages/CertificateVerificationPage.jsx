"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Shield,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  ExternalLink,
  Search,
  Download,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"

const CertificateVerificationPage = () => {
  const { certificateId } = useParams()
  const [searchParams] = useSearchParams()
  const [verificationCode, setVerificationCode] = useState(certificateId || searchParams.get("code") || "")
  const [certificate, setCertificate] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(null) // 'valid', 'invalid', 'error'
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (certificateId) {
      handleVerification(certificateId)
    }
  }, [certificateId])

  const handleVerification = async (code = verificationCode) => {
    if (!code.trim()) {
      toast.error("Please enter a certificate ID")
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    setVerificationStatus(null)
    setCertificate(null)

    try {
      const response = await fetch(`/api/certificates/verify/${code}`)
      const data = await response.json()

      if (response.ok && data.valid) {
        setVerificationStatus("valid")
        setCertificate(data.certificate)
        toast.success("Certificate verified successfully!")
      } else {
        setVerificationStatus("invalid")
        toast.error(data.message || "Certificate not found or invalid")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationStatus("error")
      toast.error("Failed to verify certificate. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (certificate) {
      window.open(`/api/certificates/pdf/${certificate.certificateId}`, "_blank")
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "valid":
        return <CheckCircle className="h-16 w-16 text-success-500" />
      case "invalid":
        return <XCircle className="h-16 w-16 text-error-500" />
      case "error":
        return <AlertCircle className="h-16 w-16 text-warning-500" />
      default:
        return <Shield className="h-16 w-16 text-gray-400" />
    }
  }

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case "valid":
        return {
          title: "Certificate Verified",
          description: "This certificate is authentic and valid.",
          color: "text-success-600",
        }
      case "invalid":
        return {
          title: "Certificate Invalid",
          description: "This certificate could not be verified or does not exist.",
          color: "text-error-600",
        }
      case "error":
        return {
          title: "Verification Error",
          description: "There was an error verifying this certificate. Please try again.",
          color: "text-warning-600",
        }
      default:
        return {
          title: "Certificate Verification",
          description: "Enter a certificate ID to verify its authenticity.",
          color: "text-gray-600",
        }
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Certificate Verification</h1>
          <p className="text-lg text-gray-600">Verify the authenticity of LearnHub certificates</p>
        </motion.div>

        {/* Verification Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8"
        >
          <div className="max-w-md mx-auto">
            <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
              Certificate ID
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                id="certificateId"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter certificate ID (e.g., CERT_123456_ABCD)"
                className="input flex-1"
                onKeyPress={(e) => e.key === "Enter" && handleVerification()}
              />
              <button
                onClick={() => handleVerification()}
                disabled={isLoading}
                className="btn btn-primary flex items-center space-x-2"
              >
                {isLoading ? <div className="spinner h-4 w-4" /> : <Search className="h-4 w-4" />}
                <span>{isLoading ? "Verifying..." : "Verify"}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter the certificate ID found on the certificate document</p>
          </div>
        </motion.div>

        {/* Verification Result */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            {/* Status Icon and Message */}
            <div className="text-center mb-8">
              {getStatusIcon()}
              <h2 className={`text-2xl font-bold mt-4 mb-2 ${statusMessage.color}`}>{statusMessage.title}</h2>
              <p className="text-gray-600">{statusMessage.description}</p>
            </div>

            {/* Certificate Details */}
            {verificationStatus === "valid" && certificate && (
              <div className="border-t border-gray-200 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Certificate Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Award className="h-5 w-5 text-primary-600" />
                      <span>Certificate Details</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Course Name</label>
                        <p className="text-lg font-medium text-gray-900">{certificate.courseName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Student Name</label>
                        <p className="text-lg font-medium text-gray-900">{certificate.studentName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Instructor</label>
                        <p className="text-lg font-medium text-gray-900">{certificate.instructor}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Grade</label>
                          <p className="text-lg font-medium text-gray-900">{certificate.grade || "N/A"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Final Score</label>
                          <p className="text-lg font-medium text-gray-900">
                            {certificate.finalScore ? `${certificate.finalScore}%` : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-success-600" />
                      <span>Verification Details</span>
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Certificate ID</label>
                        <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded">
                          {certificate.certificateId}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Certificate Number</label>
                        <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded">
                          {certificate.certificateNumber}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Completion Date</label>
                          <p className="text-sm text-gray-900">{formatDate(certificate.completionDate)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Issue Date</label>
                          <p className="text-sm text-gray-900">{formatDate(certificate.issueDate)}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Hours Completed</label>
                        <p className="text-sm text-gray-900">{certificate.hoursCompleted || 0} hours</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {certificate.skills && certificate.skills.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-primary-600" />
                      <span>Skills Acquired</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="btn btn-primary flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>View Certificate PDF</span>
                  </button>
                  <a
                    href={certificate.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Verification URL</span>
                  </a>
                </div>

                {/* Security Notice */}
                <div className="mt-8 p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-success-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-success-800">Verified Certificate</h4>
                      <p className="text-sm text-success-700 mt-1">
                        This certificate has been verified against our secure database and is authentic. The
                        verification was performed on {new Date().toLocaleDateString()}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invalid Certificate Message */}
            {verificationStatus === "invalid" && (
              <div className="border-t border-gray-200 pt-8">
                <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-5 w-5 text-error-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-error-800">Certificate Not Found</h4>
                      <p className="text-sm text-error-700 mt-1">
                        The certificate ID you entered could not be found in our database. Please check the ID and try
                        again, or contact support if you believe this is an error.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {verificationStatus === "error" && (
              <div className="border-t border-gray-200 pt-8">
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-warning-800">Verification Error</h4>
                      <p className="text-sm text-warning-700 mt-1">
                        There was a technical error while verifying the certificate. Please try again in a few moments
                        or contact support if the problem persists.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* How to Verify Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How to Verify a Certificate</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">1. Find Certificate ID</h3>
              <p className="text-sm text-gray-600">
                Locate the certificate ID on the certificate document or verification URL
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">2. Enter ID Above</h3>
              <p className="text-sm text-gray-600">
                Enter the certificate ID in the verification form and click verify
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">3. View Results</h3>
              <p className="text-sm text-gray-600">See the verification status and certificate details if valid</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CertificateVerificationPage
