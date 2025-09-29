const mongoose = require('mongoose');
const Course = require('./models/Course');
const { getVideoDuration, convertSecondsToMinutes } = require('./utils/videoUtils');

async function testDurationCalculation() {
  try {
    await mongoose.connect('mongodb://localhost:27017/lms');
    console.log('Connected to MongoDB');

    // Find courses with video URLs
    const courses = await Course.find({ 'lessons.videoUrl': { $exists: true } }).limit(2);
    console.log('Found courses with video URLs:', courses.length);

    if (courses.length > 0) {
      const course = courses[0];
      console.log('Sample course:', course.title);
      console.log('Lessons with video URLs:');
      course.lessons.forEach((lesson, index) => {
        if (lesson.videoUrl) {
          console.log(`Lesson ${index + 1}: ${lesson.title} - Duration: ${lesson.duration} - URL: ${lesson.videoUrl}`);
        }
      });
    }

    // Test video duration calculation with a sample URL
    console.log('\nTesting video duration calculation...');
    try {
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Sample YouTube URL
      const duration = await getVideoDuration(testUrl);
      console.log(`Test video duration: ${duration} seconds = ${convertSecondsToMinutes(duration)} minutes`);
    } catch (error) {
      console.log('Error testing video duration:', error.message);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDurationCalculation();
