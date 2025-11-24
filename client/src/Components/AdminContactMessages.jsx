"use client"

import { useState, useEffect } from "react"
import { Mail, Eye, MessageSquare, Clock, AlertCircle, CheckCircle, XCircle, Filter } from "lucide-react"
import { apiRequest } from "../config/api"

const AdminContactMessages = () => {
  const [contacts, setContacts] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchContacts()
  }, [filter])

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams()
      if (filter !== "all") params.append("status", filter)

      const response = await apiRequest(`contact?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = response.data
        setContacts(data.contacts || [])
        setStats(data.stats || null)
      } else {
        console.error("Failed to fetch contacts:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateContactStatus = async (contactId, status) => {
    try {
      const token = localStorage.getItem("token")
      const response = await apiRequest(`contact/${contactId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchContacts() // Refresh the list
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact(null)
        }
      } else {
        console.error("Failed to update contact status:", response.statusText)
      }
    } catch (error) {
      console.error("Error updating contact status:", error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "new":
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
      case "in-progress":
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
      case "resolved":
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
      case "closed":
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
      default:
        return <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
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
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Unread</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.unread || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">New</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.new || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.resolved || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <span className="font-medium text-gray-700 text-sm sm:text-base">Filter by Status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "new", "in-progress", "resolved", "closed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                    filter === status
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-4 sm:px-6 sm:py-4 text-center text-gray-500 text-sm">
                    No contact messages found
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{contact.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-[100px] sm:max-w-xs truncate">{contact.subject}</div>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {contact.category || "General"}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                        {getStatusIcon(contact.status)}
                        <span className="ml-1 hidden sm:inline">
                          {contact.status === "in-progress" ? "In Progress" : contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                        <span className="ml-1 sm:hidden">
                          {contact.status === "in-progress" ? "Progress" : contact.status.charAt(0).toUpperCase()}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Message"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        {contact.status === "new" && (
                          <button
                            onClick={() => updateContactStatus(contact._id, "in-progress")}
                            className="text-yellow-600 hover:text-yellow-900 px-1 py-0.5 sm:px-2 sm:py-1 text-xs rounded text-xs"
                          >
                            Start
                          </button>
                        )}
                        {contact.status === "in-progress" && (
                          <button
                            onClick={() => updateContactStatus(contact._id, "resolved")}
                            className="text-green-600 hover:text-green-900 px-1 py-0.5 sm:px-2 sm:py-1 text-xs rounded text-xs"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-10 mx-auto p-3 sm:p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-1 sm:mt-3">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Contact Message Details</h3>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900">{selectedContact.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900">{selectedContact.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900">{selectedContact.category || "General"}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedContact.status)} mt-1`}>
                      {getStatusIcon(selectedContact.status)}
                      <span className="ml-1">
                        {selectedContact.status === "in-progress" ? "In Progress" : selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                      </span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Date</label>
                    <p className="mt-1 text-xs sm:text-sm text-gray-900">{formatDate(selectedContact.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-xs sm:text-sm text-gray-900 font-medium">{selectedContact.subject}</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md whitespace-pre-wrap max-h-32 sm:max-h-48 overflow-y-auto">
                    {selectedContact.message}
                  </div>
                </div>

                {/* Status Update Actions */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t">
                  {selectedContact.status === "new" && (
                    <button
                      onClick={() => updateContactStatus(selectedContact._id, "in-progress")}
                      className="bg-yellow-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-yellow-700 transition-colors text-sm sm:text-base"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {selectedContact.status === "in-progress" && (
                    <button
                      onClick={() => updateContactStatus(selectedContact._id, "resolved")}
                      className="bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="bg-gray-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-gray-700 transition-colors text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminContactMessages