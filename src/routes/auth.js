const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = mongoose.model('User');
const {
  createLoginValidation,
  validateInputs
} = require('../handlers/validation');

router.post('/', createLoginValidation, validateInputs, (req, res, next) => {
  const { emailAddress, password } = req.body;
  User.findOne({ emailAddress: emailAddress })
    .then(user => {
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      bcrypt.compare(password, user.password, (err, isValid) => {
        if (isValid) {
          const token = user.generateAuthToken();
          return res.json({ token });
        } else {
          return res.status(400).json({ message: 'Invalid email or password' });
        }
      });
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
