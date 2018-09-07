const express = require('express');
const router = express.Router();
const userHandlers = require('../handlers/userHandlers');
const courseHandlers = require('../handlers/courseHandlers');

//all routes are prepended with "/api"

//user routes
router.get('/users', userHandlers.getUser);
router.post('/users', userHandlers.createUser);

//course routes
router.get('/courses', courseHandlers.getCourses);
router.get('/courses/:courseId', courseHandlers.getCourseById);

module.exports = router;