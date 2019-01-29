const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');
const checkOwner = require('../middleware/checkCourseOwner');
const auth = require('../middleware/auth');
const {
  createRegisterValidation,
  createLoginValidation,
  createCourseValidation,
  createReviewValidation,
  validateInputs
} = require('../handlers/validation');

//all routes are prepended with "/api/v1"

//user routes
router.get('/users', auth, userController.getUsers);
router.post(
  '/users',
  createRegisterValidation,
  validateInputs,
  userController.createUser
);
router.get('/users/profile', auth, userController.userProfile);
router.get('/users/interests', auth, userController.getUsersByInterest);
router.get(
  '/users/interests/:interest',
  auth,
  userController.getUsersByInterest
);

//course routes
router.get('/courses', courseController.getCourses);
router.get('/courses/top-rated', courseController.getTopRated);
router.get('/courses/:courseId', courseController.getCourseById);
router.post(
  '/courses',
  auth,
  createCourseValidation,
  validateInputs,
  courseController.createCourse
);
router.put(
  '/courses/:courseId',
  auth,
  createCourseValidation,
  validateInputs,
  courseController.updateCourse
);
router.post(
  '/courses/:courseId/reviews',
  auth,
  checkOwner,
  createReviewValidation,
  validateInputs,
  courseController.createReview
);

//auth routes
router.post(
  '/auth',
  createLoginValidation,
  validateInputs,
  authController.login
);

module.exports = router;
