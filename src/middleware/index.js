/**
 * Middlware to parse auth headers sent with the request and to gran permissions to these routes:
 *  POST /api/courses
    PUT /api/courses/:courseId
    GET /api/users
    POST /api/courses/:courseId/reviews
 */
const auth = require('basic-auth');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const middleware = {};

middleware.auth = (req, res, next) => {
    //parse the headers
    const credentials = auth(req);
        // ==> { name: "A Name", pass: "whatever"} || undefined if auth headers are invalid

    if (!credentials) {
        const error = new Error("Invalid or missing authorization headers.");
        error.status = 401;
        return next(error);
    }

    if (credentials.name && credentials.pass) {
        //authenticate the user
        User.authenticate(credentials.name, credentials.pass, (err, user) => {
            if (err) {
                return next(err);
            }
            //add the user to the request to be available in next middleware
            req.user = user;
            next();
        });
    }
};

module.exports = middleware;
