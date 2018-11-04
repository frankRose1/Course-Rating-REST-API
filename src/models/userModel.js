const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcrypt');


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
    },
    avatar: String,
    interests: [String]
});

/**
 * Authenticate a user using bcrypt
 * @param {string} email - provided by the user in req.body or in Auth Headers
 * @param {string} password - provided by the user in req.body or in Auth Headers
 * @param {function} callback - return an error and/or a user
 */
UserSchema.statics.authenticate = function(email, password, callback){
    this.findOne({emailAddress: email})
        .exec(function(err ,user){
            if (err) {
                callback(err);
            }
            if (!user) {
                const error = new Error('Could not find a user with that email address.');
                error.status = 404;
                callback(error);
            }

            //if a user was found compare the password provided with the hashed password in the db
            bcrypt.compare(password, user.password, function(err, res){
                if (res) {
                    callback(null, user);
                } else {
                    callback(err);
                }
            });
        });
};

//Hash the user's plain text password before a save
UserSchema.pre("save", function(next){
    const user = this;
    bcrypt.hash(user.password, 10, function(err, hash){
        if (err) {
            return next(err);
        }

        user.password = hash;
        next();
    });
});

module.exports = mongoose.model('User', UserSchema);