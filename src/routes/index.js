const auth = require('./auth');
const courses = require('./courses');
const reviews = require('./reviews')
const users = require('./users');
const { notFound, globalErrorHandler } = require('../handlers/errorHandlers');

module.exports = app => {
  app.use('/api/v1/users', users);
  app.use('/api/v1/courses', courses);
  app.use('/api/v1/reviews', reviews)
  app.use('/api/v1/auth', auth);
  app.use(notFound);
  app.use(globalErrorHandler);
};
