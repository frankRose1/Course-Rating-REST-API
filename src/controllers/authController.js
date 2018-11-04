const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const authController = {};

//if the credentials match a document in the database, a user is logged in
authController.login = (req, res, next) => {
  const {emailAddress, password} = req.body
  if (emailAddress && password) {
    User.authenticate(emailAddress, password, (err, user) => {
      if (err || !user) {
        const err = new Error('Incorrect email or password');
        err.status = 400;
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
  } else {
    const err = new Error('Email and password are required!');
    err.status = 401;
    next(err);
  }
};

authController.logout = (req, res, next) => {
  //check for a session
  if (req.session) {
    //session has a destroy method that will end the session and we can tell express what to do after its gone
    req.session.destroy(err => {
      if (err) return next(err);
      res.status(200).redirect("/");
    });
  }
};


/**
 * @summary Middleware for any route the requires a user to be signed in
 */
authController.requiresLogin = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    const error = new Error("You must be logged in to view this page!");
    error.status = 401;
    next(error);
  }
}

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