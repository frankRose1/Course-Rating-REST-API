const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');
const middleware = require('../middleware');
const {createRegisterValidation, createLoginValidation, validateInputs} = require('../handlers/validation');

//all routes are prepended with "/api/v1"

//user routes
router.get('/users', 
  passport.authenticate('jwt', {session: false}), 
  userController.getUsers
);
router.post('/users/register',
  createRegisterValidation,
  validateInputs,
  userController.createUser
);
router.get('/users/profile', 
  passport.authenticate('jwt', {session: false}), 
  userController.userProfile
);

//course routes
router.get('/courses', courseController.getCourses);
router.get('/courses/:courseId', courseController.getCourseById);
router.post('/courses', 
  passport.authenticate('jwt', {session: false}), 
  courseController.createCourse
);
router.put('/courses/:courseId', 
  passport.authenticate('jwt', {session: false}), 
  courseController.updateCourse
);
router.post('/courses/:courseId/reviews', 
  passport.authenticate('jwt', {session: false}),
  middleware.checkOwner,
  courseController.createReview
);

//auth routes
router.post('/login',
  createLoginValidation,
  validateInputs,
  authController.login
);

module.exports = router;