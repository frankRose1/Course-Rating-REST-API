const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
//Email must be proper format
//Numbers have min and max validators
const UserSchema = new Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required."],
        trim: true
    },
    emailAddress: {
        type: String,
        validate: [validator.isEmail, "Invalid email address."],
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required."]
    }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;