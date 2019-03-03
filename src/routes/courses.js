const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Review = mongoose.model('Review');
const {
  createCourseValidation,
  createReviewValidation,
  validateInputs
} = require('../handlers/validation');
const { auth, isValidID, checkCourseOwner } = require('../middleware');
const COURSE_NOT_FOUND = 'Course not found.';

// GET /api/courses 200 - Returns the Course "_id" and "title" properties
router.get('/', async (req, res) => {
  const courses = await Course.find({}).select('_id title');
  res.status(200).json(courses);
});

//POST /api/courses 201 - Creates a course, sets the Location header, created status code and returns the course
//Required --> title, description, auth headers
router.post(
  '/',
  auth,
  createCourseValidation,
  validateInputs,
  async (req, res) => {
    const data = {
      ...req.body,
      user: req.user.id
    };
    const course = new Course(data);
    await course.save();
    res.location(`/api/v1/courses/${course._id}`).sendStatus(201);
  }
);

//GET /api/v1/courses/top-rated
router.get('/top-rated', async (req, res) => {
  const courses = await Course.getTopRated();
  res.json({
    message: `Top ${courses.length} courses!`,
    courses
  });
});

//GET /api/course/:courseId 200 - Returns all Course properties and related documents for the provided course ID
router.get('/:id', isValidID, async (req, res) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({ message: COURSE_NOT_FOUND });
  }

  res.status(200).json(course);
});

// PUT /api/courses/:id 204 - Updates a course and returns no content, set location headers to the course
router.put(
  '/:id',
  auth,
  isValidID,
  createCourseValidation,
  validateInputs,
  async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: COURSE_NOT_FOUND });
    }

    if (!course.user._id.equals(userId)) {
      return res.status(403).json({
        message: 'Only the owner of this course can make updates.'
      });
    }

    course.set(req.body);
    await course.save();
    res.location(`/api/v1/courses/${course._id}`).sendStatus(204);
  }
);

//POST /api/courses/:id/reviews 201 - Creates a review for the specified course ID,
//sets the Location header to the related course, and returns no content
router.post(
  '/:id/reviews',
  auth,
  isValidID,
  checkCourseOwner,
  createReviewValidation,
  validateInputs,
  async (req, res) => {
    const reviewData = {
      ...req.body,
      user: req.user.id
    };

    const course = await Course.findById(req.params.id).select('reviews');
    if (!course) {
      return res.status(404).json({ message: COURSE_NOT_FOUND });
    }

    const existingReview = course.reviews.find(
      rev => rev.user._id.toString() === req.user.id
    );
    if (existingReview) {
      return res
        .status(400)
        .location(`/api/v1/reviews/${existingReview._id}`)
        .json({ message: 'User has already left a review on this course.' });
    }

    const review = new Review(reviewData);
    await review.save();

    //update the course reviews
    const reviews = course.reviews.slice();
    reviews.unshift(review._id);
    course.set({ reviews });
    await course.save();

    res.location(`/api/v1/courses/${course._id}`).sendStatus(201);
  }
);

module.exports = router;
