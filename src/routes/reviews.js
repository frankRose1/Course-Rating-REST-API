const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Review = mongoose.model('Review');
const { auth, isValidID } = require('../middleware');
const {
  createReviewValidation,
  validateInputs
} = require('../handlers/validation');
const REVIEW_NOT_FOUND = 'Review not found.';

router.get('/:id', async (req, res) => {
  res.send('hello');
});

router.put('/:id', async (req, res) => {
  res.send('hello');
});

router.delete('/:id', async (req, res) => {
  res.send('hello');
});

module.exports = router;
