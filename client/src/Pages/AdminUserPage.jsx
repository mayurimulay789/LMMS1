"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Users, UserCheck, UserX } from "lucide-react"
import AdminUserTable from "../Components/AdminUserTable"

const AdminUsersPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)

  const stats = [
    {
      title: "Total Users",
      value: "12,543",
      icon: <Users className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
      change: "+12%",
    },
    {
      title: "Active Users",
      value: "11,892",
      icon: <UserCheck className="w-8 h-8 text-green-600" />,
      color: "bg-green-50 border-green-200",
      change: "+8%",
    },
    {
      title: "Suspended Users",
      value: "651",
      icon: <UserX className="w-8 h-8 text-red-600" />,
      color: "bg-red-50 border-red-200",
      change: "-3%",
    },
  ]

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-gray-600">Manage users, roles, and permissions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className={`bg-white rounded-lg shadow-sm border-2 ${stat.color} p-6 hover:shadow-md transition-shadow`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-sm text-green-600">{stat.change} vs last month</p>
                </div>
                <div className="flex-shrink-0">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* User Table */}
        <AdminUserTable />
      </div>
    </div>
  )
}

export default AdminUsersPage
