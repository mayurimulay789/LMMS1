const mongoose = require("mongoose")
const Course = require("../models/Course")
const User = require("../models/User")

/**
 * Migration script to fix existing courses with incorrect instructor field
 * This script will:
 * 1. Find all courses that have instructor field set to ObjectId (wrong)
 * 2. Update them to use instructorId field instead
 * 3. Set the instructor field to the user's name
 */
async function fixInstructorFieldMigration() {
  try {
    console.log("Starting instructor field migration...")

    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log("Database not connected. Please ensure database is connected before running migration.")
      return
    }

    // Find all courses where instructor field contains ObjectId-like values
    const coursesToFix = await Course.find({
      $or: [
        { instructor: { $type: "objectId" } }, // ObjectId type
        { instructor: { $regex: /^[0-9a-fA-F]{24}$/ } }, // String that looks like ObjectId
        { instructorId: { $exists: false } } // Missing instructorId field
      ]
    })

    console.log(`Found ${coursesToFix.length} courses that need to be fixed`)

    if (coursesToFix.length === 0) {
      console.log("No courses need fixing. Migration complete.")
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const course of coursesToFix) {
      try {
        // If instructor field contains ObjectId, treat it as the instructorId
        let instructorId = course.instructor
        let instructorName = "Unknown Instructor"

        // Try to find the user by the ObjectId to get their name
        if (instructorId) {
          const user = await User.findById(instructorId)
          if (user) {
            instructorName = user.name
          }
        }

        // Update the course with correct fields
        course.instructor = instructorName
        course.instructorId = instructorId

        await course.save()
        successCount++
        console.log(`Fixed course: ${course.title} (ID: ${course._id})`)
      } catch (error) {
        errorCount++
        console.error(`Error fixing course ${course._id}:`, error.message)
      }
    }

    console.log(`Migration completed:`)
    console.log(`- Successfully fixed: ${successCount} courses`)
    console.log(`- Errors: ${errorCount} courses`)

    if (errorCount > 0) {
      console.log("Some courses could not be fixed. Please check the errors above.")
    } else {
      console.log("All courses have been successfully fixed!")
    }

  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  }
}

/**
 * Verify that all courses have correct instructor fields
 */
async function verifyInstructorFields() {
  try {
    console.log("Verifying instructor fields...")

    // Check for courses with incorrect instructor field usage
    const incorrectCourses = await Course.find({
      $or: [
        { instructor: { $type: "objectId" } },
        { instructor: { $regex: /^[0-9a-fA-F]{24}$/ } },
        { instructorId: { $exists: false } },
        { instructorId: { $type: "string" } }
      ]
    })

    if (incorrectCourses.length > 0) {
      console.log(`Found ${incorrectCourses.length} courses with incorrect instructor fields:`)
      incorrectCourses.forEach(course => {
        console.log(`- ${course.title}: instructor=${course.instructor}, instructorId=${course.instructorId}`)
      })
      return false
    } else {
      console.log("All courses have correct instructor fields!")
      return true
    }
  } catch (error) {
    console.error("Verification failed:", error)
    return false
  }
}

module.exports = {
  fixInstructorFieldMigration,
  verifyInstructorFields
}
