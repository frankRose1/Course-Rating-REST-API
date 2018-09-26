/**
 * Middlware to be used on routes to prevent course owners from reviwing their own course
 */
const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const middleware = {};

//To be used on POST "api/courses/:courseId/reviews" to prevent a course owner from reiewing their own course
//logged in user will be available on the request
middleware.checkOwner = (req, res, next) => {
    const {courseId} = req.params;
    const userId = req.session.userId;

    Course.checkCourseOwner(courseId, userId, err => {
        if (err) {
            return next(err);
        }

        next();
    });

};

module.exports = middleware;
