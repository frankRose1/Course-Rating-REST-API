const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "You must provide a course title."]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "A logged in user is required to create a course."]
    },
    description: {
        type: String,
        required: [true, "Please provide a course description."],
        trim: true
    },
    estimatedTime: {
        type: String,
        trim: true
    },
    materialsNeeded: {
        type: String,
        trim: true
    },
    steps: [{
        stepNumber: Number,
        title: {
            type: String,
            required: [true, "Please provide a step title."],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Please provide a step description."],
            trim: true
        }
    }],
    reviews: [{ 
        type: mongoose.Schema.ObjectId,
        ref: 'Review'
    }]
});

/**
 * Used in middleware to prevent a course owner from reviewing their own course
 * @param {string} courseId - course ID from the req.params
 * @param {string} userId - an authenticated user will be available on the request (req.user) from previous middleware
 * @param {function} callback - callback the results 
 */
CourseSchema.statics.checkCourseOwner = function(courseId, userId, callback){
    this.findById(courseId)
        .exec((err, course) => {
            if (err) {
                callback(err);
            }
            if (!course) {
                const error = new Error('Could not find a course with that ID.');
                error.status = 404;
                callback(error);
            }

            //compare the user's id on the request to the user who owns this course
            if (course.user.equals(userId)) {
                //if they match, callback an error
                const error = new Error('You can\'t post a review on your own course!');
                error.status = 403;
                callback(error);
            } else {
                callback(null);
            }
        });
};

module.exports = mongoose.model('Course', CourseSchema);