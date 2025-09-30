const mongoose = require("mongoose");
const Enrollment = require("./models/Enrollment");
const Course = require("./models/Course");
const Certificate = require("./models/Certificate");

async function fixProgressInconsistencies() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect("mongodb://localhost:27017/lms", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Find all certificates
    const certificates = await Certificate.find({}).populate("enrollment").populate("course");

    console.log(`Found ${certificates.length} certificates`);

    for (const certificate of certificates) {
      const enrollment = certificate.enrollment;
      if (!enrollment) {
        console.error(`Enrollment not found for certificate: ${certificate.certificateId}`);
        continue;
      }

      console.log(`Checking certificate: ${certificate.certificateId} for course: ${certificate.courseName}`);

      // Check if enrollment has certificate marked as issued
      if (!enrollment.certificate.issued) {
        console.log(`Setting certificate.issued = true for enrollment: ${enrollment._id}`);
        enrollment.certificate.issued = true;
        enrollment.certificate.issuedAt = certificate.issueDate;
        enrollment.certificate.certificateId = certificate.certificateId;
      }

      // Check if progress is 100%
      if (enrollment.progress.completionPercentage < 100) {
        console.log(`Setting progress to 100% for enrollment: ${enrollment._id}`);

        const course = certificate.course;
        if (!course) {
          console.error(`Course not found for certificate: ${certificate.certificateId}`);
          continue;
        }

        enrollment.progress.completedLessons = course.lessons.map(lesson => ({
          lessonId: lesson._id.toString(),
          completedAt: certificate.completionDate || certificate.issueDate,
        }));
        enrollment.progress.totalLessons = course.lessons.length;
        enrollment.progress.completionPercentage = 100;
        enrollment.status = "completed";
      }

      await enrollment.save();
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
