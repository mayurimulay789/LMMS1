"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { Play, BookOpen, CheckCircle } from "lucide-react";

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);

  const fetchEnrollmentsWithProgress = async () => {
    try {
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

            const completedLessons = progressRes.data.progress.completedLessons || [];
            const totalLessons = enrollment.course.lessons?.length || 1; // avoid division by 0
            const completionPercentage = Math.round(
              (completedLessons.length / totalLessons) * 100
            );

            return {
              ...enrollment,
              completedLessons,
              completionPercentage,
            };
          } catch {
            return { ...enrollment, completedLessons: [], completionPercentage: 0 };
          }
        })
      );

      setEnrollments(coursesWithProgress);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentsWithProgress();
    const interval = setInterval(fetchEnrollmentsWithProgress, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, [token]);

  const getNextLesson = (enrollment) => {
    if (!enrollment.course.lessons) return "Introduction";
    const completedLessonIds = enrollment.completedLessons.map((l) => l.lessonId);
    const nextLesson = enrollment.course.lessons.find(
      (lesson) => !completedLessonIds.includes(lesson._id)
    );
    return nextLesson ? nextLesson.title : "Completed";
  };

  if (loading)
    return <div className="p-10 text-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3 md:gap-0">
          <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
          <Link
            to="/courses"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Browse More →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No courses yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start your learning journey by enrolling in a course
            </p>
            <Link
              to="/courses"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-medium"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {enrollments.map((enrollment) => {
              const progressPercent = enrollment.completionPercentage || 0;
              const isCompleted = progressPercent === 100;

              return (
                <div
                  key={enrollment._id}
                  className="bg-gray-50 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-200 flex items-center gap-5 p-5 md:p-7"
                >
                  <img
                    src={enrollment.course.thumbnail || "/placeholder.svg"}
                    alt={enrollment.course.title}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-lg object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 line-clamp-2">
                      {enrollment.course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      By {enrollment.course.instructor}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {progressPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isCompleted ? "bg-green-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Next Lesson & Continue */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm md:text-base text-gray-600 font-medium">
                        Next:{" "}
                        <span className="text-gray-800">{getNextLesson(enrollment)}</span>
                      </div>
                      <Link
                        to={`/courses/${enrollment.course._id}/learn`}
                        className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm md:text-base font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                      >
                        <Play className="h-4 w-4" />
                        Continue
                      </Link>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-6 w-6 text-green-600 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
