const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const Review = mongoose.model('Review');

const courseController = {};

// GET /api/courses 200 - Returns the Course "_id" and "title" properties
courseController.getCourses = (req, res, next) => {
  Course.find({})
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
  const { courseId } = req.params;
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

//POST /api/courses 201 - Creates a course, sets the Location header, created status code and returns the course
//Required --> title, description, auth headers
courseController.createCourse = (req, res, next) => {
  const data = {
    ...req.body,
    user: req.user.id
  };
  const course = new Course(data);
  course
    .save()
    .then(course => {
      res
        .location(`/api/v1/courses/${course._id}`)
        .sendStatus(201);
    })
    .catch(err => {
      next(err);
    });
};

// PUT /api/courses/:courseId 204 - Updates a course and returns no content
//Required --> auth headers && atleast one of the fields on the schema to be updated
courseController.updateCourse = (req, res, next) => {
  const userId = req.user._id;
  const { courseId } = req.params;
  Course.findOne({ _id: courseId })
    .then(course => {
      let error;

      if (!course) {
        error = new Error('No Course found for that ID.');
        error.status = 404;
        throw error;
      }
      //only the course owner can make edits
      if (!course.user._id.equals(userId)) {
        error = new Error('Only the owner of this course can make edits.');
        error.status = 403;
        throw error;
      }
      course.set(req.body);
      return course.save();
    })
    .then(course => {
      res.location(`/api/v1/courses/${course._id}`).sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
};

//POST /api/courses/:courseId/reviews 201 - Creates a review for the specified course ID,
//sets the Location header to the related course, and returns no content
// Required --> auth and rating
courseController.createReview = (req, res, next) => {
  req.body.rating =
    typeof req.body.rating === 'number'
      ? req.body.rating
      : parseInt(req.body.rating);

  const reviewData = {
    ...req.body,
    user: req.user.id
  };

  let savedReviewId;
  const review = new Review(reviewData);
  review
    .save()
    .then(review => {
      savedReviewId = review._id;
      //find the course and update the reviews
      return Course.findById(req.params.courseId).select('reviews');
    })
    .then(course => {
      const reviews = course.reviews.slice();
      reviews.push(savedReviewId);
      course.set({ reviews });
      return course.save();
    })
    .then(course => {
      res.location(`/api/v1/courses/${course._id}`).sendStatus(201);
    })
    .catch(err => {
      //use the validation on the model
      if (err.name === 'ValidationError') {
        const error = new Error(
          'Please leave a number rating between 1 and 5.'
        );
        error.status = 400;
        throw error;
      } else {
        throw err;
      }
    })
    .catch(err => {
      next(err);
    });
};

//GET /api/v1/courses/top-rated
courseController.getTopRated = (req, res, next) => {
  Course.getTopRated()
    .then(courses => {
      res.json({
        message: `Top ${courses.length} courses!`,
        courses
      });
    })
    .catch(err => {
      next(err);
    });
};

module.exports = courseController;
