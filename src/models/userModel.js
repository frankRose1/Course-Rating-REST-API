const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required.'],
    trim: true
  },
  emailAddress: {
    type: String,
    validate: [validator.isEmail, 'Invalid email address.'],
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required.']
  },
  avatar: String,
  interests: [String]
});

UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ id: this._id }, process.env.APP_SECRET, {
    expiresIn: '1h'
  });
  return token;
};

//Get a list of interests and the number of users with that interest
UserSchema.statics.getInterestsList = function() {
  return this.aggregate([
    { $unwind: '$interests' },
    //group by a specific interest, each time an interest is grouped add 1 to the "count" field
    { $group: { _id: '$interests', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

//Hash the user's plain text password before a save
UserSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }

    user.password = hash;
    next();
  });
});

module.exports = mongoose.model('User', UserSchema);
