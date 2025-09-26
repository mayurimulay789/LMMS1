"use client"

import { useState } from "react"
import { Star } from "lucide-react"

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
      const response = await fetch(`http://localhost:2000/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-bold">Write a Review</h3>
      
      {/* Star rating */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className={`cursor-pointer transition-colors ${
              (hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"
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
        placeholder="Write your review..."
        className="w-full border border-gray-300 rounded p-2"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}

export default ReviewForm
