const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const CourseReview = require("../models/CourseReview");
const auth = require("../middleware/auth");
const Enrollment = require("../models/Enrollment"); // check enrollment

// POST review
router.post("/:id/reviews", auth, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });
    if (!enrollment) return res.status(403).json({ message: "Enroll first to review" });

    // Create review
    const review = new CourseReview({
      course: course._id,
      user: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar || null,
      rating,
      comment,
    });

    await review.save();

    // Update course avg rating & review count
    const allReviews = await CourseReview.find({ course: course._id });
    course.avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    course.reviewCount = allReviews.length;
    await course.save();

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
