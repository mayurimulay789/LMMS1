"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  Play, 
  BookOpen, 
  CheckCircle, 
  Image as ImageIcon, 
  Video, 
  Clock, 
  Award, 
  TrendingUp,
  ArrowRight,
  Star,
  Calendar,
  BarChart3,
  Target,
  Sparkles,
  Users,
  Bookmark,
  ChevronRight,
  Zap,
  Trophy,
  Clock3,
  Filter
} from "lucide-react";
import { fetchUserEnrollments, fetchUserProgress, clearError } from "../store/slices/enrollmentSlice";

const MyCoursesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { enrollments, progress, isLoading, error } = useSelector((state) => state.enrollment);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isHovered, setIsHovered] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (token && user) {
      dispatch(fetchUserEnrollments());
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (enrollments.length > 0) {
      enrollments.forEach((enrollment, index) => {
        if (enrollment?.course?._id) {
          setTimeout(() => {
            dispatch(fetchUserProgress(enrollment.course._id));
          }, index * 200);
        }
      });
    }
  }, [dispatch, enrollments]);

  // Combine enrollments with progress data
  const enrollmentsWithProgress = enrollments.map(enrollment => ({
    ...enrollment,
    completedLessons: progress[enrollment.course._id]?.completedLessons || [],
    completionPercentage: progress[enrollment.course._id]?.completionPercentage || 0,
  }));

  // Filter courses based on active filter
  const filteredEnrollments = enrollmentsWithProgress.filter(enrollment => {
    switch (activeFilter) {
      case "in-progress":
        return enrollment.completionPercentage > 0 && enrollment.completionPercentage < 100;
      case "completed":
        return enrollment.completionPercentage === 100;
      case "not-started":
        return enrollment.completionPercentage === 0;
      default:
        return true;
    }
  });

  const getNextLesson = (enrollment) => {
    if (!enrollment.course.modules || enrollment.course.modules.length === 0) {
      return "Introduction";
    }

    const completedLessonIds = enrollment.completedLessons?.map((l) => l.lessonId) || [];
    let nextLesson = null;

    for (const module of enrollment.course.modules) {
      if (module.subcourses && module.subcourses.length > 0) {
        nextLesson = module.subcourses.find(
          (lesson) => !completedLessonIds.includes(lesson._id)
        );
        if (nextLesson) break;
      }
    }

    return nextLesson ? nextLesson.title : "Course Completed";
  };

  // Modern media renderer
  const renderCourseMedia = (course) => {
    const thumbnail = course.thumbnail;
    
    if (!thumbnail) {
      return (
        <div className="w-full h-40 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center group-hover:shadow-md transition-all duration-300">
          <div className="text-center">
            <BookOpen className="h-6 w-6 text-blue-400 mx-auto mb-1" />
            <span className="text-xs text-blue-600 font-medium">Course Preview</span>
          </div>
        </div>
      );
    }

    const isVideo = thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i);
    
    return (
      <div className="w-full h-40 rounded-lg border border-blue-200 overflow-hidden relative group/media">
        {isVideo ? (
          <video
            src={thumbnail}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-105"
            muted
            preload="metadata"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentElement.querySelector('.media-fallback') || document.createElement('div');
              fallback.className = 'media-fallback absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center';
              fallback.innerHTML = '<div class="text-center"><Video className="h-6 w-6 text-blue-400 mx-auto mb-1" /><span class="text-xs text-blue-600 font-medium">Video Course</span></div>';
              if (!e.target.parentElement.querySelector('.media-fallback')) {
                e.target.parentElement.appendChild(fallback);
              }
            }}
          />
        ) : (
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentElement.querySelector('.media-fallback') || document.createElement('div');
              fallback.className = 'media-fallback absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center';
              fallback.innerHTML = '<div class="text-center"><ImageIcon className="h-6 w-6 text-blue-400 mx-auto mb-1" /><span class="text-xs text-blue-600 font-medium">Course Image</span></div>';
              if (!e.target.parentElement.querySelector('.media-fallback')) {
                e.target.parentElement.appendChild(fallback);
              }
            }}
          />
        )}
        
        {/* Play overlay for videos */}
        {isVideo && (
          <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover/media:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center transform scale-75 group-hover/media:scale-100 transition-transform duration-300 shadow-md">
              <Play className="h-4 w-4 text-blue-600 fill-current" />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced stats with new color scheme
  const stats = [
    {
      icon: BookOpen,
      label: "Total Courses",
      value: enrollmentsWithProgress.length,
      description: "Courses enrolled",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-700"
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: enrollmentsWithProgress.filter(e => e.completionPercentage === 100).length,
      description: "Courses finished",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      textColor: "text-green-700"
    },
    {
      icon: TrendingUp,
      label: "In Progress",
      value: enrollmentsWithProgress.filter(e => e.completionPercentage > 0 && e.completionPercentage < 100).length,
      description: "Active learning",
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
      borderColor: "border-red-200",
      textColor: "text-red-700"
    },
    {
      icon: Award,
      label: "Avg Progress",
      value: `${Math.round(
        enrollmentsWithProgress.reduce((total, e) => total + e.completionPercentage, 0) /
        (enrollmentsWithProgress.length || 1)
      )}%`,
      description: "Overall progress",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      textColor: "text-purple-700"
    },
  ];

  const filterButtons = [
    { 
      key: "all", 
      label: "All Courses", 
      count: enrollmentsWithProgress.length,
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300",
      activeColor: "bg-blue-600 text-white border-blue-700"
    },
    { 
      key: "in-progress", 
      label: "In Progress", 
      count: enrollmentsWithProgress.filter(e => e.completionPercentage > 0 && e.completionPercentage < 100).length,
      color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
      activeColor: "bg-red-600 text-white border-red-700"
    },
    { 
      key: "completed", 
      label: "Completed", 
      count: enrollmentsWithProgress.filter(e => e.completionPercentage === 100).length,
      color: "bg-green-100 hover:bg-green-200 text-green-700 border-green-300",
      activeColor: "bg-green-600 text-white border-green-700"
    },
  ];

  // Get card background color based on progress
  const getCardBackground = (completionPercentage) => {
    if (completionPercentage === 100) {
      return "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300";
    } else if (completionPercentage > 0 && completionPercentage < 100) {
      return "bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300";
    } else {
      return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300";
    }
  };

  // Enhanced loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="mt-6 text-blue-600 font-medium">Loading your learning journey...</div>
          <div className="mt-2 text-sm text-blue-500">We're preparing your courses</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Access Required</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-medium inline-flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Login to Continue
          </Link>
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6 border border-blue-200">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700 font-medium text-sm">Learning Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            My Learning Journey
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>. 
            Continue your progress and achieve your learning goals.
          </p>
        </div>

        {/* Stats Overview */}
        {enrollments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, index) => (
              <div 
                key={`stat-${index}`} 
                className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-4 border ${stat.borderColor} hover:shadow-md transition-all duration-300 group cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-slate-900 mb-1 group-hover:scale-105 transition-transform duration-200">{stat.value}</p>
                    <p className={`text-xs font-semibold ${stat.textColor} mb-1`}>{stat.label}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Section Header with Filters */}
          <div className="p-5 md:p-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  My Courses
                </h2>
                <p className="text-sm text-slate-600">
                  Manage your enrolled courses and track learning progress
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden bg-blue-100 text-blue-700 px-3 py-2 rounded-lg font-medium inline-flex items-center gap-2 text-sm border border-blue-200"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>

                {/* Filter Buttons - Desktop */}
                <div className="hidden lg:flex flex-wrap gap-2">
                  {filterButtons.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        activeFilter === filter.key
                          ? filter.activeColor
                          : filter.color
                      }`}
                    >
                      {filter.label}
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                        activeFilter === filter.key ? "bg-white/20" : "bg-white/80"
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>

                <Link
                  to="/courses"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium inline-flex items-center gap-2 text-sm whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  <BookOpen className="h-4 w-4" />
                  Browse Courses
                </Link>
              </div>
            </div>

            {/* Mobile Filter Dropdown */}
            {showMobileFilters && (
              <div className="lg:hidden mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  {filterButtons.map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => {
                        setActiveFilter(filter.key);
                        setShowMobileFilters(false);
                      }}
                      className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        activeFilter === filter.key
                          ? filter.activeColor
                          : filter.color
                      }`}
                    >
                      {filter.label}
                      <span className={`ml-1 px-1 py-0.5 rounded-full text-xs ${
                        activeFilter === filter.key ? "bg-white/20" : "bg-white/80"
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Courses Content */}
          <div className="p-5 md:p-6">
            {filteredEnrollments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                  <BookOpen className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {activeFilter === "all" ? "No courses yet" : `No ${activeFilter.replace('-', ' ')} courses`}
                </h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto text-sm">
                  {activeFilter === "all" 
                    ? "Start your learning journey by enrolling in your first course."
                    : `You don't have any ${activeFilter.replace('-', ' ')} courses at the moment.`
                  }
                </p>
                <Link
                  to="/courses"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all font-medium inline-flex items-center gap-2 text-sm shadow-sm hover:shadow-md"
                >
                  <Sparkles className="h-4 w-4" />
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEnrollments.map((enrollment) => {
                  const progressPercent = enrollment.completionPercentage || 0;
                  const isCompleted = progressPercent === 100;
                  const totalLessons = enrollment.course.modules?.flatMap(module => module.subcourses || []).length || 0;
                  const completedCount = enrollment.completedLessons?.length || 0;
                  const isHoveredCard = isHovered === enrollment._id;

                  return (
                    <div
                      key={`enrollment-${enrollment._id}`}
                      className={`group rounded-lg border p-4 transition-all duration-300 hover:shadow-md ${getCardBackground(progressPercent)}`}
                      onMouseEnter={() => setIsHovered(enrollment._id)}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Course Media */}
                        <div className="flex-shrink-0 lg:w-40">
                          {renderCourseMedia(enrollment.course)}
                        </div>

                        {/* Course Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors line-clamp-2 flex-1">
                                  {enrollment.course.title}
                                </h3>
                                {isCompleted && (
                                  <div className="flex-shrink-0 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-green-200">
                                    <CheckCircle className="h-3 w-3" />
                                    Completed
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                                <div className="flex items-center gap-1 text-slate-600">
                                  <Users className="h-3 w-3" />
                                  <span className="font-medium">{enrollment.course.instructor || "Expert Instructor"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-600">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{totalLessons} lessons</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-600">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>{completedCount} completed</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Progress Section */}
                          <div className="space-y-3">
                            {/* Progress Bar */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-700">
                                  Course Progress
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {progressPercent}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full transition-all duration-700 ${
                                    isCompleted
                                      ? "bg-green-500"
                                      : progressPercent > 0
                                        ? "bg-red-500"
                                        : "bg-blue-500"
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Next Lesson & Action */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-300/50">
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Target className="h-3 w-3 text-slate-400" />
                                <span className="font-medium text-slate-700">Next:</span>
                                <span className="text-slate-900 font-medium">{getNextLesson(enrollment)}</span>
                              </div>

                              <Link
                                to={`/courses/${enrollment.course._id}/learn`}
                                className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-300 flex items-center gap-2 min-w-[140px] justify-center shadow-sm hover:shadow-md ${
                                  isCompleted
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : progressPercent > 0
                                      ? "bg-red-600 text-white hover:bg-red-700"
                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                              >
                                <Play className="h-3 w-3" />
                                {isCompleted ? "Review Course" : "Continue Learning"}
                                <ChevronRight className="h-3 w-3" />
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
          </div>

          {/* Footer */}
          {filteredEnrollments.length > 0 && (
            <div className="px-5 md:px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
                <div className="text-center sm:text-left">
                  Showing <span className="font-semibold text-slate-900">{filteredEnrollments.length}</span> of{" "}
                  <span className="font-semibold text-slate-900">{enrollmentsWithProgress.length}</span> courses
                </div>
                <div className="flex flex-wrap justify-center sm:justify-end gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>All: {enrollmentsWithProgress.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span>In Progress: {enrollmentsWithProgress.filter(e => e.completionPercentage > 0 && e.completionPercentage < 100).length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Completed: {enrollmentsWithProgress.filter(e => e.completionPercentage === 100).length}</span>
                  </div>
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