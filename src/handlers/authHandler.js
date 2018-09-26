const authHandler = {};
const mongoose = require('mongoose');
const User = mongoose.model('User');

//if the credentials match a document in the database, a user is logged in
authHandler.login = (req, res, next) => {
  const {emailAddress, password} = req.body
  if (emailAddress && password) {
    User.authenticate(emailAddress, password, (err, user) => {
      if (err || !user) {
        const err = new Error('Incorrect email or password');
        err.status = 400;
        return next(err);
      } else {
        // add the property of the session or create a new session if one doesnt exist yet
        req.session.userId = user._id;
        res.redirect('/api/users/profile');
      }
    });
  } else {
    const err = new Error('Email and password are required!');
    err.status = 401;
    next(err);
  }
};

authHandler.logout = (req, res, next) => {
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
authHandler.requiresLogin = (req, res, next) => {
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
authHandler.requiresLogout = (req, res, next) => {
    //if both are present then a user is logged in and should be redirected to their profile
    if (req.session && req.session.useId) {
        return res.redirect("api/users/profile");
    }
    //if not logged in carry on to next middleware
    next();
}

module.exports = authHandler;