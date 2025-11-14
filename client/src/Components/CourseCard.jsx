"use client"

import { Link } from "react-router-dom"
import { Star, Users, Clock, Play, BookOpen } from "lucide-react"
import { motion } from "framer-motion"

const CourseCard = ({ course, index = 0 }) => {
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
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <Link to={`/courses/${_id}`} className="block">
        {/* Course Thumbnail */}
        <div className="relative h-48 overflow-hidden bg-gray-200">
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
                fallback.className = 'coursecard-video-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 font-medium'
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
                fallback.className = 'coursecard-image-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 font-medium'
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
          <div className="absolute top-4 left-4">
            <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">{category}</span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium">
              {level}
            </span>
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <Play className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Course Content */}
        <div className="p-6">
          {/* Title and Description */}
          <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {title}
          </h3>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{description}</p>
          </div>

          {/* Instructor */}
          <div className="flex items-center space-x-3 mb-4">
            {course.createdBy?.profile?.avatar && (
              <img
                src={course.createdBy.profile.avatar}
                alt={course.createdBy?.name || instructor}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <p className="text-sm text-gray-700">
              By <span className="font-medium text-primary-600">{course.createdBy?.name || instructor}</span>
            </p>
          </div>

          {/* Course Stats */}
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              {/* Rating */}
              {avgRating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{avgRating}</span>
                  <span className="text-gray-500">({reviewCount})</span>
                </div>
              )}

              {/* Enrollment Count */}
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{enrollmentCount}</span>
              </div>

              {/* Duration */}
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(duration)}</span>
              </div>
            </div>
          </div>

          {/* Lessons Count */}
          <div className="flex items-center space-x-1 mb-4 text-sm text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span>{lessons?.length || 0} lessons</span>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(price)}
              {price > 0 && <span className="text-sm font-normal text-gray-500 ml-1">₹</span>}
            </div>
            <button className="bg-rose-700 text-white px-4 py-2 rounded-lg hover:bg-rose-800 transition-colors font-medium text-sm">
              View Course
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default CourseCard
