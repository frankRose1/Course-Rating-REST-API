const express = require('express');
const router = express.Router();
const userHandlers = require('../handlers/userHandlers');
const courseHandlers = require('../handlers/courseHandlers');
const middleware = require('../middleware');

//all routes are prepended with "/api"

//user routes
router.get('/users', middleware.auth, userHandlers.getUser);
router.post('/users', userHandlers.createUser);

//course routes
router.get('/courses', courseHandlers.getCourses);
router.get('/courses/:courseId', courseHandlers.getCourseById);
router.post('/courses', middleware.auth, courseHandlers.createCourse);
router.put('/courses/:courseId', middleware.auth, courseHandlers.updateCourse);
router.post('/courses/:courseId/reviews', 
            middleware.auth,
            middleware.checkOwner,
            courseHandlers.createReview);

module.exports = router;