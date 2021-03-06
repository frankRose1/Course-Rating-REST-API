const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'You must provide a course title.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A logged in user is required to create a course.']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description.'],
    trim: true
  },
  estimatedTime: {
    type: String,
    required: [true, 'Please provide an estimated time of course completion.'],
    trim: true
  },
  materialsNeeded: {
    type: String,
    trim: true
  },
  steps: [
    {
      stepNumber: Number,
      title: {
        type: String,
        required: [true, 'Please provide a step title.'],
        trim: true
      },
      description: {
        type: String,
        required: [true, 'Please provide a step description.'],
        trim: true
      }
    }
  ]
});

/**
 * Verifies that the user attemting to update the course is the user who created it
 */
CourseSchema.methods.hasUpdatePermission = function(userId) {
  return this.user.toString() === userId;
};

/**
 * Used in middleware to prevent a course owner from reviewing their own course
 * @param {string} courseId - course ID from the req.params
 * @param {string} userId - an authenticated user will be available on the request (req.session.userId) from sessions
 * @param {function} callback - callback the results
 */
CourseSchema.statics.checkCourseOwner = function(courseId, userId, callback) {
  this.findById(courseId).exec((err, course) => {
    if (err) {
      return callback(err);
    }

    let error;
    if (!course) {
      error = new Error('Could not find a course with that ID.');
      error.status = 404;
      return callback(error);
    }

    //compare the user's id on the request to the user who owns this course
    if (course.user._id.equals(userId)) {
      error = new Error("You can't post a review on your own course!");
      error.status = 403;
      return callback(error);
    } else {
      callback(null);
    }
  });
};

CourseSchema.statics.getTopRated = function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'course',
        as: 'topReviews'
      }
    },
    //match docs where [1] index exists
    {
      $match: { 'topReviews.1': { $exists: true } }
    },
    //add "averageRating" field and grab a few fields from the model
    {
      $project: {
        averageRating: { $avg: '$topReviews.rating' },
        title: '$$ROOT.title',
        description: '$$ROOT.description',
        estimatedTime: '$$ROOT.estimatedTime'
      }
    },
    //sort by new "averageRating" field
    {
      $sort: { averageRating: -1 }
    },
    //limit to at most 10
    { $limit: 10 }
  ]);
};

module.exports = mongoose.model('Course', CourseSchema);
