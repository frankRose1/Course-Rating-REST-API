'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const router = require('./routes');
const errorHandlers = require('./handlers/errorHandlers');
const port = process.env.PORT || 5000;

const app = express();

//connect to mongodb
mongoose.connect("mongodb://localhost:27017/course-api", {useNewUrlParser: true});

const db = mongoose.connection;

db.on("error", err => {
  console.log(`Error connecting to MongoDB: ${err.message}`);
});

db.once("open", () => {
  console.log("Connected to MongoDB.");
});

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
