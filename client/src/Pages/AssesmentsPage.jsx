"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { fetchAssessments, submitAssessment } from "../store/slices/assesmentSlice"

const AssessmentsPage = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { assessments, results, isLoading, isSubmitting } = useSelector((state) => state.assessment)
  const [currentAssessment, setCurrentAssessment] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (courseId) {
      dispatch(fetchAssessments(courseId))
    }
  }, [dispatch, courseId])

  useEffect(() => {
    if (currentAssessment && currentAssessment.timeLimit) {
      setTimeRemaining(currentAssessment.timeLimit * 60) // Convert minutes to seconds
    }
  }, [currentAssessment])

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0) {
      handleSubmitAssessment()
    }
  }, [timeRemaining])

  const startAssessment = (assessment) => {
    setCurrentAssessment(assessment)
    setAnswers({})
    setCurrentQuestionIndex(0)
    setShowResults(false)
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitAssessment = async () => {
    if (currentAssessment) {
      const result = await dispatch(
        submitAssessment({
          assessmentId: currentAssessment._id,
          answers,
        }),
      )

      if (result.type === "assessment/submitAssessment/fulfilled") {
        setShowResults(true)
      }
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getResultForAssessment = (assessmentId) => {
    return results[assessmentId]
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-64 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="bg-gray-300 h-6 w-48 rounded mb-4"></div>
                  <div className="bg-gray-300 h-4 w-full rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Assessment Taking View
  if (currentAssessment && !showResults) {
    const currentQuestion = currentAssessment.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{currentAssessment.title}</h1>
              {timeRemaining !== null && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
                </span>
                <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{currentQuestion.question}</h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={option}
                    checked={answers[currentQuestion._id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-3">
              {currentQuestionIndex === currentAssessment.questions.length - 1 ? (
                <button
                  onClick={handleSubmitAssessment}
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Assessment</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Results View
  if (showResults && currentAssessment) {
    const result = getResultForAssessment(currentAssessment._id)

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-6">
              {result?.passed ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              )}

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {result?.passed ? "Congratulations!" : "Assessment Complete"}
              </h1>

              <p className="text-lg text-gray-600 mb-6">
                {result?.passed
                  ? "You have successfully passed this assessment!"
                  : "You can retake this assessment to improve your score."}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Your Score</p>
                  <p className="text-2xl font-bold text-gray-900">{result?.score}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Passing Score</p>
                  <p className="text-2xl font-bold text-gray-900">{currentAssessment.passingScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-2xl font-bold ${result?.passed ? "text-green-600" : "text-red-600"}`}>
                    {result?.passed ? "Passed" : "Failed"}
                  </p>
                </div>
              </div>
            </div>

            {result?.feedback && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Feedback</h3>
                <p className="text-blue-800">{result.feedback}</p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setCurrentAssessment(null)
                  setShowResults(false)
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Assessments
              </button>

              {!result?.passed && (
                <button
                  onClick={() => startAssessment(currentAssessment)}
                  className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Retake Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Assessment List View
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Assessments</h1>
          <p className="text-gray-600">Test your knowledge and track your progress</p>
        </div>

        {/* Assessments List */}
        {assessments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No assessments available</h3>
            <p className="text-gray-600">Assessments will appear here when they become available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assessments.map((assessment) => {
              const result = getResultForAssessment(assessment._id)

              return (
                <div key={assessment._id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{assessment.title}</h3>
                      <p className="text-gray-600 mb-4">{assessment.description}</p>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{assessment.timeLimit} minutes</span>
                        </div>
                        <div>
                          <span>{assessment.questions.length} questions</span>
                        </div>
                        <div>
                          <span>Passing score: {assessment.passingScore}%</span>
                        </div>
                      </div>

                      {result && (
                        <div className="flex items-center space-x-4 mb-4">
                          <div
                            className={`flex items-center space-x-2 ${result.passed ? "text-green-600" : "text-red-600"}`}
                          >
                            {result.passed ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            <span className="font-medium">
                              {result.passed ? "Passed" : "Failed"} - {result.score}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-6">
                      <button
                        onClick={() => startAssessment(assessment)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {result ? "Retake" : "Start"} Assessment
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AssessmentsPage
