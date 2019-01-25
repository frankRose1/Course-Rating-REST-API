const mongoose = require('mongoose');
const Course = mongoose.model('Course');

//To be used on POST "api/courses/:courseId/reviews" to prevent a course owner from reiewing their own course
module.exports = function(req, res, next) {
  const { courseId } = req.params;
  const userId = req.user.id;

  Course.checkCourseOwner(courseId, userId, err => {
    if (err) {
      return next(err);
    }

    next();
  });
};
