const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const courseController = require('../controllers/courseController');
const authController = require('../controllers/authController');
const middleware = require('../middleware');

//all routes are prepended with "/api/v1"

//user routes
router.get('/users', 
  passport.authenticate('jwt', {session: false}), 
  userController.getUsers
);
router.post('/users/register',
  authController.requiresLogout,
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
  authController.requiresLogout,
  authController.login
);
router.get('/logout',
  passport.authenticate('jwt', {session: false}),
  authController.logout
);

module.exports = router;