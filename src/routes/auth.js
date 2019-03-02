const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = mongoose.model('User');
const {
  createLoginValidation,
  validateInputs
} = require('../handlers/validation');
const INVALID_CREDENTIALS = 'Invalid email or password';

router.post('/', createLoginValidation, validateInputs, async (req, res) => {
  const { emailAddress, password } = req.body;
  const user = await User.findOne({ emailAddress: emailAddress });

  if (!user) {
    return res.status(400).json({ message: INVALID_CREDENTIALS });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(400).json({ message: INVALID_CREDENTIALS });
  }

  const token = user.generateAuthToken();
  return res.json({ token });
});

module.exports = router;
