import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Tag,
  X,
  Check,
  AlertTriangle,
  Calendar,
  Percent,
  Users,
  TrendingUp,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'
import api from '../config/api'

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([])
  const [filteredCoupons, setFilteredCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedCoupons, setSelectedCoupons] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [currentCoupon, setCurrentCoupon] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [couponsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // Create Coupon Form State
  const [createForm, setCreateForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumAmount: '',
    maximumDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    userUsageLimit: 1,
    isActive: true,
    isGlobal: true,
    applicableCourses: [],
    applicableCategories: [],
  })

  // Edit Coupon Form State
  const [editForm, setEditForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumAmount: '',
    maximumDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    userUsageLimit: 1,
    isActive: true,
    isGlobal: true,
    applicableCourses: [],
    applicableCategories: [],
  })

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch coupons on component mount
  useEffect(() => {
    fetchCoupons()
  }, [])

  // Filter and sort coupons
  useEffect(() => {
    filterCoupons()
  }, [coupons, searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/coupons')
      setCoupons(response.data.data || [])
      setErrorMessage('')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to fetch coupons')
      console.error('Error fetching coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCoupons = useCallback(() => {
    let filtered = [...coupons]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(coupon =>
        coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(coupon => coupon.isActive)
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(coupon => !coupon.isActive)
      } else if (statusFilter === 'expired') {
        const now = new Date()
        filtered = filtered.filter(coupon => new Date(coupon.validUntil) < now)
      }
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(coupon => coupon.discountType === typeFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'createdAt' || sortBy === 'validFrom' || sortBy === 'validUntil') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredCoupons(filtered)
  }, [coupons, searchTerm, statusFilter, typeFilter, sortBy, sortOrder])

  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target
    setCreateForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateForm = (form) => {
    if (!form.code.trim()) return 'Coupon code is required'
    if (!form.description.trim()) return 'Description is required'
    if (!form.discountValue) return 'Discount value is required'
    if (parseFloat(form.discountValue) <= 0) return 'Discount value must be greater than 0'
    if (form.discountType === 'percentage' && parseFloat(form.discountValue) > 100) {
      return 'Percentage discount cannot exceed 100%'
    }
    if (!form.validFrom) return 'Valid from date is required'
    if (!form.validUntil) return 'Valid until date is required'
    if (new Date(form.validUntil) <= new Date(form.validFrom)) {
      return 'Valid until date must be after valid from date'
    }
    return ''
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    const validationError = validateForm(createForm)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      const formData = {
        ...createForm,
        discountValue: parseFloat(createForm.discountValue),
        minimumAmount: parseFloat(createForm.minimumAmount) || 0,
        maximumDiscount: createForm.maximumDiscount ? parseFloat(createForm.maximumDiscount) : undefined,
        usageLimit: createForm.usageLimit ? parseInt(createForm.usageLimit) : undefined,
        userUsageLimit: parseInt(createForm.userUsageLimit) || 1,
      }

      const response = await api.post('/admin/coupons', formData)
      setCoupons([...coupons, response.data.data])
      setShowCreateModal(false)
      setCreateForm({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minimumAmount: '',
        maximumDiscount: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
        userUsageLimit: 1,
        isActive: true,
        isGlobal: true,
        applicableCourses: [],
        applicableCategories: [],
      })
      setSuccessMessage('Coupon created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to create coupon')
    }
  }

  const handleEditCoupon = async (e) => {
    e.preventDefault()
    const validationError = validateForm(editForm)
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    try {
      const formData = {
        ...editForm,
        discountValue: parseFloat(editForm.discountValue),
        minimumAmount: parseFloat(editForm.minimumAmount) || 0,
        maximumDiscount: editForm.maximumDiscount ? parseFloat(editForm.maximumDiscount) : undefined,
        usageLimit: editForm.usageLimit ? parseInt(editForm.usageLimit) : undefined,
        userUsageLimit: parseInt(editForm.userUsageLimit) || 1,
      }

      const response = await api.put(`/admin/coupons/${currentCoupon._id}`, formData)
      setCoupons(coupons.map(c => c._id === currentCoupon._id ? response.data.data : c))
      setShowEditModal(false)
      setCurrentCoupon(null)
      setSuccessMessage('Coupon updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update coupon')
    }
  }

  const handleDeleteCoupon = async () => {
    try {
      await api.delete(`/admin/coupons/${currentCoupon._id}`)
      setCoupons(coupons.filter(c => c._id !== currentCoupon._id))
      setShowDeleteModal(false)
      setCurrentCoupon(null)
      setSuccessMessage('Coupon deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to delete coupon')
    }
  }

  const openEditModal = (coupon) => {
    setCurrentCoupon(coupon)
    setEditForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumAmount: coupon.minimumAmount?.toString() || '',
      maximumDiscount: coupon.maximumDiscount?.toString() || '',
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil.split('T')[0],
      usageLimit: coupon.usageLimit?.toString() || '',
      userUsageLimit: coupon.userUsageLimit || 1,
      isActive: coupon.isActive,
      isGlobal: coupon.isGlobal,
      applicableCourses: coupon.applicableCourses || [],
      applicableCategories: coupon.applicableCategories || [],
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (coupon) => {
    setCurrentCoupon(coupon)
    setShowDeleteModal(true)
  }

  const openViewModal = (coupon) => {
    setCurrentCoupon(coupon)
    setShowViewModal(true)
  }

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code)
    setSuccessMessage('Coupon code copied to clipboard!')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const isExpired = (coupon) => new Date(coupon.validUntil) < new Date()
  const isActive = (coupon) => coupon.isActive && !isExpired(coupon)

  const getPaginatedCoupons = () => {
    const startIndex = (currentPage - 1) * couponsPerPage
    const endIndex = startIndex + couponsPerPage
    return filteredCoupons.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage)

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Tag className="text-blue-600" size={32} />
              Coupon Management
            </h1>
            <p className="text-gray-600">Create and manage promotional coupons</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            <Plus size={20} />
            Create Coupon
          </motion.button>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"
            >
              <Check size={20} />
              {successMessage}
            </motion.div>
          )}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-center gap-2"
            >
              <AlertTriangle size={20} />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Coupons</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="createdAt">Created Date</option>
              <option value="code">Code</option>
              <option value="discountValue">Discount Value</option>
              <option value="validUntil">Expiry Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : getPaginatedCoupons().length === 0 ? (
          <div className="text-center py-12">
            <Tag className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-400 text-lg">No coupons found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Discount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Valid Until</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Usage</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getPaginatedCoupons().map((coupon) => (
                    <motion.tr
                      key={coupon._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-mono font-bold">{coupon.code}</span>
                          <button
                            onClick={() => copyCouponCode(coupon.code)}
                            className="text-gray-400 hover:text-blue-600 transition"
                            title="Copy code"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-900">
                          {coupon.discountType === 'percentage' ? (
                            <>
                              <Percent size={16} className="text-blue-600" />
                              {coupon.discountValue}%
                            </>
                          ) : (
                            <>
                              ₹{coupon.discountValue}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          coupon.discountType === 'percentage'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-green-100 text-green-800 border border-green-300'
                        }`}>
                          {coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="text-sm">
                          <div>{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</div>
                          <div className="text-xs text-gray-500">per user: {coupon.userUsageLimit}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1 ${
                          isActive(coupon)
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : isExpired(coupon)
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            isActive(coupon) ? 'bg-green-600' : isExpired(coupon) ? 'bg-red-600' : 'bg-yellow-600'
                          }`}></div>
                          {isActive(coupon) ? 'Active' : isExpired(coupon) ? 'Expired' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openViewModal(coupon)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded-lg transition"
                            title="View details"
                          >
                            <Eye size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditModal(coupon)}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-2 rounded-lg transition"
                            title="Edit coupon"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openDeleteModal(coupon)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition"
                            title="Delete coupon"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200 transition"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 hover:bg-gray-200 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Create New Coupon</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                    <input
                      type="text"
                      name="code"
                      value={createForm.code}
                      onChange={handleCreateChange}
                      placeholder="e.g., SAVE20"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      name="discountType"
                      value={createForm.discountType}
                      onChange={handleCreateChange}
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={createForm.discountValue}
                      onChange={handleCreateChange}
                      placeholder="e.g., 20"
                      step="0.01"
                      min="0"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Amount</label>
                    <input
                      type="number"
                      name="minimumAmount"
                      value={createForm.minimumAmount}
                      onChange={handleCreateChange}
                      placeholder="e.g., 100"
                      step="0.01"
                      min="0"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">₹</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Discount</label>
                    <input
                      type="number"
                      name="maximumDiscount"
                      value={createForm.maximumDiscount}
                      onChange={handleCreateChange}
                      placeholder="e.g., 50"
                      step="0.01"
                      min="0"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">₹</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                    <input
                      type="date"
                      name="validFrom"
                      value={createForm.validFrom}
                      onChange={handleCreateChange}
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      name="validUntil"
                      value={createForm.validUntil}
                      onChange={handleCreateChange}
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={createForm.usageLimit}
                      onChange={handleCreateChange}
                      placeholder="Leave empty for unlimited"
                      min="1"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Per User Limit</label>
                    <input
                      type="number"
                      name="userUsageLimit"
                      value={createForm.userUsageLimit}
                      onChange={handleCreateChange}
                      min="1"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateChange}
                    placeholder="Coupon description..."
                    rows="3"
                    className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                  ></textarea>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={createForm.isActive}
                      onChange={handleCreateChange}
                      className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-blue-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      name="isGlobal"
                      checked={createForm.isGlobal}
                      onChange={handleCreateChange}
                      className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-blue-500"
                    />
                    Global (Available for all courses)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition font-medium flex items-center gap-2"
                  >
                    <Check size={18} />
                    Create Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && currentCoupon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Edit Coupon</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditCoupon} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                    <input
                      type="text"
                      name="code"
                      value={editForm.code}
                      onChange={handleEditChange}
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                    <select
                      name="discountType"
                      value={editForm.discountType}
                      onChange={handleEditChange}
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={editForm.discountValue}
                      onChange={handleEditChange}
                      step="0.01"
                      min="0"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Amount</label>
                    <input
                      type="number"
                      name="minimumAmount"
                      value={editForm.minimumAmount}
                      onChange={handleEditChange}
                      step="0.01"
                      min="0"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">₹</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Discount</label>
                    <input
                      type="number"
                      name="maximumDiscount"
                      value={editForm.maximumDiscount}
                      onChange={handleEditChange}
                      step="0.01"
                      min="0"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">₹</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                    <input
                      type="date"
                      name="validFrom"
                      value={editForm.validFrom}
                      onChange={handleEditChange}
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      name="validUntil"
                      value={editForm.validUntil}
                      onChange={handleEditChange}
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={editForm.usageLimit}
                      onChange={handleEditChange}
                      min="1"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Per User Limit</label>
                    <input
                      type="number"
                      name="userUsageLimit"
                      value={editForm.userUsageLimit}
                      onChange={handleEditChange}
                      min="1"
                      className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows="3"
                    className="w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-2 border border-gray-300 focus:border-blue-500 focus:outline-none transition"
                  ></textarea>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={editForm.isActive}
                      onChange={handleEditChange}
                      className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-blue-500"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      name="isGlobal"
                      checked={editForm.isGlobal}
                      onChange={handleEditChange}
                      className="w-4 h-4 rounded border-gray-300 bg-gray-50 text-blue-500"
                    />
                    Global (Available for all courses)
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition font-medium flex items-center gap-2"
                  >
                    <Check size={18} />
                    Update Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && currentCoupon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-lg max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Coupon Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Coupon Code</p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-mono font-bold text-lg">{currentCoupon.code}</p>
                      <button
                        onClick={() => copyCouponCode(currentCoupon.code)}
                        className="text-gray-400 hover:text-blue-600 transition"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold flex w-fit items-center gap-1 ${
                      isActive(currentCoupon)
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : isExpired(currentCoupon)
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isActive(currentCoupon) ? 'bg-green-600' : isExpired(currentCoupon) ? 'bg-red-600' : 'bg-yellow-600'
                      }`}></div>
                      {isActive(currentCoupon) ? 'Active' : isExpired(currentCoupon) ? 'Expired' : 'Inactive'}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Discount</p>
                    <p className="text-gray-900 font-semibold text-lg flex items-center gap-2">
                      {currentCoupon.discountType === 'percentage' ? (
                        <>
                          <Percent size={18} className="text-blue-600" />
                          {currentCoupon.discountValue}%
                        </>
                      ) : (
                        <>
                          ₹{currentCoupon.discountValue}
                        </>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Type</p>
                    <p className="text-gray-900 font-semibold">
                      {currentCoupon.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Valid From</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(currentCoupon.validFrom).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Valid Until</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(currentCoupon.validUntil).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Minimum Amount</p>
                    <p className="text-gray-900 font-semibold">₹{currentCoupon.minimumAmount || 0}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Maximum Discount</p>
                    <p className="text-gray-900 font-semibold">₹{currentCoupon.maximumDiscount || 'Unlimited'}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Usage Count</p>
                    <p className="text-gray-900 font-semibold flex items-center gap-2">
                      <TrendingUp size={16} />
                      {currentCoupon.usedCount || 0} / {currentCoupon.usageLimit || '∞'}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Per User Limit</p>
                    <p className="text-gray-900 font-semibold flex items-center gap-2">
                      <Users size={16} />
                      {currentCoupon.userUsageLimit}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Global Coupon</p>
                    <p className="text-gray-900 font-semibold">{currentCoupon.isGlobal ? 'Yes' : 'No'}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mb-2">Created Date</p>
                    <p className="text-gray-900 font-semibold">{new Date(currentCoupon.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">Description</p>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{currentCoupon.description}</p>
                </div>

                {currentCoupon.metadata && Object.keys(currentCoupon.metadata).length > 0 && (
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Metadata</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-sm">
                      {Object.entries(currentCoupon.metadata).map(([key, value]) => (
                        value && <div key={key}><span className="font-semibold">{key}:</span> {value}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && currentCoupon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-200 rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-red-50 border-b border-red-200 p-6 flex items-start gap-4">
                <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Coupon</h2>
                  <p className="text-gray-600 text-sm mt-1">This action cannot be undone</p>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the coupon <span className="font-mono font-bold text-gray-900">{currentCoupon.code}</span>?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteCoupon}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition font-medium flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete Coupon
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminCoupons
