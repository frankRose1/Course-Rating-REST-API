/**
 * Validation is done on required fields as defined in the schema
 *    This is meant to be an extra check before the data reaches the db
 */

const { body, validationResult } = require('express-validator/check');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const validator = {};

validator.createLoginValidation = [
  body('emailAddress')
    .isEmail()
    .withMessage('Please provide a properly formatted email address.'),
  body('password')
    .not()
    .isEmpty()
    .withMessage('Please provide your password.')
];

validator.createRegisterValidation = [
  body('fullName')
    .not()
    .isEmpty()
    .withMessage('Please provide your name.'),
  body('emailAddress')
    .isEmail()
    .withMessage('Please provide a properly formatted email address.')
    .custom((value, { req }) => {
      return User.findOne({ emailAddress: value }).then(user => {
        if (user)
          return Promise.reject(
            'A user with that email address already exists!'
          );
      });
    }),
  body('password', 'Password must be at least 8 characters.')
    .trim()
    .isLength({ min: 8 }),
  body('confirmPassword')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must match.');
      }
      return true;
    })
];

validator.createCourseValidation = [
  body('title', 'Please provide a course title at least 5 characters long.')
    .trim()
    .isLength({ min: 5 }),
  body(
    'description',
    'Please provide a course description at least 10 characters long.'
  )
    .trim()
    .isLength({ min: 10 }),
  body(
    'estimatedTime',
    'Please provide an estimated time of course completion.'
  )
    .not()
    .isEmpty()
];

validator.createReviewValidation = [
  body('rating', 'Please leave a rating between 1 and 5.')
    .not()
    .isEmpty()
];

validator.validateInputs = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  res.status(422).json({ errors: errors.array().map(err => err.msg) });
};

module.exports = validator;
