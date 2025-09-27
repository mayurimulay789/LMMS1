const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const CourseReview = require("../models/CourseReview");
const auth = require("../middleware/auth");
const Enrollment = require("../models/Enrollment"); // check enrollment

// POST review
router.post("/:id/reviews", auth, async (req, res) => {
  const { rating, comment } = req.body;

  console.log("User:", req.user);
  console.log("Course ID:", req.params.id);
  console.log("Body:", req.body);

  if (rating <= 0 || !comment?.trim()) {
  return res.status(400).json({ message: "Rating and comment are required" });
}

  try {
    const course = await Course.findOne({ _id: req.params.id });

    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollment = await Enrollment.findOne({
      user: req.user?._id,
      course: course._id,
    });
    if (!enrollment) return res.status(403).json({ message: "Enroll first to review" });

    const review = new CourseReview({
      course: course._id,
      user: req.user._id,
      name: req.user.name || "Anonymous",
      avatar: req.user.avatar || null,
      rating,
      comment,
    });

    await review.save();

    const allReviews = await CourseReview.find({ course: course._id });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    // ✅ Instead of course.save(), just update the fields
    await Course.findByIdAndUpdate(course._id, {
      avgRating,
      reviewCount: allReviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// GET all reviews for a course
router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await CourseReview.find({ course: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
