'use strict';
/* Data Access Object (DAO) module for accessing the database */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');
const userDao = require('./dao-user');

// open the database
const db = new sqlite.Database('ticketing.db', (err) => {
  if (err) throw err;
});

// get all tickets
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

//get a specific ticket
exports.retrieveTicket = (id) => {
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

//get all the blocks related to a specific ticket
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
          date: b.date,
          text: b.text
        }));
      resolve(blocks);
    });
  });
}

exports.getTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({ error: 'Ticket not found.' });
      } else {
        const ticket =
        {
          id: row.id,
          title: row.title,
          text: row.text,
          state: row.state,
          category: row.category,
          date: dayjs(row.date),
          ownerId: row.ownerId,
        };
        resolve(ticket);
      }
    });
  });
};

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