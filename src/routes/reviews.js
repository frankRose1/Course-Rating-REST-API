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

router.get('/:id', isValidID, async (req, res) => {
  const review = await Review.findById(req.params.id).populate(
    'user',
    '-_id fullName avatar'
  );
  if (!review) {
    return res.status(404).json({ message: REVIEW_NOT_FOUND });
  }
  res.json(review);
});

router.put(
  '/:id',
  auth,
  isValidID,
  createReviewValidation,
  validateInputs,
  async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: REVIEW_NOT_FOUND });
    }

    const hasPermission = review.hasUpdatePermission(req.user.id);
    if (!hasPermission) {
      return res
        .status(403)
        .json({ message: 'Only the review author can make updates.' });
    }

    review.rating = req.body.rating;
    review.review = req.body.review;
    await review.save();
    res.location(`/api/v1/reviews/${review._id}`).sendStatus(204);
  }
);

module.exports = router;
