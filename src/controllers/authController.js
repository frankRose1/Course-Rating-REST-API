const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const authController = {};

//if the credentials match a document in the database, a user is logged in
authController.login = (req, res, next) => {
  const {emailAddress, password} = req.body
  User.authenticate(emailAddress, password, (err, user) => {
    if (err) {
      return next(err);
    } else {
      const payload = {
        id: user._id,
        name: user.fullName,
        avatar: user.avatar
      }
      const token = jwt.sign(payload, process.env.APP_SECRET, { expiresIn: '1h' });
      res.json({token});
    }
  });
};


/**
 * @summary Only logged out users should be able to visit enpoints such as "api/register" and "api/login"
 */
authController.requiresLogout = (req, res, next) => {
  if (req.user) {
    const error = new Error('You need to be logged out to use this endpoint.');
    error.status = 400;
    return next(error);
  }
  next();
}

module.exports = authController;