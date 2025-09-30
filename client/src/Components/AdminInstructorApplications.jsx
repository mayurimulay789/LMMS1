"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, XCircle, Eye, Mail } from "lucide-react"

const AdminInstructorApplications = () => {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:2000/api/admin/instructor-applications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (applicationId) => {
    if (!confirm("Are you sure you want to approve this application?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/admin/instructor-applications/${applicationId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        alert("Application approved successfully!")
        fetchApplications() // Refresh the list
      } else {
        alert("Failed to approve application")
      }
    } catch (error) {
      console.error("Error approving application:", error)
      alert("Error approving application")
    }
  }

  const handleReject = async (applicationId) => {
    if (!confirm("Are you sure you want to reject this application?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:2000/api/admin/instructor-applications/${applicationId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        alert("Application rejected successfully!")
        fetchApplications() // Refresh the list
      } else {
        alert("Failed to reject application")
      }
    } catch (error) {
      console.error("Error rejecting application:", error)
      alert("Error rejecting application")
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Instructor Applications</h3>
        <p className="text-sm text-gray-600 mt-1">Review and manage instructor applications</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qualifications
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {application.applicantName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{application.applicantName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{application.email}</div>
                  <div className="text-sm text-gray-500">{application.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={application.experience}>
                    {application.experience.substring(0, 50)}{application.experience.length > 50 ? "..." : ""}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={application.qualifications}>
                    {application.qualifications.substring(0, 50)}{application.qualifications.length > 50 ? "..." : ""}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(application.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApprove(application._id)}
                      className="text-green-600 hover:text-green-900"
                      title="Approve Application"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleReject(application._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Reject Application"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => alert(`Motivation: ${application.motivation}`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Motivation"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {applications.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
          <p className="mt-1 text-sm text-gray-500">There are no pending instructor applications.</p>
        </div>
      )}

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {applications.length} application(s)
        </div>
      </div>
    </div>
  )
}

export default AdminInstructorApplications
