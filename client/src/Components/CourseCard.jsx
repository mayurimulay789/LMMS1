"use client"

import { Link } from "react-router-dom"
import { Star, Users, Clock, Play, BookOpen } from "lucide-react"
import { motion } from "framer-motion"

import { useSelector } from "react-redux"
import { getImageWithFallback } from "../utils/imageUtils"

const CourseCard = ({ course, index = 0 }) => {
  const { user } = useSelector((state) => state.auth)
  const {
    _id,
    title,
    description,
    instructor,
    price,
    thumbnail,
    category,
    duration,
    lessons,
    enrollmentCount = 0,
    avgRating = 0,
    reviewCount = 0,
    level = "Beginner",
  } = course

  const formatPrice = (price) => {
    return price === 0 ? "Free" : `₹${price}`
  }

  const formatDuration = (duration) => {
    if (!duration) return "Self-paced"
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col"
    >
      <Link to={`/courses/${_id}`} className="block h-full flex flex-col">
        {/* Course Thumbnail */}
        <div className="relative h-36 xs:h-40 sm:h-44 md:h-48 overflow-hidden bg-gray-200">
          {thumbnail && thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv)$/i) ? (
            <video
              src={thumbnail}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              muted
              controls={false}
              preload="metadata"
              onError={(e) => {
                console.log('CourseCard video load error:', e)
                console.log('CourseCard video src:', thumbnail)
                e.target.style.display = 'none'
                const fallback = e.target.parentElement.querySelector('.coursecard-video-fallback') || document.createElement('div')
                fallback.className = 'coursecard-video-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 font-medium text-xs xs:text-sm'
                fallback.textContent = 'VIDEO'
                if (!e.target.parentElement.querySelector('.coursecard-video-fallback')) {
                  e.target.parentElement.appendChild(fallback)
                }
              }}
              onLoadedData={(e) => {
                const fallback = e.target.parentElement.querySelector('.coursecard-video-fallback')
                if (fallback) fallback.remove()
              }}
            />
          ) : (
            <img
              src={thumbnail || "/placeholder.svg?height=200&width=400"}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              onError={(e) => {
                console.log('CourseCard image load error:', e)
                console.log('CourseCard image src:', thumbnail)
                e.target.style.display = 'none'
                const fallback = e.target.parentElement.querySelector('.coursecard-image-fallback') || document.createElement('div')
                fallback.className = 'coursecard-image-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 font-medium text-xs xs:text-sm'
                fallback.textContent = 'IMG'
                if (!e.target.parentElement.querySelector('.coursecard-image-fallback')) {
                  e.target.parentElement.appendChild(fallback)
                }
              }}
              onLoad={(e) => {
                const fallback = e.target.parentElement.querySelector('.coursecard-image-fallback')
                if (fallback) fallback.remove()
              }}
            />
          )}
          <div
            className="absolute flex flex-row flex-wrap gap-1 top-2 xs:top-3 sm:top-4 left-2 xs:left-3 sm:left-4 w-auto"
            style={{ maxWidth: 'calc(100% - 16px)' }}
          >
            <span className="text-white px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-2xs xs:text-xs font-medium bg-primary-800 truncate max-w-[60px] xs:max-w-[90px] sm:max-w-[120px]">
              {category}
            </span>
            <span className="bg-black bg-opacity-70 text-white px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full text-2xs xs:text-xs font-medium truncate max-w-[60px] xs:max-w-[90px] sm:max-w-[120px]">
              {level}
            </span>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <Play className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Course Content */}
        <div className="p-3 xs:p-4 sm:p-5 md:p-6 flex flex-col flex-1 justify-between">
          {/* Title and Description */}
          <div className="mb-2 xs:mb-3 sm:mb-4">
            <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1 xs:mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 text-xs xs:text-sm line-clamp-2 leading-relaxed">{description}</p>
          </div>

          {/* Instructor */}
          <div className="flex items-center space-x-2 xs:space-x-3 mb-2 xs:mb-3 sm:mb-4">
            <img
              src={
                getImageWithFallback(
                  course.instructorImage || course.createdBy?.profileImage || course.createdBy?.avatar || course.createdBy?.profile?.avatar || null,
                  'avatar',
                  { name: course.createdBy?.name || instructor || 'Instructor', size: 32 }
                )
              }
              alt={course.createdBy?.name || instructor || 'Instructor'}
              className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full object-cover"
            />
            <p className="text-xs xs:text-sm text-gray-700">
              By <span className="font-medium text-primary-600">{course.createdBy?.name || instructor || 'Instructor'}</span>
            </p>
          </div>

          {/* Course Stats */}
          <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm text-gray-600">
            <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 flex-wrap">
              {/* Rating */}
              {avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 xs:h-4 xs:w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{avgRating}</span>
                  <span className="text-gray-500 hidden xs:inline">({reviewCount})</span>
                </div>
              )}

              {/* Enrollment Count */}
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 xs:h-4 xs:w-4" />
                <span>{enrollmentCount}</span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 xs:h-4 xs:w-4" />
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
          </div>

          {/* Lessons Count */}
          <div className="flex items-center gap-1 mb-2 xs:mb-3 sm:mb-4 text-xs xs:text-sm text-gray-600">
            <BookOpen className="h-3 w-3 xs:h-4 xs:w-4" />
            <span>{lessons?.length || 0} lessons</span>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {formatPrice(price)}
            </div>
            <button
              className="text-white px-2 py-1 xs:px-3 xs:py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs xs:text-sm sm:text-base bg-primary-800 hover:bg-primary-700 transition-colors min-w-[70px] xs:min-w-[90px] sm:min-w-[110px]"
              style={{ fontSize: 'clamp(10px, 3vw, 16px)' }}
            >
              View Course
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default CourseCard