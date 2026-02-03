// "use client";

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import { 
//   Play, 
//   BookOpen, 
//   CheckCircle, 
//   Image as ImageIcon, 
//   Video,
//   Clock, 
//   Award, 
//   TrendingUp,
//   ArrowRight,
//   Star,
//   Calendar,
//   BarChart3,
//   Target,
//   Sparkles,
//   Users,
//   Bookmark,
//   ChevronRight,
//   Zap,
//   Trophy,
//   Clock3,
//   Filter
// } from "lucide-react";
// import { fetchUserEnrollments, fetchUserProgress, clearError } from "../store/slices/enrollmentSlice";

// const MyCoursesPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user, token } = useSelector((state) => state.auth);
//   const { enrollments = [], progress, isLoading, error } = useSelector((state) => state.enrollment);
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [isHovered, setIsHovered] = useState(null);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);

//   useEffect(() => {
//     if (token && user) {
//       dispatch(fetchUserEnrollments());
//     }
//   }, [dispatch, token, user]);

//   useEffect(() => {
//     if (enrollments.length > 0) {
//       enrollments.forEach((enrollment, index) => {
//         if (enrollment?.course?._id) {
//           setTimeout(() => {
//             dispatch(fetchUserProgress(enrollment.course._id));
//           }, index * 200);
//         }
//       });
//     }
//   }, [dispatch, enrollments]);

//   // Combine enrollments with progress data
//   const enrollmentsWithProgress = enrollments.map(enrollment => ({
//     ...enrollment,
//     completedLessons: progress[enrollment.course._id]?.completedLessons || [],
//     completionPercentage: progress[enrollment.course._id]?.completionPercentage || 0,
//   }));

//   // Filter courses based on active filter
//   const filteredEnrollments = enrollmentsWithProgress.filter(enrollment => {
//     switch (activeFilter) {
//       case "in-progress":
//         return enrollment.completionPercentage > 0 && enrollment.completionPercentage < 100;
//       case "completed":
//         return enrollment.completionPercentage === 100;
//       case "not-started":
//         return enrollment.completionPercentage === 0;
//       default:
//         return true;
//     }
//   });

//   // Add "Not Started" filter button data
//   const filterButtons = [
//     { 
//       key: "all", 
//       label: "All Courses", 
//       count: enrollmentsWithProgress.length,
//       color: "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300",
//       activeColor: "bg-blue-600 text-white border-blue-700"
//     },
//     { 
//       key: "in-progress", 
//       label: "In Progress", 
//       count: enrollmentsWithProgress.filter(e => e.completionPercentage > 0 && e.completionPercentage < 100).length,
//       color: "bg-red-100 hover:bg-red-200 text-red-700 border-red-300",
//       activeColor: "bg-red-600 text-white border-red-700"
//     },
//     { 
//       key: "completed", 
//       label: "Completed", 
//       count: enrollmentsWithProgress.filter(e => e.completionPercentage === 100).length,
//       color: "bg-green-100 hover:bg-green-200 text-green-700 border-green-300",
//       activeColor: "bg-green-600 text-white border-green-700"
//     },
//     {
//       key: "not-started",
//       label: "Not Started",
//       count: enrollmentsWithProgress.filter(e => e.completionPercentage === 0).length,
//       color: "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300",
//       activeColor: "bg-gray-600 text-white border-gray-700"
//     },
//   ];

//   // Get card background color based on progress
//   const getCardBackground = (completionPercentage) => {
//     if (completionPercentage === 100) {
//       return "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300";
//     } else if (completionPercentage > 0 && completionPercentage < 100) {
//       return "bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300";
//     } else {
//       return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300";
//     }
//   };

//   // getNextLesson supports both lessons and modules with subcourses
//   const getNextLesson = (enrollment) => {
//     const course = enrollment.course;
//     const completedLessonIds = enrollment.completedLessons?.map(l => l.lessonId) || [];

//     if (course.lessons && course.lessons.length > 0) {
//       const nextLesson = course.lessons.find(lesson => !completedLessonIds.includes(lesson._id));
//       return nextLesson ? nextLesson.title : "Course Completed";
//     }

//     if (course.modules && course.modules.length > 0) {
//       for (const module of course.modules) {
//         if (module.subcourses && module.subcourses.length > 0) {
//           const nextLesson = module.subcourses.find(lesson => !completedLessonIds.includes(lesson._id));
//           if (nextLesson) return nextLesson.title;
//         }
//       }
//     }

//     return "Introduction";
//   };

//   // Render course media with fallback
//   const renderCourseMedia = (course) => {
//     const thumbnail = course.thumbnail;

//     if(!thumbnail) {
//       return (
//         <div className="flex items-center justify-center w-full h-40 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
//           <div className="text-center">
//             <BookOpen className="w-6 h-6 mx-auto mb-1 text-blue-400" />
//             <span className="text-xs font-medium text-blue-600">Course Preview</span>
//           </div>
//         </div>
//       );
//     }

//     const isVideo = thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i);

//     return (
//       <div className="relative w-full h-40 overflow-hidden border border-blue-200 rounded-lg group/media">
//         {isVideo ? (
//           <video
//             src={thumbnail}
//             className="object-cover w-full h-full transition-transform duration-500 group-hover/media:scale-105"
//             muted
//             preload="metadata"
//             onError={e => {
//               e.target.style.display = "none";
//               const fallback = e.target.parentElement.querySelector(".media-fallback") || document.createElement("div");
//               fallback.className = "absolute inset-0 flex items-center justify-center media-fallback bg-gradient-to-br from-blue-50 to-blue-100";
//               fallback.innerHTML = '<div class="text-center"><Video class="h-6 w-6 text-blue-400 mx-auto mb-1" /><span class="text-xs text-blue-600 font-medium">Video Course</span></div>';
//               if(!e.target.parentElement.querySelector(".media-fallback")){
//                 e.target.parentElement.appendChild(fallback);
//               }
//             }}
//           />
//         ) : (
//           <img
//             src={thumbnail}
//             alt={course.title}
//             className="object-cover w-full h-full transition-transform duration-500 group-hover/media:scale-105"
//             onError={e => {
//               e.target.style.display = "none";
//               const fallback = e.target.parentElement.querySelector(".media-fallback") || document.createElement("div");
//               fallback.className = "absolute inset-0 flex items-center justify-center media-fallback bg-gradient-to-br from-blue-50 to-blue-100";
//               fallback.innerHTML = '<div class="text-center"><ImageIcon class="h-6 w-6 text-blue-400 mx-auto mb-1" /><span class="text-xs text-blue-600 font-medium">Course Image</span></div>';
//               if(!e.target.parentElement.querySelector(".media-fallback")){
//                 e.target.parentElement.appendChild(fallback);
//               }
//             }}
//           />
//         )}
//       </div>
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen p-4 bg-white">
//         <div className="text-center">
//           <div className="relative inline-block">
//             <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
//           </div>
//           <div className="mt-6 font-medium text-blue-600">Loading your learning journey...</div>
//           <div className="mt-2 text-sm text-blue-500">We're preparing your courses</div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen p-6 bg-white">
//         <div className="max-w-md text-center">
//           <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-2xl">
//             <BookOpen className="w-10 h-10 text-blue-600" />
//           </div>
//           <h3 className="mb-3 text-xl font-semibold text-slate-900">Access Required</h3>
//           <p className="mb-6 text-slate-600">{error}</p>
//           <Link
//             to="/login"
//             className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700"
//           >
//             <ArrowRight className="w-4 h-4" />
//             Login to Continue
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white">
//       <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
//         {/* Header Section */}
//         <div className="mb-10 text-center">
//           <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-blue-200 rounded-full bg-blue-50">
//             <Sparkles className="w-4 h-4 text-blue-600" />
//             <span className="text-sm font-medium text-blue-700">Learning Dashboard</span>
//           </div>
//           <h1 className="mb-3 text-2xl font-bold md:text-3xl text-slate-900">
//             My Learning Journey
//           </h1>
//           <p className="max-w-2xl mx-auto text-base text-slate-600">
//             Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>. 
//             Continue your progress and achieve your learning goals.
//           </p>
//         </div>

//         {/* Stats Overview */}
//         {enrollmentsWithProgress.length > 0 && (
//           <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-2 lg:grid-cols-4">
//             {[
//               {
//                 icon: BookOpen,
//                 label: "Total Courses",
//                 value: enrollmentsWithProgress.length,
//                 description: "Courses enrolled",
//                 color: "from-blue-500 to-blue-600",
//                 bgColor: "from-blue-50 to-blue-100",
//                 borderColor: "border-blue-200",
//                 textColor: "text-blue-700"
//               },
//               {
//                 icon: CheckCircle,
//                 label: "Completed",
//                 value: enrollmentsWithProgress.filter(e => e.completionPercentage === 100).length,
//                 description: "Courses finished",
//                 color: "from-green-500 to-green-600",
//                 bgColor: "from-green-50 to-green-100",
//                 borderColor: "border-green-200",
//                 textColor: "text-green-700"
//               },
//               {
//                 icon: TrendingUp,
//                 label: "In Progress",
//                 value: enrollmentsWithProgress.filter(e => e.completionPercentage > 0 && e.completionPercentage < 100).length,
//                 description: "Active learning",
//                 color: "from-red-500 to-red-600",
//                 bgColor: "from-red-50 to-red-100",
//                 borderColor: "border-red-200",
//                 textColor: "text-red-700"
//               },
//               {
//                 icon: Award,
//                 label: "Avg Progress",
//                 value: `${Math.round(
//                   enrollmentsWithProgress.reduce((total, e) => total + e.completionPercentage, 0) /
//                   (enrollmentsWithProgress.length || 1)
//                 )}%`,
//                 description: "Overall progress",
//                 color: "from-purple-500 to-purple-600",
//                 bgColor: "from-purple-50 to-purple-100",
//                 borderColor: "border-purple-200",
//                 textColor: "text-purple-700"
//               },
//             ].map((stat, index) => (
//               <div 
//                 key={`stat-${index}`} 
//                 className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-4 border ${stat.borderColor} hover:shadow-md transition-all duration-300 group cursor-pointer`}
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="mb-1 text-xl font-bold transition-transform duration-200 text-slate-900 group-hover:scale-105">{stat.value}</p>
//                     <p className={`text-xs font-semibold ${stat.textColor} mb-1`}>{stat.label}</p>
//                     <p className="text-xs text-slate-500">{stat.description}</p>
//                   </div>
//                   <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
//                     <stat.icon className="w-5 h-5 text-white" />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Filters and content */}
//         <div className="bg-white border shadow-sm rounded-xl border-slate-200">
//           <div className="flex flex-col gap-4 p-5 border-b md:p-6 border-slate-200 lg:flex-row lg:items-center lg:justify-between">
//             <div>
//               <h2 className="mb-1 text-xl font-bold text-slate-900">My Courses</h2>
//               <p className="text-sm text-slate-600">Manage your enrolled courses and track learning progress</p>
//             </div>

//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setShowMobileFilters(!showMobileFilters)}
//                 className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-lg lg:hidden"
//               >
//                 <Filter className="w-4 h-4" />
//                 Filters
//               </button>
//               <div className="flex-wrap hidden gap-2 lg:flex">
//                 {filterButtons.map(filter => (
//                   <button
//                     key={filter.key}
//                     onClick={() => setActiveFilter(filter.key)}
//                     className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
//                       activeFilter === filter.key ? filter.activeColor : filter.color
//                     }`}
//                   >
//                     {filter.label}
//                     <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
//                       activeFilter === filter.key ? "bg-white/20" : "bg-white/80"
//                     }`}>
//                       {filter.count}
//                     </span>
//                   </button>
//                 ))}
//               </div>

//               <Link
//                 to="/courses"
//                 className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 whitespace-nowrap hover:shadow-md"
//               >
//                 <BookOpen className="w-4 h-4" />
//                 Browse Courses
//               </Link>
//             </div>
//           </div>

//           {showMobileFilters && (
//             <div className="p-3 mt-3 border rounded-lg lg:hidden bg-slate-50 border-slate-200">
//               <div className="grid grid-cols-2 gap-2">
//                 {filterButtons.map(filter => (
//                   <button
//                     key={filter.key}
//                     onClick={() => {
//                       setActiveFilter(filter.key);
//                       setShowMobileFilters(false);
//                     }}
//                     className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
//                       activeFilter === filter.key ? filter.activeColor : filter.color
//                     }`}
//                   >
//                     {filter.label}
//                     <span className={`ml-1 px-1 py-0.5 rounded-full text-xs ${
//                       activeFilter === filter.key ? "bg-white/20" : "bg-white/80"
//                     }`}>
//                       {filter.count}
//                     </span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="p-5 md:p-6">
//             {filteredEnrollments.length === 0 ? (
//               <div className="py-12 text-center">
//                 <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 border border-blue-200 bg-blue-50 rounded-xl">
//                   <BookOpen className="w-8 h-8 text-blue-400" />
//                 </div>
//                 <h3 className="mb-2 text-lg font-semibold text-slate-900">
//                   {activeFilter === "all" ? "No courses yet" : `No ${activeFilter.replace('-', ' ')} courses`}
//                 </h3>
//                 <p className="max-w-md mx-auto mb-6 text-sm text-slate-600">
//                   {activeFilter === "all" 
//                     ? "Start your learning journey by enrolling in your first course."
//                     : `You don't have any ${activeFilter.replace('-', ' ')} courses at the moment.`}
//                 </p>
//                 <Link
//                   to="/courses"
//                   className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md"
//                 >
//                   <Sparkles className="w-4 h-4" />
//                   Explore Courses
//                 </Link>
//               </div>
//             ) : (
//               <div className="grid gap-4">
//                 {filteredEnrollments.map(enrollment => {
//                   const progressPercent = enrollment.completionPercentage || 0;
//                   const isCompleted = progressPercent === 100;
//                   const totalLessons = enrollment.course.lessons?.length ||
//                                         enrollment.course.modules?.flatMap(m => m.subcourses || []).length || 0;
//                   const completedCount = enrollment.completedLessons?.length || 0;

//                   return (
//                     <div
//                       key={`enrollment-${enrollment._id}`}
//                       className={`group rounded-lg border p-4 transition-all duration-300 hover:shadow-md ${getCardBackground(progressPercent)}`}
//                       onMouseEnter={() => setIsHovered(enrollment._id)}
//                       onMouseLeave={() => setIsHovered(null)}
//                     >
//                       <div className="flex flex-col gap-4 lg:flex-row">
//                         <div className="flex-shrink-0 lg:w-40">
//                           {renderCourseMedia(enrollment.course)}
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           <div className="flex flex-col gap-3 mb-3 lg:flex-row lg:items-start lg:justify-between">
//                             <div className="flex-1 min-w-0">
//                               <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between">
//                                 <h3 className="flex-1 text-lg font-bold transition-colors text-slate-900 group-hover:text-slate-800 line-clamp-2">
//                                   {enrollment.course.title}
//                                 </h3>
//                                 {isCompleted && (
//                                   <div className="flex items-center flex-shrink-0 gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full">
//                                     <CheckCircle className="w-3 h-3" />
//                                     Completed
//                                   </div>
//                                 )}
//                               </div>

//                               <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
//                                 <div className="flex items-center gap-1 text-slate-600">
//                                   <Users className="w-3 h-3" />
//                                   <span className="font-medium">{enrollment.course.instructor || "Expert Instructor"}</span>
//                                 </div>
//                                 <div className="flex items-center gap-1 text-slate-600">
//                                   <BookOpen className="w-3 h-3" />
//                                   <span>{totalLessons} lessons</span>
//                                 </div>
//                                 <div className="flex items-center gap-1 text-slate-600">
//                                   <CheckCircle className="w-3 h-3 text-green-500" />
//                                   <span>{completedCount} completed</span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="space-y-3">
//                             <div>
//                               <div className="flex items-center justify-between mb-1">
//                                 <span className="text-xs font-medium text-slate-700">
//                                   Course Progress
//                                 </span>
//                                 <span className="text-xs font-bold text-slate-900">
//                                   {progressPercent}%
//                                 </span>
//                               </div>
//                               <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
//                                 <div
//                                   className={`h-1.5 rounded-full transition-all duration-700 ${
//                                     isCompleted
//                                       ? "bg-green-500"
//                                       : progressPercent > 0
//                                         ? "bg-red-500"
//                                         : "bg-blue-500"
//                                   }`}
//                                   style={{ width: `${progressPercent}%` }}
//                                 />
//                               </div>
//                             </div>

//                             <div className="flex flex-col justify-between gap-3 pt-3 border-t sm:flex-row sm:items-center border-slate-300/50">
//                               <div className="flex items-center gap-2 text-xs text-slate-600">
//                                 <Target className="w-3 h-3 text-slate-400" />
//                                 <span className="font-medium text-slate-700">Next:</span>
//                                 <span className="font-medium text-slate-900">{getNextLesson(enrollment)}</span>
//                               </div>

//                               <Link
//                                 to={`/courses/${enrollment.course._id}/learn`}
//                                 className={`px-4 py-2 rounded-lg font-medium text-xs transition-all duration-300 flex items-center gap-2 min-w-[140px] justify-center shadow-sm hover:shadow-md ${
//                                   isCompleted
//                                     ? "bg-green-600 text-white hover:bg-green-700"
//                                     : progressPercent > 0
//                                       ? "bg-red-600 text-white hover:bg-red-700"
//                                       : "bg-blue-600 text-white hover:bg-blue-700"
//                                 }`}
//                               >
//                                 <Play className="w-3 h-3" />
//                                 {isCompleted ? "Review Course" : "Continue Learning"}
//                                 <ChevronRight className="w-3 h-3" />
//                               </Link>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyCoursesPage;


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
  const { enrollments = [], progress, isLoading, error } = useSelector((state) => state.enrollment);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isHovered, setIsHovered] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // useEffect(() => {
  //   if (token && user) {
  //     dispatch(fetchUserEnrollments());
  //   }
  // }, [dispatch, token, user]);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserEnrollments());
    }
  }, [dispatch, user]);

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

  // Add "Not Started" filter button data
  const filterButtons = [
    { 
      key: "all", 
      label: "All Courses", 
      count: enrollmentsWithProgress.length,
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300",
      activeColor: "bg-primary-600 text-white border-primay-700"
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
    {
      key: "not-started",
      label: "Not Started",
      count: enrollmentsWithProgress.filter(e => e.completionPercentage === 0).length,
      color: "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300",
      activeColor: "bg-gray-600 text-white border-gray-700"
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

  // getNextLesson supports both lessons and modules with subcourses
  const getNextLesson = (enrollment) => {
    const course = enrollment.course;
    const completedLessonIds = enrollment.completedLessons?.map(l => l.lessonId) || [];

    if (course.lessons && course.lessons.length > 0) {
      const nextLesson = course.lessons.find(lesson => !completedLessonIds.includes(lesson._id));
      return nextLesson ? nextLesson.title : "Course Completed";
    }

    if (course.modules && course.modules.length > 0) {
      for (const module of course.modules) {
        if (module.subcourses && module.subcourses.length > 0) {
          const nextLesson = module.subcourses.find(lesson => !completedLessonIds.includes(lesson._id));
          if (nextLesson) return nextLesson.title;
        }
      }
    }

    return "Introduction";
  };

  // Render course media with fallback
  const renderCourseMedia = (course) => {
    const thumbnail = course.thumbnail;

    if(!thumbnail) {
      return (
        <div className="flex items-center justify-center w-full h-40 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-1 text-blue-400" />
            <span className="text-xs font-medium text-blue-600">Course Preview</span>
          </div>
        </div>
      );
    }

    const isVideo = thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i);

    return (
      <div className="relative w-full h-40 overflow-hidden border border-blue-200 rounded-lg group/media">
        {isVideo ? (
          <video
            src={thumbnail}
            className="object-cover w-full h-full transition-transform duration-500 group-hover/media:scale-105"
            muted
            preload="metadata"
            onError={e => {
              e.target.style.display = "none";
              const fallback = e.target.parentElement.querySelector(".media-fallback") || document.createElement("div");
              fallback.className = "absolute inset-0 flex items-center justify-center media-fallback bg-gradient-to-br from-blue-50 to-blue-100";
              fallback.innerHTML = '<div class="text-center"><Video class="h-6 w-6 text-blue-400 mx-auto mb-1" /><span class="text-xs text-blue-600 font-medium">Video Course</span></div>';
              if(!e.target.parentElement.querySelector(".media-fallback")){
                e.target.parentElement.appendChild(fallback);
              }
            }}
          />
        ) : (
          <img
            src={thumbnail}
            alt={course.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover/media:scale-105"
            onError={e => {
              e.target.style.display = "none";
              const fallback = e.target.parentElement.querySelector(".media-fallback") || document.createElement("div");
              fallback.className = "absolute inset-0 flex items-center justify-center media-fallback bg-gradient-to-br from-blue-50 to-blue-100";
              fallback.innerHTML = '<div class="text-center"><ImageIcon class="h-6 w-6 text-blue-400 mx-auto mb-1" /><span class="text-xs text-blue-600 font-medium">Course Image</span></div>';
              if(!e.target.parentElement.querySelector(".media-fallback")){
                e.target.parentElement.appendChild(fallback);
              }
            }}
          />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-white">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <div className="mt-6 font-medium text-blue-600">Loading your learning journey...</div>
          <div className="mt-2 text-sm text-blue-500">We're preparing your courses</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-white">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-2xl">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-slate-900">Access Required</h3>
          <p className="mb-6 text-slate-600">{error}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <ArrowRight className="w-4 h-4" />
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 text-center">
          
          <h1 className="mb-3 text-2xl font-bold md:text-3xl text-slate-900">
            My Learning Journey
          </h1>
          <p className="max-w-2xl mx-auto text-base text-slate-600">
            Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>. 
            Continue your progress and achieve your learning goals.
          </p>
        </div>

        {/* Stats Overview */}
        {enrollmentsWithProgress.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mb-10 md:grid-cols-2 lg:grid-cols-4">
            {[
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
            ].map((stat, index) => (
              <div 
                key={`stat-${index}`} 
                className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-4 border ${stat.borderColor} hover:shadow-md transition-all duration-300 group cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-xl font-bold transition-transform duration-200 text-slate-900 group-hover:scale-105">{stat.value}</p>
                    <p className={`text-xs font-semibold ${stat.textColor} mb-1`}>{stat.label}</p>
                    <p className="text-xs text-slate-500">{stat.description}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters and content */}
        <div className="bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex flex-col gap-4 p-5 border-b md:p-6 border-slate-200 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="mb-1 text-xl font-bold text-slate-900">My Courses</h2>
              <p className="text-sm text-slate-600">Manage your enrolled courses and track learning progress</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-lg lg:hidden"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <div className="flex-wrap hidden gap-2 lg:flex">
                {filterButtons.map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      activeFilter === filter.key ? filter.activeColor : filter.color
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
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 whitespace-nowrap hover:shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                Browse Courses
              </Link>
            </div>
          </div>

          {showMobileFilters && (
            <div className="p-3 mt-3 border rounded-lg lg:hidden bg-slate-50 border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                {filterButtons.map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => {
                      setActiveFilter(filter.key);
                      setShowMobileFilters(false);
                    }}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      activeFilter === filter.key ? filter.activeColor : filter.color
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

          <div className="p-5 md:p-6">
            {filteredEnrollments.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 border border-blue-200 bg-blue-50 rounded-xl">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {activeFilter === "all" ? "No courses yet" : `No ${activeFilter.replace('-', ' ')} courses`}
                </h3>
                <p className="max-w-md mx-auto mb-6 text-sm text-slate-600">
                  {activeFilter === "all" 
                    ? "Start your learning journey by enrolling in your first course."
                    : `You don't have any ${activeFilter.replace('-', ' ')} courses at the moment.`}
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEnrollments.map(enrollment => {
                  const progressPercent = enrollment.completionPercentage || 0;
                  const isCompleted = progressPercent === 100;
                  const totalLessons = enrollment.course.lessons?.length ||
                                        enrollment.course.modules?.flatMap(m => m.subcourses || []).length || 0;
                  const completedCount = enrollment.completedLessons?.length || 0;

                  return (
                    <div
                      key={`enrollment-${enrollment._id}`}
                      className={`group rounded-lg border p-4 transition-all duration-300 hover:shadow-md ${getCardBackground(progressPercent)}`}
                      onMouseEnter={() => setIsHovered(enrollment._id)}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row">
                        <div className="flex-shrink-0 lg:w-40">
                          {renderCourseMedia(enrollment.course)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-3 mb-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between">
                                <h3 className="flex-1 text-lg font-bold transition-colors text-slate-900 group-hover:text-slate-800 line-clamp-2">
                                  {enrollment.course.title}
                                </h3>
                                {isCompleted && (
                                  <div className="flex items-center flex-shrink-0 gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    Completed
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
                                <div className="flex items-center gap-1 text-slate-600">
                                  <Users className="w-3 h-3" />
                                  <span className="font-medium">{enrollment.course.instructor || "Expert Instructor"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-600">
                                  <BookOpen className="w-3 h-3" />
                                  <span>{totalLessons} lessons</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-600">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span>{completedCount} completed</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
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
                                />
                              </div>
                            </div>

                            <div className="flex flex-col justify-between gap-3 pt-3 border-t sm:flex-row sm:items-center border-slate-300/50">
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Target className="w-3 h-3 text-slate-400" />
                                <span className="font-medium text-slate-700">Next:</span>
                                <span className="font-medium text-slate-900">{getNextLesson(enrollment)}</span>
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
                                <Play className="w-3 h-3" />
                                {isCompleted ? "Review Course" : "Continue Learning"}
                                <ChevronRight className="w-3 h-3" />
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
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;