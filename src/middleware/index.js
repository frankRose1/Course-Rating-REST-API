const mongoose = require('mongoose');
const Course = mongoose.model('Course');
const jwt = require('jsonwebtoken');
const middleware = {};

middleware.authenticate = (req, res, next) => {
  const token = req.header('bearer');
  if (!token)
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.APP_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

//To be used on POST "api/courses/:courseId/reviews" to prevent a course owner from reiewing their own course
middleware.checkOwner = (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  Course.checkCourseOwner(courseId, userId, err => {
    if (err) {
      return next(err);
    }

    next();
  });
};

module.exports = middleware;
