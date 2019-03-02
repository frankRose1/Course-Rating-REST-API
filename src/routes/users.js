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
router.get('/', auth, async (req, res) => {
  const users = await User.find({}).select('-_id fullName interests avatar');
  res.status(200).json(users);
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns a token
router.post('/', createRegisterValidation, validateInputs, async (req, res) => {
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
  await user.save();
  const token = user.generateAuthToken();
  res
    .status(201)
    .location('/')
    .json({ token });
});

// GET 200 --> if a user has provided a token, req.user will be populated with the ID
router.get('/profile', auth, async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id).select('-_id fullName interests avatar');

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.status(200).json({ currentUser: user });
});

async function aggregateUsersByInterest(req, res, next) {
  const { interest } = req.params;
  const query = interest || { $exists: true }; //fallback to any user with any interest
  const intPromise = User.getInterestsList();
  const userPromise = User.find({ interests: query }).select(
    '-_id fullName interests avatar'
  );
  const [interests, users] = await Promise.all([intPromise, userPromise]);
  res.json({ interests, users });
}

//GET api/v1/users/interests && api/v1/users/interests/:interest
//aggregate the interests and if there is a param, find users with that interest
router.get('/interests', auth, aggregateUsersByInterest);
router.get('/interests/:interest', auth, aggregateUsersByInterest);

module.exports = router;
