'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local'); // username and password for login
const session = require('express-session'); // enable sessions
const dao = require('./dao');
const userDao = require('./userDao')
const cors = require('cors');
const moment = require('moment');

const jsonwebtoken = require('jsonwebtoken');
const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 60; //seconds

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};

// init express
const app = express();

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json
app.use(cors( corsOptions ));


/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize only the user id and store it in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});




// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'Not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wge8d239bwd93rkskb',   // change this random string, should be a secret value
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

/*** APIs ***/

// GET /api/questions
app.get('/api/tickets', (req, res) => {
  dao.listTickets()
    .then(tickets => res.json(tickets))
    .catch(() => res.status(500).end());
});

app.get('/api/ticket/:id',[
  check("id").isInt()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  dao.retrieveTicket(req.params.id)
    .then(ticket => {
      if (ticket !== null) {
        res.json(ticket);
      } else {
        res.status(404).json({ error: 'Ticket not found' });
      }
    })
    .catch(() => res.status(500).end());
});

app.get('/api/blocks/:id' ,[
  check("id").isInt()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }
  dao.listBlocks(req.params.id)
    .then(blocks => res.json(blocks))
    .catch(() => res.status(500).end());
});

app.post('/api/tickets', [
  check('ownerId').isInt(),
  check('title').isLength({min: 1 , max:100}),
  check('text').isLength({min: 1}),
  check('state').isIn(['open','close']),
  check('category').isIn(['payment', 'maintenance', 'inquiry', 'new feature', 'administrative']),
  check('date').custom((value) => {
    if (!moment(value, 'YYYY-MM-DD HH:mm', true).isValid()) {
        throw new Error('Invalid date format, should be YYYY-MM-DD HH:mm');
    }
    return true;
})
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const resultUser = await dao.getUser(req.body.ownerId);  // db consistency: make sure user already exists
  if (resultUser.error)
    res.status(404).json(resultUser);   // questionId does not exist, please insert the question before the answer
  else {
    const ticket = {
      title: req.body.title,
      text: req.body.text,
      state: req.body.state,
      category: req.body.category,
      date: req.body.date,
      ownerId: req.body.ownerId
    };

    try {
      const id = await dao.createTicket(ticket);
      res.status(201).json(id);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of answer ${ticket.text} by ${resultUser.username}.` });
    }
  }
});


//sanitize the text to be formatted also after the storing

app.post('/api/ticket/:id/addBlock', [
  check('text').isLength({min: 1}),
  check('author').isLength({min: 1, max:20}),
  check('date').custom((value) => {
    if (!moment(value, 'YYYY-MM-DD HH:mm', true).isValid()) {
        throw new Error('Invalid date format, should be YYYY-MM-DD HH:mm');
    }
    return true;
})
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const resultUser = await dao.getUsername(req.body.author);  // db consistency: make sure user already exists
  const resultTicket = await dao.getTicket(parseInt(req.params.id));
  //from getTicket you can retrieve the date of the ticket and accept the block only if the date is after the creation time
  if (resultUser.error && resultTicket.error )
    res.status(404).json(resultUser);   // questionId does not exist, please insert the question before the answer
  else {
    const block = {
      text: req.body.text,
      date: req.body.date,
      author: req.body.author,
      ticketId: req.params.id
    };

    try {
      const newBlock = await dao.createBlock(block);
      res.status(201).json(newBlock);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of answer ${ticket.text} by ${resultUser.username}.` });
    }
  }
});

app.put('/api/ticket/:id', [
  check('id').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({errors: errors.array()});
  }

  const ticket = req.body;
  if(ticket.state){
    if(ticket.id !== req.params.id && ticket.state !== "open" && ticket.state !== "close"){
      return res.status(422).json({error: `Database error; id ${req.params.id}, tID ${req.body.id}, state ${req.body.state} .`});
    }

    try {
      await dao.updateTicket(ticket, false);
      res.status(200).end();
    } catch(err) {
      res.status(503).json({error: `Database error during the update of ticket ${req.params.id}.`});
    }
  }else{
    //ticket.category
    console.log("category");
    const Category = {
      payment: 'payment',
      maintenance: 'maintenance',
      inquiry: 'inquiry',
      newFeature: 'new feature',
      administrative: 'administrative'
  };
    if(ticket.id !== req.params.id && !Object.values(Category).includes(ticket.category)){
      return res.status(422).json({error: `Database error; id ${req.params.id}, tID ${req.body.id}, category ${req.body.category} .`});
    }

    try {
      await dao.updateTicket(ticket, true);
      res.status(200).end();
    } catch(err) {
      res.status(503).json({error: `Database error during the update of ticket ${req.params.id}.`});
    }

  }

});

/*** Utility Functions ***/

// Make sure to set a reasonable value (not too small!) depending on the application constraints
// It is recommended to have a limit here or in the DB constraints to avoid malicious requests waste space in DB and network bandwidth.
// const maxTitleLength = 160;


// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};

/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json(info);
      }
      // success, perform the login
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser()
        return res.json(req.user);
      });
  })(req, res, next);
});

// ALTERNATIVE: if we are not interested in sending error messages...
/*
app.post('/api/sessions', passport.authenticate('local'), (req,res) => {
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  res.json(req.user);
});
*/

// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout( ()=> { res.end(); } );
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
});

/*** Token ***/

// GET /api/auth-token
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let authLevel = req.user.admin===1?"admin":"user";

  const payloadToSign = { access: authLevel, authId: 1234 };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, {expiresIn: expireTime});
  console.log({token: jwtToken, authLevel: authLevel});
  res.json({token: jwtToken, authLevel: authLevel});  // authLevel is just for debug. Anyway it is in the JWT payload
});


// Activating the server
const PORT = 3001;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));