const mongoose = require('mongoose');
const Course = mongoose.model('Course');

const courseHandler = {};

// GET /api/courses 200 - Returns the Course "_id" and "title" properties
courseHandler.getCourses = (req, res, next) => {
    Course.find({})
            .select('_id title')
            .exec((err, courses) => {
                if (err) {
                    return next(err);
                }

                res.status(200);
                res.json(courses);
            });
};

//GET /api/course/:courseId 200 - Returns all Course properties and related documents for the provided course ID
courseHandler.getCourseById = (req, res, next) => {
    const {courseId} = req.params;
    Course.findById(courseId)
            .populate('user')
            .populate('reviews')
            .exec((err, course) => {
                if (err) {
                    return next(err);
                }
                
                res.status(200);
                res.json(course);
            });
};

//POST /api/courses 201 - Creates a course, sets the Location header, and returns no content
    //when a course is created, a reference to the user must be saved also
    // can set a propery on the --> req.body.user = req.user._id;
                                                    //req.user is the currently logged in user
    // How do we get a currently logged in user?
courseHandler.createCourse = (req, res, next) => {
    // req.body.user = req.user._id
    // Course.create(req.body)
    res.location("/");
    res.sendStatus(201);
};

module.exports = courseHandler;