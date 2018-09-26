'use strict';

// load modules
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session); //let mongodb access the sessions
const errorHandlers = require('./handlers/errorHandlers');
const port = process.env.PORT || 5000;
//import models before the router
require('./models/userModel');
require('./models/reviewModel');
require('./models/courseModel');
const router = require('./routes');

const app = express();

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});
//Use this instead if working with a local DB
// mongoose.connect("mongodb://localhost:27017/course-api", {useNewUrlParser: true});
const db = mongoose.connection;

db.on("error", err => {
  console.log(`Error connecting to MongoDB: ${err.message}`);
});

db.once("open", () => {
  console.log("Connected to MongoDB.");
});

app.use(session({
  secret: process.env.SESSION_SECRET, //signs the cookie, ensures this application created it
  resave: true, //forces the session to be saved in the session store whether anything changed during the session or not
  saveUninitialized: false, //new and unmodified sessions will not be saved in the session store
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// set the port
app.set('port', port);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));

// send a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Course Review API'
  });
});

//routes
app.use("/api", router);

// to test the global error handler
app.get('/error', function (req, res) {
  throw new Error('Test error');
});

// send 404 if no other route matched
app.use(errorHandlers.notFound);

// global error handler
app.use(errorHandlers.globalErrorHandler);

// start listening port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

//export to be tested
module.exports = server;