"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { BookOpen, Play, ChevronRight } from "lucide-react"
import { useState } from "react"
import { fetchUserEnrollments, fetchUserProgress } from "../store/slices/enrollmentSlice"

const MyEnrollmentsPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { enrollments, progress, isLoading } = useSelector((state) => state.enrollment)

  useEffect(() => {
    if (user) {
      dispatch(fetchUserEnrollments())
    }
  }, [dispatch, user])

  useEffect(() => {
    if (enrollments.length > 0) {
      enrollments.forEach((enrollment, index) => {
        if (
          enrollment &&
          enrollment.course &&
          enrollment.course._id &&
          typeof enrollment.course._id === "string" &&
          enrollment.course._id.trim() !== "" &&
          enrollment.course._id !== "undefined" &&
          enrollment.course._id !== "null"
        ) {
          // Add delay between requests to avoid rate limiting (200ms * index)
          setTimeout(() => {
            dispatch(fetchUserProgress(enrollment.course._id));
          }, index * 200);
        } else {
          console.warn("Skipping fetchUserProgress due to invalid enrollment data:", enrollment);
        }
      });
    }
  }, [dispatch, enrollments]);

  const getProgressPercentage = (courseId) => {
    // Ensure we handle cases where progress for a course might be null/undefined
    return progress[courseId]?.completionPercentage || 0
  }

  const getNextLesson = (courseId) => {
    return progress[courseId]?.nextLesson || "Introduction"
  }

  const renderThumbnail = (thumbnail, title) => {
    if (!thumbnail) {
      return <img src="/placeholder.svg" alt={title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
    }
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|flv)$/i
    if (videoExtensions.test(thumbnail)) {
      return (
        <video
          src={thumbnail}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          muted
          controls={false}
          preload="metadata"
          onError={(e) => {
            e.target.style.display = 'none'
            const fallback = e.target.parentElement.querySelector('.thumbnail-video-fallback') || document.createElement('div')
            fallback.className = 'thumbnail-video-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 font-medium'
            fallback.textContent = 'VIDEO'
            if (!e.target.parentElement.querySelector('.thumbnail-video-fallback')) {
              e.target.parentElement.appendChild(fallback)
            }
          }}
          onLoadedData={(e) => {
            const fallback = e.target.parentElement.querySelector('.thumbnail-video-fallback')
            if (fallback) fallback.remove()
          }}
        />
      )
    }
    return (
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
        onError={(e) => {
          e.target.style.display = 'none'
          const fallback = e.target.parentElement.querySelector('.thumbnail-image-fallback') || document.createElement('div')
          fallback.className = 'thumbnail-image-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 font-medium'
          fallback.textContent = 'IMG'
          if (!e.target.parentElement.querySelector('.thumbnail-image-fallback')) {
            e.target.parentElement.appendChild(fallback)
          }
        }}
        onLoad={(e) => {
          const fallback = e.target.parentElement.querySelector('.thumbnail-image-fallback')
          if (fallback) fallback.remove()
        }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 xs:py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-6 xs:h-7 sm:h-8 w-48 xs:w-56 sm:w-64 rounded mb-6 xs:mb-7 sm:mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg xs:rounded-xl shadow-lg p-4 xs:p-5 sm:p-6">
                  <div className="bg-gray-300 h-32 xs:h-36 sm:h-40 w-full rounded-lg mb-3 xs:mb-4"></div>
                  <div className="bg-gray-300 h-4 xs:h-5 sm:h-6 w-3/4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-3 xs:h-3.5 sm:h-4 w-1/2 rounded mb-3 xs:mb-4"></div>
                  <div className="bg-gray-300 h-2 xs:h-2.5 sm:h-3 rounded mb-2"></div>
                  <div className="bg-gray-300 h-8 xs:h-9 sm:h-10 w-full rounded-md mt-4 xs:mt-5 sm:mt-6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 xs:py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 xs:mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1 xs:mb-2">Your Learning Journey</h1>
          <p className="text-sm xs:text-base sm:text-lg text-gray-600">Continue where you left off in your enrolled courses.</p>
        </div>

        {/* Enrolled Courses Section */}
        <div className="bg-white rounded-lg xs:rounded-xl shadow-lg p-4 xs:p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-4 xs:mb-6 border-b pb-3 xs:pb-4 gap-2 xs:gap-0">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">Enrolled Courses ({enrollments.length})</h2>
            <Link to="/courses" className="text-rose-600 hover:text-rose-800 font-semibold flex items-center group text-sm xs:text-base">
              Browse More Courses <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-10 xs:py-12 sm:py-16">
              <BookOpen className="h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 text-rose-400 mx-auto mb-4 xs:mb-5 sm:mb-6" />
              <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-2 xs:mb-3">No active enrollments</h3>
              <p className="text-sm xs:text-base text-gray-600 mb-4 xs:mb-5 sm:mb-8">It looks like you haven't started any courses yet. Find your first course!</p>
              <Link
                to="/courses"
                className="bg-rose-600 text-white px-5 xs:px-6 sm:px-8 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl text-sm xs:text-base sm:text-lg font-medium hover:bg-rose-700 transition-colors shadow-lg inline-block"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 lg:gap-8">
              {enrollments.map((enrollment) => {
                const courseId = enrollment.course._id;
                const progressPercentage = getProgressPercentage(courseId);
                const nextLesson = getNextLesson(courseId);

                return (
                  <div
                    key={enrollment._id}
                    className="bg-gray-50 border border-gray-200 rounded-lg xs:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Course Thumbnail */}
                    <div className="h-36 xs:h-40 sm:h-44 overflow-hidden">
                      {renderThumbnail(enrollment.course.thumbnail, enrollment.course.title)}
                    </div>

                    <div className="p-4 xs:p-5 sm:p-6 flex flex-col flex-grow">
                      {/* Course Info */}
                      <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-1 xs:mb-2 truncate" title={enrollment.course.title}>
                        {enrollment.course.title}
                      </h3>
                      <p className="text-xs xs:text-sm text-gray-600 mb-3 xs:mb-4">By {enrollment.course.instructor}</p>

                      {/* Progress Bar */}
                      <div className="mb-4 xs:mb-5 sm:mb-6 mt-auto">
                        <div className="flex items-center justify-between mb-1 xs:mb-2">
                          <span className="text-xs xs:text-sm text-gray-600 font-medium">Progress</span>
                          <span className="text-xs xs:text-sm font-bold text-rose-600">
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 xs:h-2.5 sm:h-3">
                          <div
                            className="bg-rose-600 h-2 xs:h-2.5 sm:h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Next Lesson and Action Button */}
                      <div className="mt-auto">
                        <p className="text-2xs xs:text-xs text-gray-500 mb-2 xs:mb-3 truncate">
                          Next up: <span className="font-medium text-gray-700">{nextLesson}</span>
                        </p>
                        <Link
                          to={`/courses/${courseId}/learn`}
                          className="w-full bg-rose-600 text-white px-3 xs:px-4 py-2 xs:py-2.5 rounded-md text-xs xs:text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
                        >
                          <Play className="h-3 w-3 xs:h-4 xs:w-4" />
                          <span>{progressPercentage === 100 ? "Review Course" : "Continue Learning"}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyEnrollmentsPage