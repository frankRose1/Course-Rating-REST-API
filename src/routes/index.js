const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');
const checkOwner = require('../middleware/checkCourseOwner');
const authenticate = require('../middleware/auth');
const {
  createRegisterValidation,
  createLoginValidation,
  createCourseValidation,
  createReviewValidation,
  validateInputs
} = require('../handlers/validation');

//all routes are prepended with "/api/v1"

//user routes
router.get('/users', authenticate, userController.getUsers);
router.post(
  '/users',
  createRegisterValidation,
  validateInputs,
  userController.createUser
);
router.get('/users/profile', authenticate, userController.userProfile);
router.get('/users/interests', authenticate, userController.getUsersByInterest);
router.get(
  '/users/interests/:interest',
  authenticate,
  userController.getUsersByInterest
);

//course routes
router.get('/courses', courseController.getCourses);
router.get('/courses/top-rated', courseController.getTopRated);
router.get('/course/:courseId', courseController.getCourseById);
router.post(
  '/courses',
  authenticate,
  createCourseValidation,
  validateInputs,
  courseController.createCourse
);
router.put(
  '/courses/:courseId',
  authenticate,
  createCourseValidation,
  validateInputs,
  courseController.updateCourse
);
router.post(
  '/courses/:courseId/reviews',
  authenticate,
  createReviewValidation,
  validateInputs,
  checkOwner,
  courseController.createReviewRefactor
);

//auth routes
router.post(
  '/login',
  createLoginValidation,
  validateInputs,
  authController.login
);

module.exports = router;
