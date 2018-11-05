const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const userController = {};

// GET /api/users 200 - Returns info about the users in the DB
userController.getUsers = (req, res, next) => {
  User
    .find({})
    .select('fullName interests _id avatar')
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      next(err);
    });
};

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content (SIGNUP)
userController.createUser = (req, res, next) => {
  const avatar = gravatar.url(req.body.emailAddress, {
    r: "pg", //Rating,
    s: "200", //Size
    d: "mm" //Default photo
  });

  const data = {
    ...req.body,
    avatar
  };
  const user = new User(data);
  user.save()
    .then(user => {
      //send a token to the client
      const payload = {
        id: user._id,
        name: user.fullName,
        avatar: user.avatar
      };
      const token = jwt.sign(payload, process.env.APP_SECRET, { expiresIn: '1h' });
      res.status(201).json({token});
    })
    .catch(err => {
      next(err);
    });
};

// GET /api/users/profile 200 --> if a user is currently signed in, they will have access to the user object provided by passport
userController.userProfile = (req, res, next) => {
  const {fullName, avatar, _id, interests} = req.user;
  res.status(200).json({fullName, avatar, _id, interests});
};

module.exports = userController;