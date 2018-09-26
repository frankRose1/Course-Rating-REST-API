const mongoose = require('mongoose');
const User = mongoose.model('User');

const userHandlers = {};

// GET /api/users 200 - Returns info about the users in the DB
userHandlers.getUsers = (req, res, next) => {
    //this route is login Protected
    User.find()
    .select('fullName interests _id')
    .exec((err, users) => {
        if (err) return next(err);
        res.status(200).json(users);
    });
};

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content (SIGNUP)
userHandlers.createUser = (req, res, next) => {
    const {fullName, emailAddress, password, confirmPassword} = req.body;
    if (fullName && emailAddress && password && confirmPassword) {
            //match the passwords
            if (password !== confirmPassword) {
                const error = new Error("Passwords must match.");
                error.status = 400;
                return next(error);
            } 

            User.create(req.body, (err, user) => {
                if (err) {
                    if (err.code == 11000) {
                        const error = new Error('A user with that email already exists!');
                        error.status = 400;
                        return next(error);
                    } else if (err.name == 'ValidationError') {
                        const error = new Error('Please provide a valid email address.');
                        error.status = 400;
                        return next(error);
                    }
                    return next(err);
                } else {
                    //log the user in
                    req.session.userId = user._id;
                    res.status(201);
                    res.redirect("/api/users/profile");
                }
            });
    } else {
        const error = new Error("Please fill out the required fields.");
        error.status = 400;
        return next(error);
    }
};

// GET /api/users/profile 200 --> if a user is currently signed in, they will have access to this route
userHandlers.userProfile = (req, res, next) => {
    User.findById(req.session.userId)
        .select('fullName emailAddress interests _id')
        .exec((err, user) => {
            if (err) return next(err);
            res.status(200).json(user);
        });
};

module.exports = userHandlers;