/**
 * All the API calls
 */

import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

const URL2 = 'http://localhost:3002/api';

/**
 * Function to retrieve all the tickets.
 * 
 * @returns an object containing the tickets [{ id: t.id, text: "text", title: "title", date: {..}, category: "administrative", state: "open", ownerId: 2, username: "user" }, ...]
 * @throws will throw an error if the response is not ok.
 */

async function getAllTickets() {
  const response = await fetch(URL + '/tickets');
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((t) => ({ id: t.id, text: t.text, title: t.title, date: dayjs(t.date), category: t.category, state: t.state, ownerId: t.ownerId, username: t.username }))
  } else {
    throw tickets;
  }
}

/**
 * Function to retrieve a ticket given its id.
 * 
 * @param id unique identifier of the ticket
 * @returns an object containing the ticket { id: t.id, text: "text", title: "title", date: {..}, category: "administrative", state: "open", ownerId: 2, username: "user" }
 * @throws will throw an error if the response is not ok
 */

async function getTicketById(id) {
  const response = await fetch(URL + `/ticket/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  const ticket = await response.json();

  if (response.ok) {
    return {
      id: ticket.id,
      text: ticket.text,
      title: ticket.title,
      date: dayjs(ticket.date),
      category: ticket.category,
      state: ticket.state,
      ownerId: ticket.ownerId,
      username: ticket.username
    };
  } else {
    throw ticket;
  }
}

/**
 * Function to retrieve all the blocks associated to a specific id.
 * 
 * @param id unique identifier of the ticket
 * @returns an object with the blocks like [{id: 1, text: "text", date: {..}, author: "user"},...] or the information about the errors
 */

async function getAllBlocks(id) {
  const response = await fetch(URL + `/blocks/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  const blocks = await response.json();
  if (response.ok) {
    return blocks.map((b) => ({ id: b.id, text: b.text, date: dayjs(b.date), author: b.author }))
  } else {
    throw blocks;
  }
}

/**
 * Function to create a ticket.
 * 
 * @param ticket an object representing a ticket
 * @returns {Promise<Object>} a promise that resolves to the new unique ticket ID, or rejects with an error message
 */

function createTicket(ticket) {
  return new Promise((resolve, reject) => {
    fetch(URL + `/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(Object.assign({}, ticket, { date: ticket.date.format("YYYY-MM-DD HH:mm") }))
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      } else {
        response.json()
          .then((message) => { reject(message); })
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
  });
}

/**
 * Function to create a block.
 * 
 * @param block an object representing a block
 * @param id unique identifier of the ticket
 * @returns a promise that resolves to the unique ID assigned to the new ticket, or rejects with an error message
 */

function createBlock(block, id) {
  return new Promise((resolve, reject) => {
    fetch(URL + `/ticket/${id}/addBlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(Object.assign({}, block, { date: block.date.format("YYYY-MM-DD HH:mm") }))
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      } else {
        response.json()
          .then((message) => { reject(message); })
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
  });
}

/**
 * Function to update the state of a specific ticket.
 * 
 * @param id unique identifier of the ticket to update
 * @param state the new state
 * @returns {Promise<Object>} a promise that resolves to a null value, or rejects with an error message
 */

function updateState(id, state) {
  return new Promise((resolve, reject) => {
    fetch(URL + `/ticket/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: id, state: state })
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        response.json()
          .then((message) => { reject(message); })
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
  });
}

/**
 * Function to update the category of a specific ticket.
 * 
 * @param id unique identifier of the ticket to update
 * @param category the new category
 * @returns {Promise<Object>} a promise that resolves to a null value, or rejects with an error message
 */

function updateCategory(id, category) {
  return new Promise((resolve, reject) => {
    fetch(URL + `/ticket/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: id, category: category })
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        response.json()
          .then((message) => { reject(message); })
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
  });
}

/**
 * Function to log in a user with given credentials.
 * 
 * @param credentials an object containing the user's login credentials
 * @param credentials.username the username of the user
 * @param credentials.password the password of the user
 * @returns an object containing user information {username: "user", "id":1, admin:0}
 * @throws will throw an error message if the login attempt is unsuccessful
 */

async function logIn(credentials) {
  let response = await fetch(URL + '/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

/**
 * Function to log out the current user.
 * 
 * @returns
 */

async function logOut() {
  await fetch(URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
}

/**
 * Function to retrieve information about the current logged-in user.
 * 
 * @returns an object containing user information {username: "user", "id":1, admin:0}
 * @throws will throw an error object in case of errors
 */

async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;
  }
}

/**
 * Function to retrieve an authorization token for the current user.
 * 
 * @returns an object containing the token and authorization level {token: "...", authLevel: "admin"}
 * @throws aill throw an error if there is an error
 */

async function getToken() {
  const response = await fetch(URL + '/auth-token', {
    credentials: 'include'
  });
  const token = await response.json();
  if (response.ok) {
    return token;
  } else {
    throw token;
  }
}

/**
 * Function to get the estimation for a specific ticket.
 * 
 * @param authToken a JWT token
 * @param title the title of the ticket
 * @param category the category of the ticket
 * @returns an object containing the estimation { estimation: 120}
 * @throws will throw an error object in case of errors
 */

async function getEstimation(authToken, title, category) {
  const response = await fetch(URL2 + '/estimation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: title, category: category }),
  });
  const estimation = await response.json();
  if (response.ok) {
    return estimation;
  } else {
    throw estimation;
  }
}

/**
 * Function to get the estimations for all the tickets.
 * 
 * @param authToken a JWT token
 * @param tickets a list of tickets
 * @returns an object containing the estimations [{ id:1, estimation: 230}, ...]
 * @throws will throw an error object in case of errors
 */

async function getEstimations(authToken, tickets) {
  const url = URL2 + '/estimations';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tickets),
    });

    const estimations = await response.json();

    if (response.ok) {
      return estimations;
    } else {
      throw estimations;
    }
  } catch (err) {
    throw err;
  }
}



const API = { getAllTickets, createTicket, getAllBlocks, createBlock, updateState, getTicketById, logIn, logOut, getUserInfo, getToken, getEstimation, updateCategory, getEstimations };

export default API;