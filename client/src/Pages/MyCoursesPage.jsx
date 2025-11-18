"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Play, BookOpen, CheckCircle, Image as ImageIcon, Video, Clock, Award, TrendingUp } from "lucide-react";

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const fetchEnrollmentsWithProgress = async () => {
    if (!token) {
      setError("Please login to view your courses");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const res = await axios.get("/api/enrollments/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // For each enrollment, fetch lesson completion progress
      const coursesWithProgress = await Promise.all(
        res.data.map(async (enrollment) => {
          try {
            const progressRes = await axios.get(
              `/api/enrollments/progress/${enrollment.course._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const completedLessons = progressRes.data.progress?.completedLessons || [];
            const completionPercentage = progressRes.data.progress?.completionPercentage || 0;

            return {
              ...enrollment,
              completedLessons,
              completionPercentage,
            };
          } catch (progressError) {
            console.warn(`Could not fetch progress for course ${enrollment.course._id}:`, progressError);
            return { 
              ...enrollment, 
              completedLessons: [], 
              completionPercentage: 0 
            };
          }
        })
      );

      setEnrollments(coursesWithProgress);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setError("Failed to load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchEnrollmentsWithProgress();
      // Remove the interval if not needed, or keep it for real-time updates
      // const interval = setInterval(fetchEnrollmentsWithProgress, 30000);
      // return () => clearInterval(interval);
    } else {
      setLoading(false);
      setError("Please login to view your courses");
    }
  }, [token]);

  const getNextLesson = (enrollment) => {
    if (!enrollment.course.lessons || enrollment.course.lessons.length === 0) {
      return "Introduction";
    }
    
    const completedLessonIds = enrollment.completedLessons?.map((l) => l.lessonId) || [];
    const nextLesson = enrollment.course.lessons.find(
      (lesson) => !completedLessonIds.includes(lesson._id)
    );
    
    return nextLesson ? nextLesson.title : "Course Completed";
  };

  // Function to handle media display
  const renderCourseMedia = (course) => {
    const thumbnail = course.thumbnail;
    
    if (!thumbnail) {
      return (
        <div className="w-full md:w-40 h-32 md:h-28 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      );
    }

    // Check if it's a video file
    const isVideo = thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i);
    
    if (isVideo) {
      return (
        <div className="w-full md:w-40 h-32 md:h-28 rounded-lg border border-gray-200 overflow-hidden relative">
          <video
            src={thumbnail}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentElement.querySelector('.media-fallback') || document.createElement('div');
              fallback.className = 'media-fallback absolute inset-0 bg-gray-100 flex items-center justify-center';
              fallback.innerHTML = '<div class="text-center"><Video className="h-6 w-6 text-gray-400 mx-auto mb-1" /><span class="text-xs text-gray-500 block">Video</span></div>';
              if (!e.target.parentElement.querySelector('.media-fallback')) {
                e.target.parentElement.appendChild(fallback);
              }
            }}
            onLoadedData={(e) => {
              const fallback = e.target.parentElement.querySelector('.media-fallback');
              if (fallback) fallback.remove();
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>
      );
    } else {
      // It's an image
      return (
        <div className="w-full md:w-40 h-32 md:h-28 rounded-lg border border-gray-200 overflow-hidden">
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentElement.querySelector('.media-fallback') || document.createElement('div');
              fallback.className = 'media-fallback w-full h-full bg-gray-100 flex items-center justify-center';
              fallback.innerHTML = '<div class="text-center"><ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" /><span class="text-xs text-gray-500 block">Image</span></div>';
              if (!e.target.parentElement.querySelector('.media-fallback')) {
                e.target.parentElement.appendChild(fallback);
              }
            }}
            onLoad={(e) => {
              const fallback = e.target.parentElement.querySelector('.media-fallback');
              if (fallback) fallback.remove();
            }}
          />
        </div>
      );
    }
  };

  // Stats calculation
  const stats = [
    {
      icon: BookOpen,
      label: "Total Courses",
      value: enrollments.length,
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: enrollments.filter(e => e.completionPercentage === 100).length,
      color: "bg-green-100 text-green-600",
    },
    {
      icon: TrendingUp,
      label: "In Progress",
      value: enrollments.filter(e => e.completionPercentage > 0 && e.completionPercentage < 100).length,
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Award,
      label: "Avg Progress",
      value: `${Math.round(
        enrollments.reduce((total, e) => total + e.completionPercentage, 0) / 
        (enrollments.length || 1)
      )}%`,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading your courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Access Required</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/login"
            className="bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all font-medium inline-flex items-center gap-2"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            My Learning Journey
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back, {user?.name}! Continue your learning journey
          </p>
        </div>

        {/* Stats Overview */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={`stat-${index}`} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mr-4`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                My Courses ({enrollments.length})
              </h2>
              <p className="text-gray-600 mt-1">
                Your enrolled courses and learning progress
              </p>
            </div>
            <Link
              to="/courses"
              className="mt-4 md:mt-0 bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all font-medium text-sm md:text-base flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Browse More Courses
            </Link>
          </div>

          {/* Courses List */}
          {enrollments.length === 0 ? (
            <div className="text-center py-12 md:py-16 lg:py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your learning journey by enrolling in your first course. Explore our catalog and begin learning today!
              </p>
              <Link
                to="/courses"
                className="bg-red-800 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-all font-medium inline-flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Explore Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {enrollments.map((enrollment) => {
                const progressPercent = enrollment.completionPercentage || 0;
                const isCompleted = progressPercent === 100;
                const totalLessons = enrollment.course.lessons?.length || 0;
                const completedCount = enrollment.completedLessons?.length || 0;

                return (
                  <div
                    key={`enrollment-${enrollment._id}`}
                    className="bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all p-5 md:p-6"
                  >
                    <div className="flex flex-col md:flex-row gap-5 md:gap-6">
                      {/* Course Media */}
                      <div className="flex-shrink-0">
                        {renderCourseMedia(enrollment.course)}
                      </div>

                      {/* Course Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                              {enrollment.course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                              By {enrollment.course.instructor || "Unknown Instructor"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {totalLessons} lessons • {completedCount} completed
                            </p>
                          </div>
                          
                          {/* Completion Badge */}
                          {isCompleted && (
                            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                              <CheckCircle className="h-4 w-4" />
                              Completed
                            </div>
                          )}
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Your progress
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                {progressPercent}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${
                                  isCompleted 
                                    ? "bg-green-500" 
                                    : progressPercent > 0 
                                      ? "bg-blue-600" 
                                      : "bg-gray-300"
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Next Lesson & Action Button */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Next: </span>
                              <span className="text-gray-800">{getNextLesson(enrollment)}</span>
                            </div>
                            
                            <Link
                              to={`/courses/${enrollment.course._id}/learn`}
                              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 min-w-[140px] ${
                                isCompleted
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-red-800 text-white hover:bg-red-700"
                              }`}
                            >
                              <Play className="h-4 w-4" />
                              {isCompleted ? "Review Course" : "Continue Learning"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Stats */}
          {enrollments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>In Progress: {enrollments.filter(e => e.completionPercentage > 0 && e.completionPercentage < 100).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Completed: {enrollments.filter(e => e.completionPercentage === 100).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>Not Started: {enrollments.filter(e => e.completionPercentage === 0).length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;