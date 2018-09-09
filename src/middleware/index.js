/**
 * Middlware to be used on routes to authenticate users an prevent course owners from reviwing their own course
 */
const auth = require('basic-auth');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Course = mongoose.model('Course');
const middleware = {};

//Middlware to parse auth headers sent with the request and to grant permissions to certain routes
middleware.auth = (req, res, next) => {
    //parse the headers
    const credentials = auth(req);
        // ==> { name: "A Name", pass: "whatever"} || undefined if auth headers are invalid

    if (!credentials) {
        const error = new Error("Invalid or missing authorization headers.");
        error.status = 401;
        return next(error);
    }

    if (credentials.name && credentials.pass) {
        //authenticate the user
        User.authenticate(credentials.name, credentials.pass, (err, user) => {
            if (err) {
                return next(err);
            }
            //add the user to the request to be available in next middleware
            req.user = user;
            next();
        });
    }
};

//To be used on POST "api/courses/:courseId/reviews" to prevent a course owner from reiewing their own course
//course ID will be available in the request req.params.courseId
//logged in user will be available on the request as well if they are authenticated
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
