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
//Auth is required to create a course
//TODO: Check for required fields
    //estimatedTIme and materialsNeeded is optional
courseHandler.createCourse = (req, res, next) => {
    //create reference to the user's ID who created the course on req.body
    req.body.user = req.user._id;
    const {title, user, description, steps} = req.body;

    if (title && user && description && steps) {
        Course.create(req.body, (err, course) => {
            if (err) {
                return next(err);
            }
            
            res.location("/");
            res.sendStatus(201);
        });
    } else {
        const error = new Error("Required fields are missing.");
        error.status = 400;
        next(error);
    }
};

module.exports = courseHandler;