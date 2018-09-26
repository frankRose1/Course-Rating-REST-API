const express = require('express');
const router = express.Router();
const userHandlers = require('../handlers/userHandlers');
const courseHandlers = require('../handlers/courseHandlers');
const authHandler = require('../handlers/authHandler');
const middleware = require('../middleware');

//all routes are prepended with "/api"

//user routes
router.get('/users', 
  authHandler.requiresLogin, 
  userHandlers.getUsers
);
router.post('/users/register',
  authHandler.requiresLogout,
  userHandlers.createUser
);
router.get('/users/profile', 
  authHandler.requiresLogin, 
  userHandlers.userProfile
);

//course routes
router.get('/courses', courseHandlers.getCourses);
router.get('/courses/:courseId', courseHandlers.getCourseById);
router.post('/courses', 
  authHandler.requiresLogin, 
  courseHandlers.createCourse
);
router.put('/courses/:courseId', 
  authHandler.requiresLogin, 
  courseHandlers.updateCourse
);
router.post('/courses/:courseId/reviews', 
  authHandler.requiresLogin,
  middleware.checkOwner,
  courseHandlers.createReview
);

//auth routes
router.post('/login',
  authHandler.requiresLogout,
  authHandler.login
);
router.get('/logout',
  authHandler.requiresLogin,
  authHandler.logout
);

module.exports = router;