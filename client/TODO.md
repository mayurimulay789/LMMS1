# TODO: Fix Lesson Playback Issue

## Plan Overview
Fix the issue where enrolled users cannot click on lessons to play videos. Create a dedicated learning page, add routing, and make lessons clickable.

## Steps

- [ ] Step 1: Create LearnPage.jsx - New page to display course lessons and video player for enrolled users.
- [ ] Step 2: Add route for LearnPage in App.jsx - Protected route at `/courses/:courseId/learn`.
- [ ] Step 3: Update CourseDetailPage.jsx - Make non-preview lessons clickable for enrolled users, navigating to LearnPage with selected lesson.
- [ ] Step 4: Test the implementation - Verify navigation, enrollment check, and video playback for YouTube and other videos.

## Follow-up
- Ensure video playback works for different formats.
- Handle errors gracefully (e.g., invalid enrollment, missing videos).
