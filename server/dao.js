'use strict';
/* Data Access Object (DAO) module for accessing questions and answers */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('ticketing.db', (err) => {
    if(err) throw err;
  });
  
// get all questions
exports.listTickets = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets';
    db.all(sql, [], async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const tickets = await Promise.all(rows.map(async (t) => {
        const username = await exports.getUser(t.ownerId);
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

exports.retrieveTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    db.get(sql, [id], async (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row) {
        const user = await exports.getUser(row.ownerId);
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
        resolve(null);  // or reject(new Error('Ticket not found'));
      }
    });
  });
};


exports.listBlocks = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM blocks WHERE ticketId=?';
    db.all(sql, [id], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const blocks = rows.map( (b) => (
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

exports.getUser = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'User not found.'});
      } else {
        const user = { id : row.id, username: row.username, admin: row.admin  };
        resolve(user);
      }
    });
  });
};

exports.getUsername = (username) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username=?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'User not found.'});
      } else {
        const user = { id : row.id };
        resolve(user);
      }
    });
  });
};

exports.getTicket = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM tickets WHERE id=?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (row == undefined) {
        resolve({error: 'Ticket not found.'});
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
      resolve(exports.getTicket(this.lastID));
    });
  });
};

exports.updateTicket = (ticket, flag) => {
  if(flag){
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
  }else{
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