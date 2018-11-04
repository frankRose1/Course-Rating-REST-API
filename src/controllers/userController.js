const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const userController = {};

// GET /api/users 200 - Returns info about the users in the DB
userController.getUsers = (req, res, next) => {
    //this route is login Protected
    User.find()
    .select('fullName interests _id avatar')
    .exec((err, users) => {
        if (err) return next(err);
        res.status(200).json(users);
    });
};

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content (SIGNUP)
userController.createUser = (req, res, next) => {
  const {fullName, emailAddress, password, confirmPassword} = req.body;
  if (fullName && emailAddress && password && confirmPassword) {
    //match the passwords
    if (password !== confirmPassword) {
        const error = new Error("Passwords must match.");
        error.status = 400;
        return next(error);
    }

    const avatar = gravatar.url(emailAddress, {
      r: "pg", //Rating,
      s: "200", //Size
      d: "mm" //Default photo
    });

    const data = {
      ...req.body,
      avatar
    };

    User.create(data, (err, user) => {
      if (err) {
          if (err.code == 11000) {
              const error = new Error('A user with that email already exists!');
              error.status = 400;
              return next(error);
          } else if (err.name == 'ValidationError') {
              const error = new Error('Please provide a valid email address.');
              error.status = 400;
              return next(error);
          }
          return next(err);
        } else {
          //send a token to the client
          const payload = {
            id: user._id,
            name: user.fullName,
            avatar: user.avatar
          };
          const token = jwt.sign(payload, process.env.APP_SECRET, { expiresIn: '1h' });
          res.status(201).json({token});
        }
    });
  } else {
      const error = new Error("Please fill out the required fields.");
      error.status = 400;
      return next(error);
  }
};

// GET /api/users/profile 200 --> if a user is currently signed in, they will have access to the user object provided by passport
userController.userProfile = (req, res, next) => {
  const {fullName, avatar, _id, interests} = req.user;
  res.status(200).json({fullName, avatar, _id, interests});
};

module.exports = userController;