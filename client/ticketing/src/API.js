/**
 * All the API calls
 */

import dayjs from "dayjs";

const URL = 'http://localhost:3001/api';

async function getAllTickets() {
  // call  /api/questions
  const response = await fetch(URL+'/tickets');
  const tickets = await response.json();
  if (response.ok) {
    return tickets.map((e) => ({id: e.id, text:e.text, title:e.title, date: dayjs(e.date), category: e.category, state:e.state, ownerId:e.ownerId, username: e.username }) )
  } else {
    throw questions;  // expected to be a json object (coming from the server) with info about the error
  }
}

async function getTicketById(id) {
  // call  /api/ticket/:id
  const response = await fetch(URL+`/ticket/${id}`);
  const data = await response.json();
  if (response.ok) {
    return data
  } else {
    throw data;  // expected to be a json object (coming from the server) with info about the errors
  }
}

async function getAllBlocks(id) {
  // call  /api/blocks/:id
  const response = await fetch(URL+`/blocks/${id}`);
  const blocks = await response.json();
  if (response.ok) {
    return blocks.map((e) => ({id: e.id, text:e.text, date: dayjs(e.date), author: e.author }) )
  } else {
    throw blocks;  // expected to be a json object (coming from the server) with info about the error
  }
}

function createTicket(ticket) {
  // call  POST /api/answers
  return new Promise((resolve, reject) => {
    fetch(URL+`/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.assign({}, ticket, {date: ticket.date.format("YYYY-MM-DD HH:mm")}))
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function createBlock(block, id) {
  // call  POST /api/ticket/:ticketId/addBlock
  return new Promise((resolve, reject) => {
    fetch(URL+`/ticket/${id}/addBlock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.assign({}, block, {date: block.date.format("YYYY-MM-DD HH:mm")}))
    }).then((response) => {
      if (response.ok) {
        response.json()
          .then((id) => resolve(id))
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

function updateState(id, state) {
  // call  PUT /api/answers/<id>
  return new Promise((resolve, reject) => {
    fetch(URL+`/ticket/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, state: state })
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        // analyze the cause of error
        response.json()
          .then((message) => { reject(message); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

const API = {getAllTickets, createTicket, getAllBlocks, createBlock, updateState, getTicketById};
export default API;