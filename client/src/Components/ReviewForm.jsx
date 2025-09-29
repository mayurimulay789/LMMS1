import { useState } from "react"

const ReviewForm = ({ courseId, onReviewSubmitted}) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)

    const token = localStorage.getItem("token")
  const isAuthenticated = !!token

  const submitReview = async (rating, comment) => {
  
    const response = await fetch(`/api/courseReviews/${courseId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to submit review")
    }

    return response.json()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0 || !comment.trim()) {
      return alert("Please provide rating and comment")
    }

    setLoading(true)
    try {
      await submitReview(rating, comment.trim())
      setRating(0)
      setComment("")
      if (onReviewSubmitted) onReviewSubmitted()
    } catch (error) {
      console.error("Error submitting review:", error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <p className="text-gray-600">Please log in to submit a review.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <div>
        <label className="block mb-1 font-medium">Rating</label>
        
       
        <fieldset className="starability-basic">
          <input
            type="radio"
            id="no-rate"
            className="input-no-rate"
            name="review[rating]"
            value="0"
            checked={rating === 0}
            onChange={(e) => setRating(Number(e.target.value))}
            aria-label="No rating."
          />
          <input
            type="radio"
            id="first-rate1"
            name="review[rating]"
            value="1"
            checked={rating === 1}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <label htmlFor="first-rate1" title="Terrible">1 star</label>

          <input
            type="radio"
            id="first-rate2"
            name="review[rating]"
            value="2"
            checked={rating === 2}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <label htmlFor="first-rate2" title="Not good">2 stars</label>

          <input
            type="radio"
            id="first-rate3"
            name="review[rating]"
            value="3"
            checked={rating === 3}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <label htmlFor="first-rate3" title="Average">3 stars</label>

          <input
            type="radio"
            id="first-rate4"
            name="review[rating]"
            value="4"
            checked={rating === 4}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <label htmlFor="first-rate4" title="Very good">4 stars</label>

          <input
            type="radio"
            id="first-rate5"
            name="review[rating]"
            value="5"
            checked={rating === 5}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <label htmlFor="first-rate5" title="Amazing">5 stars</label>
        </fieldset>
      </div>

      <div>
        <label className="block mb-1 font-medium">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Write your review..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}

export default ReviewForm
