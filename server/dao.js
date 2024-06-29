'use strict';
/* Data Access Object (DAO) module for accessing the database */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');
const userDao = require('./dao-user');

/**
 * Open the database.
 */

const db = new sqlite.Database('ticketing.db', (err) => {
  if (err) throw err;
});

/**
 * Function to get all the tickets.
 * 
 * @returns a promise that resolves to an object containing the tickets or an error message
 * [{id: 1, title: "title", text: "text", state: "open", category: "payment", date: {...}, ownerId: 1, username: "user"}, ...]
 */

exports.listTickets = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets';
    db.all(sql, [], async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = await Promise.all(rows.map(async (t) => {
        const username = await userDao.getUserById(t.ownerId);
        return {
          id: t.id,
          title: t.title,
          text: t.text,
          state: t.state,
          category: t.category,
          date: dayjs(t.date),
          ownerId: t.ownerId,
          username: username.username
        };
      }));
      resolve(tickets);
    });
  });
}

/**
 * Function to get a ticket given its id.
 * 
 * @param id integer unique identifier of the ticket 
 * @returns a promise that resolves to an object containing the ticket or an error message
 * {id: 1, title: "title", text: "text", state: "open", category: "payment", date: {...}, ownerId: 1, username: "user"}
 */

exports.getTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    db.get(sql, [id], async (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row) {
        const user = await userDao.getUserById(row.ownerId);
        resolve({
          id: row.id,
          title: row.title,
          text: row.text,
          state: row.state,
          category: row.category,
          date: dayjs(row.date),
          ownerId: row.ownerId,
          username: user.username
        });
      } else {
        resolve({error:'Ticket not found.'});
      }
    });
  });
};

/**
 * Function to get all the blocks associated to a specific ticket identified by its id.
 * 
 * @param id integer unique identifier of the ticket 
 * @returns a promise that resolves to an object containing the blocks or an error message
 * [{id: 1, author: "user", date: {...}, text: "text" }, ...]
 */

exports.listBlocks = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM blocks WHERE ticketId=?';
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const blocks = rows.map((b) => (
        {
          id: b.id,
          author: b.author,
          date: dayjs(b.date),
          text: b.text
        }));
      resolve(blocks);
    });
  });
}

/**
 * Function to create a ticket.
 * 
 * @param ticket an object containing the information of the new ticket  without the id
 * {title: "title", text: "text", state: "open", category: "payment", date: {...}, ownerId: 1}
 * @returns a promise that resolves to the ID of the created ticket or an error message
 */

exports.createTicket = (ticket) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO tickets(title, text, state, category, date, ownerId) VALUES(?, ?, ?,?, ?, ?)';
    db.run(sql, [ticket.title, ticket.text, ticket.state, ticket.category, ticket.date, ticket.ownerId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

/**
 * Function to create a block.
 * 
 * @param ticket an object containing the information of the new block  without the id
 * {text: "text", author: "user", date: {...}, ticketId: 2}
 * @returns a promise that resolves to the ID of the created block or an error message
 */

exports.createBlock = (block) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO blocks(text, author, date, ticketId) VALUES(?, ?, ?, ?)';
    db.run(sql, [block.text, block.author, block.date, block.ticketId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

/**
 * Function to update a ticket.
 * 
 * @param ticket an object containing the id and the state or the category
 * {id: 1, state: "open"} or {id: 1, state: "new feature"}
 * @param flag boolean value; if true, the category is updated, otherwise the state
 * @returns a promise that resolves to the number of changes or an error message
 */

exports.updateTicket = (ticket, flag) => {
  if (flag) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE tickets SET category = ? WHERE id = ?';
      db.run(sql, [ticket.category, ticket.id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes);
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE tickets SET state = ? WHERE id = ?';
      db.run(sql, [ticket.state, ticket.id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes);
      });
    });
  }
};