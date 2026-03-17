"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Grid, List, SlidersHorizontal } from "lucide-react"
import CourseCard from "../Components/CourseCard"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { apiRequest } from "../config/api"

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "all",
    priceRange: "all",
    level: "all",
    rating: "all",
    sort: "newest",
  })

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  // Dropdown states
  const [sortOpen, setSortOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)
  const [levelOpen, setLevelOpen] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)

  const categoriesFetchedRef = useRef(false)

  useEffect(() => {
    if (!categoriesFetchedRef.current) {
      fetchCategories()
      categoriesFetchedRef.current = true
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [filters, pagination.currentPage])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value)
      }
    })
    setSearchParams(params)
  }, [filters, setSearchParams])

  const fetchCategories = async () => {
    try {
      const response = await apiRequest("courses/meta/categories")
      if (response && response.ok) {
        setCategories(response.data || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const fetchCourses = useCallback(async () => {
    if (isInitialLoad) {
      setIsLoading(true)
    }
    setHasError(false)

    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
      })

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "") {
          queryParams.append(key, value)
        }
      })

      const response = await apiRequest(`courses?${queryParams}`)
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch courses`)
      }

      const data = response.data
      if (!data || !Array.isArray(data.courses)) {
        throw new Error("Invalid response format from server")
      }

      setCourses(data.courses)
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.max(1, data.totalPages || 1),
        total: data.total || 0,
      }))
    } catch (error) {
      console.error("Error fetching courses:", error)
      setHasError(true)
      setCourses([])
      setPagination((prev) => ({
        ...prev,
        totalPages: 1,
        total: 0,
      }))
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [filters, pagination.currentPage, isInitialLoad])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourses()
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      priceRange: "all",
      level: "all",
      rating: "all",
      sort: "newest",
    })
  }

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "free", label: "Free" },
    { value: "0-50", label: "₹0 - ₹50" },
    { value: "50-100", label: "₹50 - ₹100" },
    { value: "100+", label: "₹100+" },
  ]

  const levels = [
    { value: "all", label: "All Levels" },
    { value: "Beginner", label: "Beginner" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Advanced", label: "Advanced" },
  ]

  const ratings = [
    { value: "all", label: "All Ratings" },
    { value: "4.5", label: "4.5+ Stars" },
    { value: "4.0", label: "4.0+ Stars" },
    { value: "3.5", label: "3.5+ Stars" },
  ]

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "popular", label: "Most Popular" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-5">All Courses</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Discover {pagination.total} courses to advance your skills
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 mb-6 md:mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </form>

          {/* Filter Toggle and View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900"
            >
              <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 sm:p-2 rounded ${
                    viewMode === "grid" ? "bg-primary-100 text-primary-600" : "text-gray-400"
                  }`}
                >
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 sm:p-2 rounded ${
                    viewMode === "list" ? "bg-primary-100 text-primary-600" : "text-gray-400"
                  }`}
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Sort */}
              <div className="relative w-40 xs:w-44 sm:w-48">
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <span className="truncate">
                    {sortOptions.find((opt) => opt.value === filters.sort)?.label || "Sort by"}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {sortOpen && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {sortOptions.map((option) => (
                      <li key={option.value}>
                        <button
                          type="button"
                          onClick={() => {
                            handleFilterChange("sort", option.value)
                            setSortOpen(false)
                          }}
                          className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-primary-800 hover:text-white transition-colors ${
                            filters.sort === option.value ? "bg-primary-800 text-white" : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-gray-200"
            >
              {/* Category Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoryOpen(!categoryOpen)}
                    className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <span className="truncate">
                      {filters.category === "all" ? "All Categories" : filters.category}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {categoryOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleFilterChange("category", "all")
                            setCategoryOpen(false)
                          }}
                          className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-primary-100 hover:text-primary-600 transition-colors ${
                            filters.category === "all" ? "bg-primary-100 text-primary-600" : ""
                          }`}
                        >
                          All Categories
                        </button>
                      </li>
                      {categories.map((category) => (
                        <li key={category}>
                          <button
                            type="button"
                            onClick={() => {
                              handleFilterChange("category", category)
                              setCategoryOpen(false)
                            }}
                            className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-primary-100 hover:text-primary-600 transition-colors ${
                              filters.category === category ? "bg-primary-100 text-primary-600" : ""
                            }`}
                          >
                            {category}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Price Range</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPriceOpen(!priceOpen)}
                    className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <span className="truncate">
                      {priceRanges.find((opt) => opt.value === filters.priceRange)?.label || "All Prices"}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${priceOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {priceOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {priceRanges.map((range) => (
                        <li key={range.value}>
                          <button
                            type="button"
                            onClick={() => {
                              handleFilterChange("priceRange", range.value)
                              setPriceOpen(false)
                            }}
                            className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-primary-100 hover:text-primary-600 transition-colors ${
                              filters.priceRange === range.value ? "bg-primary-100 text-primary-600" : ""
                            }`}
                          >
                            {range.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Level</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setLevelOpen(!levelOpen)}
                    className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <span className="truncate">
                      {levels.find((opt) => opt.value === filters.level)?.label || "All Levels"}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${levelOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {levelOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {levels.map((level) => (
                        <li key={level.value}>
                          <button
                            type="button"
                            onClick={() => {
                              handleFilterChange("level", level.value)
                              setLevelOpen(false)
                            }}
                            className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-primary-100 hover:text-primary-600 transition-colors ${
                              filters.level === level.value ? "bg-primary-100 text-primary-600" : ""
                            }`}
                          >
                            {level.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Rating</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRatingOpen(!ratingOpen)}
                    className="w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  >
                    <span className="truncate">
                      {ratings.find((opt) => opt.value === filters.rating)?.label || "All Ratings"}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${ratingOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {ratingOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {ratings.map((rating) => (
                        <li key={rating.value}>
                          <button
                            type="button"
                            onClick={() => {
                              handleFilterChange("rating", rating.value)
                              setRatingOpen(false)
                            }}
                            className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-primary-100 hover:text-primary-600 transition-colors ${
                              filters.rating === rating.value ? "bg-primary-100 text-primary-600" : ""
                            }`}
                          >
                            {rating.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Active Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (value && value !== "all" && value !== "" && key !== "sort") {
                  return (
                    <span
                      key={key}
                      className="bg-primary-100 text-primary-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center space-x-1"
                    >
                      <span>
                        {key}: {value}
                      </span>
                      <button
                        onClick={() => handleFilterChange(key, key === "search" ? "" : "all")}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  )
                }
                return null
              })}
            </div>
            {Object.values(filters).some((value) => value && value !== "all" && value !== "") && (
              <button
                onClick={clearFilters}
                className="bg-primary-800 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-rose-800 transition-colors text-xs sm:text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Course Grid */}
        {hasError ? (
          <div className="text-center py-10 sm:py-12">
            <div className="text-red-500 mb-4">
              <svg
                className="h-12 w-12 sm:h-16 sm:w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-2">Failed to load courses</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              There was an error loading the courses. Please try again.
            </p>
            <button
              onClick={() => {
                setHasError(false)
                fetchCourses()
              }}
              className="bg-primary-600 text-white px-5 sm:px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-32 xs:h-36 sm:h-40 md:h-48 bg-gray-300"></div>
                <div className="p-3 xs:p-4 sm:p-5 md:p-6">
                  <div className="h-3 sm:h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4 mb-3 sm:mb-4"></div>
                  <div className="h-2 sm:h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-10 sm:py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="bg-primary-800 text-white px-5 sm:px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
                : "space-y-4 sm:space-y-6"
            }
          >
            {courses
              .map((course) => {
                const totalLessons = Array.isArray(course.modules)
                  ? course.modules.reduce((sum, mod) => sum + (mod.subcourses ? mod.subcourses.length : 0), 0)
                  : 0
                return { ...course, lessons: { length: totalLessons } }
              })
              .map((course, index) => (
                <CourseCard key={course._id} course={course} index={index} />
              ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 sm:mt-12">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={pagination.currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex flex-wrap gap-2">
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1
                return (
                  <button
                    key={page}
                    onClick={() => setPagination((prev) => ({ ...prev, currentPage: page }))}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg ${
                      pagination.currentPage === page
                        ? "bg-primary-600 text-white"
                        : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursesPage