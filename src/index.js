'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const router = require('./routes');
const errorHandlers = require('./handlers/errorHandlers');
const port = process.env.PORT || 5000;

const app = express();

// set the port
app.set('port', port);

// morgan for http request logging
app.use(morgan('dev'));

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
