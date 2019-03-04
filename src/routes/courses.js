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

//GET /api/course/:courseId 200 - Returns a course and related reviews
router.get('/:id', isValidID, async (req, res) => {
  const { id } = req.params;
  const coursePromise = Course.findById(id).populate('user', '-_id fullName avatar');
  const reviewsPromise = Review.find({course: id})
    .select('rating review user postedOn')
    .populate('user', '-_id fullName avatar')
    .sort({postedOn: -1});
  const [course, reviews] = await Promise.all([coursePromise, reviewsPromise]);

  if (!course) {
    return res.status(404).json({ message: COURSE_NOT_FOUND });
  }

  res.status(200).json({course, reviews});
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

    const hasPermission = course.hasUpdatePermission(userId)
    if (!hasPermission) {
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
    const userId = req.user.id;
    const courseId = req.params.id
    const reviewData = {
      ...req.body,
      user: userId,
      course: courseId
    };

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: COURSE_NOT_FOUND });
    }

    const existingReview = await Review.findOne({course: courseId, user: userId});

    if (existingReview) {
      return res
        .status(400)
        .location(`/api/v1/reviews/${existingReview._id}`)
        .json({ message: 'User has already left a review on this course.' });
    }

    const review = new Review(reviewData);
    await review.save();

    res.location(`/api/v1/courses/${course._id}`).sendStatus(201);
  }
);

module.exports = router;
