'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

const { expressjwt: jwt } = require('express-jwt');

const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';

// THIS IS FOR DEBUGGING ONLY: when you start the server, generate a valid token to do tests, and print it to the console
//This is used to create the token
//const jsonwebtoken = require('jsonwebtoken');
//const expireTime = 60; //seconds
//const token = jsonwebtoken.sign( { access: 'premium', authId: 1234 }, jwtSecret, {expiresIn: expireTime});
//console.log(token);

// init express
const app = express();
const port = 3002;

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json

// Check token validity
app.use(jwt({
  secret: jwtSecret,
  algorithms: ["HS256"],
  // token from HTTP Authorization: header
})
);


// To return a better object in case of errors
app.use( function (err, req, res, next) {
  console.log("DEBUG: error handling function executed");
  if (err.name === 'UnauthorizedError') {
    // Example of err content:  {"code":"invalid_token","status":401,"name":"UnauthorizedError","inner":{"name":"TokenExpiredError","message":"jwt expired","expiredAt":"2024-05-23T19:23:58.000Z"}}
    res.status(401).json({ errors: [{  'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
} );


/*** APIs ***/

// POST /api/suggestions
app.post('/api/estimation', (req, res) => {
  console.log('DEBUG: req.auth: ', req.auth);
  const authAccessLevel = req.auth.access;
  const title = req.body.title || '';
  const category = req.body.category || '';
  let estimation = 0;

  // Function to count characters excluding spaces
  const countCharsExcludingSpaces = (str) => {
    return str.replace(/\s+/g, '').length;
  };

  // Count the characters in title and category, excluding spaces
  const titleLength = countCharsExcludingSpaces(title);
  const categoryLength = countCharsExcludingSpaces(category);

  // Sum the counts
  const totalLength = titleLength + categoryLength;

  // Multiply the sum by 10
  let result = totalLength * 10;

  // Generate a random number between 1 and 240
  const randomNum = Math.floor(Math.random() * 240) + 1;

  // Add the random number to the result
  result += randomNum;

  if (authAccessLevel === 'user') {
    result = Math.ceil(result/24);
  }

  // Return the estimation in the response
  res.json({ estimation: result });
});



/*** Other express-related instructions ***/

// Activate the server
app.listen(port, () => {
  console.log(`Server2 listening at http://localhost:${port}`);
});