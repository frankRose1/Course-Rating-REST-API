const mongoose = require('mongoose');
const MONGO_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DB_URI
    : process.env.MONGO_URI;

module.exports = function() {
  mongoose
    .connect(
      MONGO_URI,
      { useNewUrlParser: true }
    )
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(`Error connecting to MongoDB ${err}`));
};
