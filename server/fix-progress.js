const mongoose = require("mongoose");
const Enrollment = require("./models/Enrollment");
const Course = require("./models/Course");

async function fixProgressInconsistencies() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect("mongodb://localhost:27017/lms", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Find all enrollments where certificate is issued but progress < 100
    const inconsistentEnrollments = await Enrollment.find({
      "certificate.issued": true,
      "progress.completionPercentage": { $lt: 100 }
    }).populate("course");

    console.log(`Found ${inconsistentEnrollments.length} inconsistent enrollments`);

    for (const enrollment of inconsistentEnrollments) {
      console.log(`Fixing enrollment for course: ${enrollment.course.title}, user: ${enrollment.user}`);

      // Get the course to get lessons
      const course = await Course.findById(enrollment.course._id);
      if (!course) {
        console.error(`Course not found for enrollment: ${enrollment._id}`);
        continue;
      }

      // Set progress to 100%
      enrollment.progress.completedLessons = course.lessons.map(lesson => ({
        lessonId: lesson._id.toString(),
        completedAt: enrollment.certificate.issuedAt || new Date(),
      }));
      enrollment.progress.totalLessons = course.lessons.length;
      enrollment.progress.completionPercentage = 100;
      enrollment.status = "completed";

      await enrollment.save();
      console.log(`Fixed progress for enrollment: ${enrollment._id}`);
    }

    console.log("Progress fix completed");
  } catch (error) {
    console.error("Error fixing progress:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the fix
fixProgressInconsistencies();
