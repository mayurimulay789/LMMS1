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
          className="w-full h-40 object-cover transition-transform duration-300 hover:scale-[1.03]"
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-64 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="bg-gray-300 h-40 w-full rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-6 w-3/4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 w-1/2 rounded mb-4"></div>
                  <div className="bg-gray-300 h-3 rounded mb-2"></div>
                  <div className="bg-gray-300 h-10 w-full rounded-md mt-6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Your Learning Journey</h1>
          <p className="text-lg text-gray-600">Continue where you left off in your enrolled courses.</p>
        </div>

        {/* Enrolled Courses Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Enrolled Courses ({enrollments.length})</h2>
            <Link to="/courses" className="text-rose-600 hover:text-rose-800 font-semibold flex items-center group">
              Browse More Courses <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-20 w-20 text-rose-400 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">No active enrollments</h3>
              <p className="text-gray-600 mb-8">It looks like you haven't started any courses yet. Find your first course!</p>
              <Link
                to="/courses"
                className="bg-rose-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-rose-700 transition-colors shadow-lg"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrollments.map((enrollment) => {
                const courseId = enrollment.course._id;
                const progressPercentage = getProgressPercentage(courseId);
                const nextLesson = getNextLesson(courseId);

                return (
                  <div
                    key={enrollment._id}
                    className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                  {/* Course Thumbnail */}
                  <div className="h-40 overflow-hidden">
                    {renderThumbnail(enrollment.course.thumbnail, enrollment.course.title)}
                  </div>

                    <div className="p-6 flex flex-col flex-grow">
                      {/* Course Info */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 truncate" title={enrollment.course.title}>
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">By {enrollment.course.instructor}</p>

                      {/* Progress Bar */}
                      <div className="mb-6 mt-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 font-medium">Progress</span>
                          <span className="text-sm font-bold text-rose-600">
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-rose-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Next Lesson and Action Button */}
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-4 truncate">
                          Next up: <span className="font-medium text-gray-700">{nextLesson}</span>
                        </p>
                        <Link
                          to={`/courses/${courseId}/learn`}
                          className="w-full bg-rose-600 text-white px-4 py-3 rounded-md text-sm font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center space-x-2 shadow-md"
                        >
                          <Play className="h-4 w-4" />
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