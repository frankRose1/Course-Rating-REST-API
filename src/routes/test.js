const auth = require('./auth');
const courses = require('./courses');
const users = require('./users');

module.exports = app => {
  app.use('/api/v1/users', users);
  app.use('/api/v1/courses', courses);
  app.use('/api/v1/auth', auth);
};
