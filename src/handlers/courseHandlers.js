const Course = require('../models/courseModel');

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
//When returning a single course for the GET /api/courses/:courseId route, use Mongoose population to load the related user and reviews documents.
courseHandler.getCourseById = (req, res, next) => {
    const {courseId} = req.params;
    res.sendStatus(200);
};

module.exports = courseHandler;