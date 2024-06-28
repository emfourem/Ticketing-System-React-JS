/**
 * All the API calls
 */

import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

const URL2 = 'http://localhost:3002/api';

async function getAllTickets() {
  // call  /api/tickets
  const response = await fetch(URL + '/tickets');
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((e) => ({ id: e.id, text: e.text, title: e.title, date: dayjs(e.date), category: e.category, state: e.state, ownerId: e.ownerId, username: e.username }))
  } else {
    throw questions;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getTicketById(id) {
  // call /api/ticket/:id
  const response = await fetch(URL + `/ticket/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  const ticket = await response.json();

  if (response.ok) {
    // Directly returning the ticket object after converting the date to dayjs
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
    throw ticket;  // expected to be a json object (coming from the server) with info about the errors
  }
}

async function getAllBlocks(id) {
  // call  /api/blocks/:id
  const response = await fetch(URL + `/blocks/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  const blocks = await response.json();
  if (response.ok) {
    return blocks.map((e) => ({ id: e.id, text: e.text, date: dayjs(e.date), author: e.author }))
  } else {
    throw blocks;  // expected to be a json object (coming from the server) with info about the error
  }
}

function createTicket(ticket) {
  // call  POST /api/tickets
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
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
  });
}

function createBlock(block, id) {
  // call  POST /api/ticket/:ticketId/addBlock
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
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
  });
}

function updateState(id, state) {
  // call  PUT /api/ticket/:id
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
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
  });
}

function updateCategory(id, category) {
  // call  PUT /api/ticket/:id
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
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) });
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) });
  });
}

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

async function logOut() {
  await fetch(URL + '/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
}

async function getUserInfo() {
  const response = await fetch(URL + '/sessions/current', {
    credentials: 'include'
  });
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server
  }
}

async function getToken() {
  const response = await fetch(URL + '/auth-token', {
    credentials: 'include'
  });
  const token = await response.json();
  if (response.ok) {
    return token;
  } else {
    throw token;  // an object with the error coming from the server
  }
}

async function getEstimation(authToken, title, category) {
  // call POST api/estimation
  const response = await fetch(URL2 + '/estimation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: title, category: category }),
  });
  const info = await response.json();
  if (response.ok) {
    return info;
  } else {
    throw info;  // expected to be a json object (coming from the server) with info about the error
  }
}

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

    const info = await response.json();

    if (response.ok) {
      return info;
    } else {
      throw info;
    }
  } catch (err) {
    throw err;
  }
}



const API = { getAllTickets, createTicket, getAllBlocks, createBlock, updateState, getTicketById, logIn, logOut, getUserInfo, getToken, getEstimation, updateCategory, getEstimations };
export default API;