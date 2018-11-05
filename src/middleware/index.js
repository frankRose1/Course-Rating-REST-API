const mongoose = require('mongoose');
const Course = mongoose.model('Course');

const middleware = {};

//To be used on POST "api/courses/:courseId/reviews" to prevent a course owner from reiewing their own course
middleware.checkOwner = (req, res, next) => {
    const {courseId} = req.params;
    const userId = req.user._id;

    Course.checkCourseOwner(courseId, userId, err => {
        if (err) {
            return next(err);
        }

        next();
    });

};

module.exports = middleware;
