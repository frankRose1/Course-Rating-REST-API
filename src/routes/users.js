const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const { auth } = require('../middleware');
const {
  createRegisterValidation,
  validateInputs
} = require('../handlers/validation');

// GET /api/users 200 - Returns info about the users in the DB
router.get('/', auth, (req, res, next) => {
  User.find({})
    .select('-_id fullName interests avatar')
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      next(err);
    });
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns a token
router.post('/', createRegisterValidation, validateInputs, (req, res, next) => {
  const avatar = gravatar.url(req.body.emailAddress, {
    r: 'pg', //Rating,
    s: '200', //Size
    d: 'mm' //Default photo
  });

  const data = {
    ...req.body,
    avatar
  };
  const user = new User(data);
  user
    .save()
    .then(user => {
      const token = user.generateAuthToken();
      res
        .status(201)
        .location('/')
        .json({ token });
    })
    .catch(err => {
      next(err);
    });
});

// GET 200 --> if a user has their token signed in, req.user will have the ID
router.get('/profile', auth, (req, res, next) => {
  const { id } = req.user;
  User.findById(id)
    .select('-_id fullName interests avatar')
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: 'No User Found.' });
      }
      res.status(200).json({ currentUser: user });
    })
    .catch(err => {
      next(err);
    });
});

//GET api/v1/users/interests && api/v1/users/interests/:interest
//aggregate the interests and if there is a param, find users with that interest
router.get('/interests/:interest', auth, (req, res, next) => {
  const { interest } = req.params;
  const query = interest || { $exists: true }; //fallback to any user with any interest
  const intPromise = User.getInterestsList();
  const userPromise = User.find({ interests: query }).select(
    '-_id fullName interests avatar'
  );
  Promise.all([intPromise, userPromise])
    .then(([interests, users]) => {
      res.json({ interests, users });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
