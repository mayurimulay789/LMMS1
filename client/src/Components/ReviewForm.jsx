"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { apiRequest } from "../config/api"

const ReviewForm = ({ courseId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating || !comment) return alert("Please provide rating and comment")
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const response = await apiRequest(`courses/${courseId}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      })

      if (!response.ok) throw new Error("Failed to submit review")
      const data = await response.json()
      setRating(0)
      setComment("")
      if (onReviewSubmit) onReviewSubmit(data) // refresh parent
      alert("Review submitted successfully")
    } catch (error) {
      console.error(error)
      alert("Error submitting review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-bold">Write a Review</h3>
      
      {/* Star rating */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`cursor-pointer transition-colors w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${
              (hoverRating || rating) >= star ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      {/* Comment box */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows="4"
        placeholder="Write your reviews..."
        className="w-full border border-gray-300 rounded p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded text-sm sm:text-base font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}

export default ReviewForm