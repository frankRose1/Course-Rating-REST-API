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

const Course = mongoose.model('Course', CourseSchema);

module.exports = Course;