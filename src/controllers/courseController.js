const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Review = mongoose.model('Review');

const courseController = {};

// GET /api/courses 200 - Returns the Course "_id" and "title" properties
courseController.getCourses = (req, res, next) => {
  Course
    .find({})
    .select('_id title')
    .then(courses => {
      res.status(200).json(courses);
    })
    .catch(err => {
      next(err);
    });
};


//GET /api/course/:courseId 200 - Returns all Course properties and related documents for the provided course ID
courseController.getCourseById = (req, res, next) => {
    const {courseId} = req.params;
    Course.findById(courseId)
      .then(course => {
        if (!course) {
          const error = new Error('Could not find a course with that ID.');
          error.status = 404;
          throw error;
        }

        res.status(200).json(course);
      })
      .catch(err => {
        next(err);
      });
};

//POST /api/courses 201 - Creates a course, sets the Location header, and returns no content
    //Required --> title, description, steps, auth headers
courseController.createCourse = (req, res, next) => {

    req.body.user = req.session.userId;
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

// PUT /api/courses/:courseId 204 - Updates a course and returns no content
    //Required --> auth headers && atleast one of the fields on the schema to be updated
courseController.updateCourse = (req, res, next) => {
    const userId = req.session.userId;
    const {courseId} = req.params;
    const {title, steps, description, estimatedTime, materialsNeeded} = req.body;
    if (title || steps || description || estimatedTime || materialsNeeded) {
        Course.findById(courseId)
        .exec( (err, course) => {
            if (err) return next(err);

            if (!course) {
                const error = new Error('Could not find a course with that ID.');
                error.status = 404;
                return next(error);
            }

            //only the owner of a course can edit the course
            if (!course.user.equals(userId)) {
                const error = new Error('Only the owner of a course can make edits.');
                error.status = 401;
                return next(error);
            }

            //update the course
            course.update(req.body, (err, doc) => {
                if (err) return next(err); 

                res.sendStatus(204);
            });
        });
    } else {
        const error = new Error('Please provide atleast one field to be updated.');
        error.status = 400;
        next(error);
    }
};

//POST /api/courses/:courseId/reviews 201 - Creates a review for the specified course ID, sets the Location header to the related course, and returns no content
// Required --> auth and rating
courseController.createReview = (req, res, next) => {
    //add a reference to the logged in user leaving the review
    req.body.user = req.session.userId;
    const {courseId} = req.params;
    const {rating} = req.body;

    if (rating && typeof(rating) == 'number') {
        //see if the course exits first
        Course.findById(courseId)
                .exec((err, course) => {
                    if (err) return next(err);

                    //create the review
                    Review.create(req.body, (err, review) => {
                        if (err)  {
                            if (err.name == 'ValidationError') {
                                const error = new Error(err.message);
                                error.status = 400;
                                return next (error);
                            }
                            return next(err);
                        };
                        //update the reviews array on the course model
                        course.reviews.push(review._id);
                        course.save((err, course) => {
                            if (err) return next(err);

                            res.location(`/api/courses/${courseId}`);
                            res.sendStatus(201);
                        });
                    });

                });
        
    } else {
        const error = new Error('Please leave a rating.');
        error.status = 400;
        next(error);
    }
};


module.exports = courseController;