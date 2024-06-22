'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB.  NB: use ./ syntax for files in the same dir
const cors = require('cors');
const moment = require('moment');

/*const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};*/

// init express
const app = express();

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json()); // To automatically decode incoming json
app.use(cors(/* corsOptions */));

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
    .then(state => {
      if (state !== null) {
        res.json({ state }); // Send back only the state
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
      const newTicket = await dao.createTicket(ticket);
      res.status(201).json(Object.assign({}, newTicket, { username: resultUser.username }));
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
  if(ticket.id !== req.params.id && ticket.state !== "open" && ticket.state !== "close"){
    return res.status(422).json({error: `Database error; id ${req.params.id}, tID ${req.body.id}, state ${req.body.state} .`});
  }

  try {
    await dao.updateTicket(ticket);
    res.status(200).end();
  } catch(err) {
    res.status(503).json({error: `Database error during the update of ticket ${req.params.id}.`});
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




/*** Films APIs ***/

/*
// 1. Retrieve the list of all the available films.
// GET /api/films
// This route also handles "filter=?" (optional) query parameter, accessed via  req.query.filter
app.get('/api/films', 
  (req, res) => {
    // get films that match optional filter in the query
    listFilms(req.query.filter)
      .then(films => res.json(films))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);

// 1bis. OPTIONAL: Retrieve the list of films where the title contains a given string.
// GET /api/searchFilms?titleSubstring=...
// This API could be merged with the previous one, if the same route name is desired
app.get('/api/searchFilms', 
  (req, res) => {
    // get films that match optional filter in the query
    searchFilms(req.query.titleSubstring)
      .then(films => res.json(films))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);


// 2. Retrieve a film, given its “id”.
// GET /api/films/<id>
// Given a film id, this route returns the associated film from the library.
app.get('/api/films/:id',
  [ check('id').isInt({min: 1}) ],    // check: is the id an integer, and is it a positive integer?
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }
    try {
      const result = await getFilm(req.params.id);
      if (result.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).end();
    }
  }
);


// 3. Create a new film, by providing all relevant information.
// POST /api/films
// This route adds a new film to film library.
app.post('/api/films',
  [
    check('title').isLength({min: 1, max: maxTitleLength}),  // double check if a max length applies to your case
    check('favorite').isBoolean(),
    // only date (first ten chars) and valid ISO e.g. 2024-02-09
    check('watchDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}),
    check('rating').isInt({min: 1, max: 5}),
  ], 
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    const film = {
      title: req.body.title,
      favorite: req.body.favorite,
      watchDate: req.body.watchDate,
      rating: req.body.rating,
    };

    try {
      const result = await createFilm(film); // NOTE: createFilm returns the newly created object
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new film: ${err}` }); 
    }
  }
);

// 4. Update an existing film, by providing all the relevant information
// PUT /api/films/<id>
// This route allows to modify a film, specifiying its id and the necessary data.
app.put('/api/films/:id',
  [
    check('id').isInt({min: 1}),    // check: is the id an integer, and is it a positive integer?
    check('title').isLength({min: 1, max: maxTitleLength}).optional(),
    check('favorite').isBoolean().optional(),
    // only date (first ten chars) and valid ISO 
    check('watchDate').isLength({min: 10, max: 10}).isISO8601({strict: true}).optional({checkFalsy: true}),
    check('rating').isInt({min: 1, max: 5}).optional(),
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    const filmId = Number(req.params.id);
    // Is the id in the body present? If yes, is it equal to the id in the url?
    if (req.body.id && req.body.id !== filmId) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    }


    try {
      const film = await getFilm(filmId);
      if (film.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(404).json(film);
      const newFilm = {
        title: req.body.title || film.title,
        favorite: req.body.favorite || film.favorite,
        watchDate: req.body.watchDate || film.watchDate,
        rating: req.body.rating || film.rating,
      };
      const result = await updateFilm(film.id, newFilm);
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result); 
    } catch (err) {
      res.status(503).json({ error: `Database error during the update of film ${req.params.id}` });
    }
  }
);

// 5. Mark an existing film as favorite/unfavorite
// PUT /api/films/<id>/favorite 
// This route changes only the favorite value, and it is idempotent. It could also be a PATCH method.
app.put('/api/films/:id/favorite',
  [
    check('id').isInt({min: 1}),    // check: is the id an integer, and is it a positive integer?
    check('favorite').isBoolean(),
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    const filmId = Number(req.params.id);
    // Is the id in the body present? If yes, is it equal to the id in the url?
    if (req.body.id && req.body.id !== filmId) {
      return res.status(422).json({ error: 'URL and body id mismatch' });
    }

    try {
      const film = await getFilm(filmId);
      if (film.error)   // If not found, the function returns a resolved promise with an object where the "error" field is set
        return res.status(404).json(film);
      film.favorite = req.body.favorite;  // update favorite property
      const result = await updateFilm(film.id, film);
      return res.json(result); 
    } catch (err) {
      res.status(503).json({ error: `Database error during the favorite update of film ${req.params.id}` });
    }
  }
);

// 6. Change the rating of a specific film
// POST /api/films/<id>/change-rating 
// This route changes the rating value. Note that it must be a POST, not a PUT, because it is NOT idempotent.
app.post('/api/films/change-rating',
  [ // These checks will apply to the req.body part
    check('id').isInt({min: 1}),
    check('deltaRating').isInt({ min: -4, max: 4 }),
  ],
  async (req, res) => {
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json( errors.errors ); // error message is sent back as a json with the error info
    }

    try {
      /* IMPORTANT NOTE: Only for the purpose of this class, DB operations done in the SAME API
      (such as the following ones) are assumed to be performed without interference from other requests to the DB.
      In a real case a DB transaction/locking mechanisms should be used. Sqlite does not help in this regard.
      Thus querying DB with transactions can be avoided for the purpose of this class. 
      
      // NOTE: Check if the film exists and the result is a valid rating, before performing the operation
      const film = await getFilm(req.body.id);
      if (film.error)
        return res.status(404).json(film);
      if (!film.rating)
        return res.status(422).json({error: `Modification of rating not allowed because rating is not set`});
      const deltaRating = req.body.deltaRating;
      if (film.rating + deltaRating > 5 || film.rating + deltaRating < 1)
        return res.status(422).json({error: `Modification of rating would yield a value out of valid range`});
      const result = await updateFilmRating(film.id, deltaRating);
      return res.json(result); 
    } catch (err) {
      res.status(503).json({ error: `Database error during the rating update of film ${req.params.id}` });
    }
  }
);


// 7. Delete an existing film, given its "id"
// DELETE /api/films/<id>
// Given a film id, this route deletes the associated film from the library.
app.delete('/api/films/:id',
  [ check('id').isInt({min: 1}) ],
  async (req, res) => {
    try {
      // NOTE: if there is no film with the specified id, the delete operation is considered successful.
      await deleteFilm(req.params.id);
      res.status(200).end();  // Empty body 
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of film ${req.params.id}: ${err} ` });
    }
  }
);
*/

// Activating the server
const PORT = 3001;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));