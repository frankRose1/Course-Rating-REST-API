const User = require('../models/userModel');

const userHandlers = {};

// GET /api/users 200 - Returns the currently authenticated user, (LOGIN)
userHandlers.getUser = (req, res, next) => {
    User.find({})
        .exec((err, users) => {
            if (err) {
                return next(err);
            }
    
            res.status(200).json(users);
        });
};

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content (SIGNUP)
userHandlers.createUser = (req, res, next) => {
    const {fullName, emailAddress, password, confirmPassword} = req.body;
    if (fullName &&
        emailAddress &&
        password &&
        confirmPassword) {
            //match the passwords
            if (password !== confirmPassword) {
                const error = new Error("Passwords must match.");
                error.status = 400;
                return next(error);
            } 
            // at this point we know the PW match
            const userData = {
                fullName,
                emailAddress,
                password
            };

            User.create(userData, (err, user) => {
                if (err) {
                    return next(err);
                } else {
                    res.location("/");
                    res.sendStatus(201);
                }
            });
    } else {
        const error = new Error("All fields are required");
        error.status = 400;
        return next(error);
    }
};

module.exports = userHandlers;