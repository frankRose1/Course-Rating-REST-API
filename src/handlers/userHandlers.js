const mongoose = require('mongoose');
const User = mongoose.model('User');

const userHandlers = {};

// GET /api/users 200 - Returns the currently authenticated user
userHandlers.getUser = (req, res, next) => {
    //custom auth middleware will add the "user" propery to req
    const id = req.user._id;

    User.findById(id)
        .exec((err, user) => {
            if (err) {
                return next(err);
            }
    
            res.status(200)
            res.json(user);
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