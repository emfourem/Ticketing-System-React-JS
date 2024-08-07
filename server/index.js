'use strict';

const express = require('express');

const morgan = require('morgan'); // logging middleware

const { check, validationResult } = require('express-validator'); // validation middleware

const validator = require('validator');

const passport = require('passport'); // auth middleware

const LocalStrategy = require('passport-local'); // username and password for login

const session = require('express-session'); // enable sessions

const cors = require('cors');

const moment = require('moment');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const dayjs = require('dayjs');

const dao = require('./dao');
const userDao = require('./dao-user');

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
app.use(cors(corsOptions));


/*** Set up Passport ***/

// set up the "username and password" login strategy
// by setting a function to verify username and password

passport.use(new LocalStrategy(
  function (username, password, done) {
    // Sanitize inputs
    username = validator.trim(username);
    username = validator.escape(username);
    password = validator.trim(password);

    // Validate inputs
    if (!validator.isLength(username, { min: 3, max: 30 }) || !validator.isLength(password, { min: 6 })) {
      return done(null, false, { message: 'Incorrect username or password.' });
    }

    userDao.getUser(username, password).then((user) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }

      return done(null, user);
    }).catch(err => done(err));
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize only the user id and store it in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(parseInt(id))
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  secret: 'aqpo9182uehdb27191203sna',
  resave: false,
  saveUninitialized: false
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

/**
 * Function to sanitize tickets.
 * 
 * @param ticket an object containing a ticket 
 * @returns an object containing the sanitized ticket
 */

function sanitizeTicket(ticket) {
  return {
    id: parseInt(ticket.id),
    title: DOMPurify.sanitize(ticket.title, { ALLOWED_TAGS: [] }),
    text: DOMPurify.sanitize(ticket.text, { ALLOWED_TAGS: ['b', 'i', 'br'] }),
    state: DOMPurify.sanitize(ticket.state, { ALLOWED_TAGS: [] }),
    category: DOMPurify.sanitize(ticket.category, { ALLOWED_TAGS: [] }),
    date: DOMPurify.sanitize(ticket.date, { ALLOWED_TAGS: [] }),
    ownerId: parseInt(ticket.ownerId),
    username: DOMPurify.sanitize(ticket.username, { ALLOWED_TAGS: [] })
  };
}

/**
 * Function to sanitize blocks.
 * 
 * @param ticket an object containing a block 
 * @returns an object containing the sanitized block
 */

function sanitizeBlock(block) {
  return {
    id: parseInt(block.id),
    text: DOMPurify.sanitize(block.text, { ALLOWED_TAGS: ['b', 'i', 'br'] }),
    date: DOMPurify.sanitize(block.date, { ALLOWED_TAGS: [] }),
    author: DOMPurify.sanitize(block.author, { ALLOWED_TAGS: [] })
  };
}

/**
 * Function to sanitize user information.
 * 
 * @param user an object containing the user information
 * @returns an object containing the sanitized object
 */

function sanitizeUser(user) {
  return {
    id: parseInt(user.id),
    username: DOMPurify.sanitize(user.username, { ALLOWED_TAGS: [] }),
    admin: parseInt(user.admin)
  };
}



/*** APIs ***/

/**
 * Get all the tickets.
 * Authentication is not needed.
 */

app.get('/api/tickets', (req, res) => {
  dao.listTickets()
    .then(tickets => res.json(tickets.map(sanitizeTicket)))
    .catch(() => res.status(500).end());
});

/**
 * Get a ticket given its id.
 * Authentication needed.
 */

app.get('/api/ticket/:id', isLoggedIn, [
  check("id").isInt().toInt()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  dao.getTicket(req.params.id)
    .then(ticket => {
      if (ticket !== null) {
        res.json(sanitizeTicket(ticket));
      } else {
        res.status(404).json({ error: 'Ticket not found' });
      }
    })
    .catch(() => res.status(500).end());
});

/**
 * Get the blocks related to a ticket identified by the id.
 * Authentication needed.
 */

app.get('/api/blocks/:id', isLoggedIn, [
  check("id").isInt().toInt()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  dao.listBlocks(req.params.id)
    .then(blocks => res.json(blocks.map(sanitizeBlock)))
    .catch(() => res.status(500).end());
});

/**
 * Create a new ticket.
 * Authentication needed.
 */

app.post('/api/tickets', isLoggedIn, [
  check('ownerId').isInt().toInt(),
  check('title').isLength({ min: 1, max: 100 }),
  check('text').isLength({ min: 1 }),
  check('state').isIn(['open', 'close']).trim(),
  check('category').isIn(['payment', 'maintenance', 'inquiry', 'new feature', 'administrative']).trim(),
  check('date').custom((value) => {
    if (!moment(value, 'YYYY-MM-DD HH:mm', true).isValid()) {
      throw new Error('Invalid date format, should be YYYY-MM-DD HH:mm');
    }
    return true;
  }).trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const resultUser = await userDao.getUser(req.body.ownerId);  // db consistency: make sure user already exists
  if (resultUser.error)
    res.status(404).json(resultUser);
  else {
    const ticket = {
      title: DOMPurify.sanitize(req.body.title, { ALLOWED_TAGS: [] }),
      text: DOMPurify.sanitize(req.body.text, { ALLOWED_TAGS: ['b', 'i', 'br'] }),
      state: DOMPurify.sanitize(req.body.state, { ALLOWED_TAGS: [] }),
      category: DOMPurify.sanitize(req.body.category, { ALLOWED_TAGS: [] }),
      date: DOMPurify.sanitize(req.body.date, { ALLOWED_TAGS: [] }),
      ownerId: req.body.ownerId
    };

    try {
      const id = await dao.createTicket(ticket);
      res.status(201).json(parseInt(id));
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of the new ticket` });
    }
  }
});

/**
 * Create a block related to a specfic ticket identified by its id.
 * Authentication needed.
 */

app.post('/api/ticket/:id/addBlock', isLoggedIn, [
  check('id').isInt().toInt(),
  check('text').isLength({ min: 1 }),
  check('author').isLength({ min: 1, max: 20 }),
  check('date').custom((value) => {
    if (!moment(value, 'YYYY-MM-DD HH:mm', true).isValid()) {
      throw new Error('Invalid date format, should be YYYY-MM-DD HH:mm');
    }
    return true;
  }).trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const resultUser = await userDao.getUsername(DOMPurify.sanitize(req.body.author));  // db consistency: make sure user already exists
  const resultTicket = await dao.getTicket(req.params.id); //db consistency: make sure ticket already exists

  if (resultUser.error && resultTicket.error)
    return res.status(404).json({ error: 'User or ticket not found.' });
  else {

    // Check: is the insertion date of the block after the insertion date of ticket?
    const ticketDate = dayjs(resultTicket.date, 'YYYY-MM-DD HH:mm');
    const blockDate = dayjs(req.body.date, 'YYYY-MM-DD HH:mm');

    if (ticketDate.isAfter(blockDate)) {
      return res.status(422).json({ error: 'Block date must be after ticket creation date.' });
    }
    const block = {
      text: DOMPurify.sanitize(req.body.text),
      date: req.body.date,
      author: DOMPurify.sanitize(req.body.author),
      ticketId: req.params.id
    };

    try {
      const id = await dao.createBlock(block);
      res.status(201).json(parseInt(id));
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of the block.` });
    }
  }
});

/**
 * Update the state or the category of a ticket identified by its id.
 */

app.put('/api/ticket/:id', isLoggedIn, [
  check('id').isInt().toInt(),
  check('id').isInt().toInt(),
  check('state').optional().isIn(['open', 'close']).trim(),
  check('category').optional().isIn(['payment', 'maintenance', 'inquiry', 'new feature', 'administrative']).trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const ticket = req.body;
  if (ticket.id !== req.params.id) {
    return res.status(422).json({ error: `Parameters are wrong.` });
  }
  if (ticket.state) {
    try {
      await dao.updateTicket(ticket, false);
      res.status(200).end();
    } catch (err) {
      res.status(503).json({ error: `Database error during the update of the state of the ticket.` });
    }
  } else if (ticket.category) {
      try {
        await dao.updateTicket(ticket, true);
        res.status(200).end();
      } catch (err) {
        res.status(503).json({ error: `Database error during the update of the category of the ticket.` });
      }
  } else {
    res.status(422).json({ error: ` Wrong request.` });
  }
});

/*** Users APIs ***/

// POST /sessions 
// login
app.post('/api/sessions', function (req, res, next) {
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
      return res.json(sanitizeUser(req.user));
    });
  })(req, res, next);
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(sanitizeUser(req.user));
  }
  else
    res.status(401).json({ error: 'Not authenticated' });;
});


// DELETE /sessions/current 
// logout
app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
  req.logout(() => { res.status(200).end(); });
});

/*** Token ***/

/**
 * Get the token.
 * Authentication needed.
 */
app.get('/api/auth-token', isLoggedIn, (req, res) => {
  let authLevel = req.user.admin === 1 ? "admin" : "user";

  const payloadToSign = { access: authLevel, authId: 1234 };
  const jwtToken = jsonwebtoken.sign(payloadToSign, jwtSecret, { expiresIn: expireTime });
  res.json({ token: jwtToken, authLevel: authLevel });
});


// Activating the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));