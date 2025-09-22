const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Course = require("../models/Course")
const auth = require("../middleware/auth")
const instructorMiddleware = require("../middleware/instructorMiddleware")
const mongoose = require("mongoose");

// Apply auth and admin middleware to all routes
router.use(auth)
router.use(instructorMiddleware)


//get instructor courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find({ instructorId: req.user.id })
    res.json(courses)
  } catch (error) {
    console.error("Error fetching instructor courses:", error)
    res.status(500).json({ message: "Failed to fetch courses" })
  }
})

// Create new course
router.post("/courses", async (req, res) => {
    console.log("Creating a new course");
    console.log("Request Body:", req.body); // Debugging line
  try {
    const course = new Course({
      ...req.body,
      instructorId: req.user.id,
      createdBy: req.user.id,
    })

    await course.save()
    res.status(201).json(course)
  } catch (error) {
    console.error("Error creating course:", error)
    res.status(500).json({ message: "Failed to create course" })
  }
})

// Update existing course
router.put("/courses/:courseId", async (req, res) => {
  const { courseId } = req.params
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
    }
    try {
    const course = await Course.findOneAndUpdate(
      { _id: courseId, instructorId: req.user.id },
        req.body,
        { new: true }
    )
    if (!course) {
        return res.status(404).json({ message: "Course not found or unauthorized" })
    }
    res.json(course)
    } catch (error) {
        console.error("Error updating course:", error)
        res.status(500).json({ message: "Failed to update course" })
    }
})


//delete course
router.delete("/courses/:courseId", async (req, res) => {
  const { courseId } = req.params
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "Invalid course ID" });
    }
    try {
    const course = await Course.findOneAndDelete(
        { _id: courseId, instructorId: req.user.id }
    )
    if (!course) {
        return res.status(404).json({ message: "Course not found or unauthorized" })
    }
    res.json({ message: "Course deleted successfully" })
    } catch (error) {
        console.error("Error deleting course:", error)
        res.status(500).json({ message: "Failed to delete course" })
    }
})



module.exports = router