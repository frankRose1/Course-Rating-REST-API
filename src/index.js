'use strict';

// load modules
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const errorHandlers = require('./handlers/errorHandlers');
const port = process.env.PORT || 5000;
//import models before the router
require('./models/userModel');
require('./models/reviewModel');
require('./models/courseModel');
const router = require('./routes');

const app = express();
app.set('port', port);

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

//set the headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(passport.initialize());
require('./handlers/passport')(passport);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));

// send a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Course Review API',
    instructions: "Check out the readme.md for a guide! https://github.com/frankRose1/Course-Rating-REST-API/blob/master/readme.md"
  });
});

// to test the global error handler
app.get('/error', (req, res) => {
  throw new Error('Test error');
});

//routes
app.use("/api/v1", router);

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