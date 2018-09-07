const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "A logged in user is needed to post a review!"]
    },
    postedOn: {
        type: Date,
        default: Date.now()
    },
    rating: {
        type: Number,
        required: [true, "Please leave a rating."],
        min: [1, "1 is the lowest possible rating."],
        max: [5, "5 is the highest possible rating."]
    },
    review: {
        type: String,
        required: [true, "Please leave a review."],
        trim: true
    }
});

const Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;