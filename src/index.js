require('dotenv').config({ path: '.env' });
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet')
const errorHandlers = require('./handlers/errorHandlers');
const port = process.env.PORT || 5000;
require('./models/userModel');
require('./models/reviewModel');
require('./models/courseModel');
const router = require('./routes');

const app = express();
app.set('port', port);

//set the headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, PUT, POST, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(helmet())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Course Review API',
    instructions:
      'Check out the readme.md for a guide! https://github.com/frankRose1/Course-Rating-REST-API/blob/master/readme.md'
  });
});

//routes
app.use('/api/v1', router);

// send 404 if no other route matched
app.use(errorHandlers.notFound);

// global error handler
app.use(errorHandlers.globalErrorHandler);

require('./db')();
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

//export to be tested
module.exports = server;
