require('dotenv').config({ path: '.env' });
const express = require('express');
require('express-async-errors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const port = process.env.PORT || 5000;
require('./models/userModel');
require('./models/reviewModel');
require('./models/courseModel');

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

app.use(helmet());
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
require('./routes')(app);

require('./db')();
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

//export to be tested
module.exports = server;
