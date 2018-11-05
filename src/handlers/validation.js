const {body, validationResult} = require('express-validator/check');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const validator = {};

validator.createLoginValidation = [
  body('emailAddress').isEmail().withMessage('Please provide a properly formatted email address.'),
  body('password', 'Password must be atleast 8 characters.').isLength({min: 8})
];

validator.createRegisterValidation = [
  body('fullName').not().isEmpty().withMessage('Please provide your name.'),
  body('emailAddress')
    .isEmail().withMessage('Please provide a properly formatted email address.')
    .custom((value, {req}) => {
      return User.findOne( {emailAddress: value} )
        .then(user => {
          if (user) return Promise.reject('A user with that email address already exists!')
        })
    }),
  body('password', 'Password must be atleast 8 characters.').isLength({min: 8}),
  body('confirmPassword').custom((value, {req}) => {
    if (value !== req.body.password){
      throw new Error('Passwords must match.')
    }
    return true;
  })
];

validator.validateInputs = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  res.status(422).json( { errors: errors.array().map(err => err.msg )} );
};

module.exports = validator;