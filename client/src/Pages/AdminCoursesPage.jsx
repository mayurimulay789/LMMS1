"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Plus, BookOpen, Eye, Edit, Trash2, Search } from "lucide-react"
import { fetchAdminCourses } from "../store/slices/adminSlice"
import AdminCourseForm from "../Components/AdminCourseForm"

const AdminCoursesPage = () => {
  const dispatch = useDispatch()
  const { courses, isLoading } = useSelector((state) => state.admin)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchAdminCourses({ search: searchTerm, category: categoryFilter !== "all" ? categoryFilter : undefined }))
  }, [dispatch, searchTerm, categoryFilter])

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const stats = [
    {
      title: "Total Courses",
      value: courses.length.toLocaleString(),
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Published",
      value: courses.filter((c) => c.status === "published").length.toLocaleString(),
      icon: <Eye className="w-8 h-8 text-green-600" />,
      color: "bg-green-50 border-green-200",
    },
    {
      title: "Draft",
      value: courses.filter((c) => c.status === "draft").length.toLocaleString(),
      icon: <Edit className="w-8 h-8 text-yellow-600" />,
      color: "bg-yellow-50 border-yellow-200",
    },
  ]

  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      // Implement delete functionality
      console.log("Deleting course:", courseId)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="w-1/4 h-8 mb-8 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="bg-gray-300 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
              <p className="mt-2 text-gray-600">Create and manage courses</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Course
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
                </div>
                <div className="flex-shrink-0">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <div className="p-6 mb-8 bg-white rounded-lg shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              className="overflow-hidden transition-shadow bg-white rounded-lg shadow-sm hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              {course.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="object-cover w-full h-48"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded">
                    {course.category}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      course.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{course.title}</h3>
                <p className="mb-2 text-gray-600">by {course.instructor}</p>
                <p className="mb-4 text-sm text-gray-500 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-gray-900">₹{course.price}</div>
                  <div className="text-sm text-gray-500">{course.students || 0} students</div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingCourse(course)}
                    className="flex items-center justify-center flex-1 px-3 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button className="flex items-center justify-center px-3 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="flex items-center justify-center px-3 py-2 text-red-700 transition-colors border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modals */}
        {showCreateModal && <AdminCourseForm onClose={() => setShowCreateModal(false)} />}
        {editingCourse && <AdminCourseForm courseId={editingCourse.id} onClose={() => setEditingCourse(null)} />}
      </div>
    </div>
  )
}

export default AdminCoursesPage