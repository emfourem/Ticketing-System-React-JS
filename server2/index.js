'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
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


app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ errors: [{ 'param': 'Server', 'msg': 'Authorization error', 'path': err.code }] });
  } else {
    next();
  }
});


/*** APIs ***/

// POST /api/estimation
app.post('/api/estimation', (req, res) => {
  const authAccessLevel = req.auth.access;
  const title = req.body.title || '';
  const category = req.body.category || '';

  // Function to count characters excluding spaces
  const countCharsWithoutSpaces = (str) => {
    return str.replace(/\s+/g, '').length;
  };

  const totalLength = countCharsWithoutSpaces(title) + countCharsWithoutSpaces(category);
  let result = (totalLength * 10) + (Math.floor(Math.random() * 240) + 1);
  if (authAccessLevel === 'user') {
    result = Math.ceil(result / 24);
  }
  // Return the estimation in the response
  res.json({ estimation: result });
});

app.post('/api/estimations', (req, res) => {
  const authAccessLevel = req.auth.access;
  if (authAccessLevel === 'admin') {
    const tickets = req.body;

    // Function to count characters excluding spaces
    const countCharsWithoutSpaces = (str) => {
      return str.replace(/\s+/g, '').length;
    };

    // Compute estimation for each ticket
    const estimations = tickets.map(ticket => {
      const totalLength = countCharsWithoutSpaces(ticket.title) + countCharsWithoutSpaces(ticket.category);
      let result = (totalLength * 10) + (Math.floor(Math.random() * 240) + 1);
      return { id: ticket.id, estimation: result };
    });

    // Return the estimations in the response
    res.json(estimations);
  }
});

// Activate the server
app.listen(port, () => {
  console.log(`Server2 listening at http://localhost:${port}`);
});