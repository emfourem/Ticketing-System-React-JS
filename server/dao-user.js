'use strict';
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');
const crypto = require('crypto');

// open the database
const db = new sqlite.Database('ticketing.db', (err) => {
  if (err) throw err;
});

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'User not found.' });
      else {
        // by default, the local strategy looks for "username":
        const user = { id: row.id, username: row.username, admin: row.admin }
        resolve(user);
      }
    });
  });
};

exports.getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) { reject(err); }
      else if (row === undefined) { resolve(false); }
      else {
        const user = { id: row.id, username: row.username, admin: row.admin };

        const salt = row.salt;
        crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
          if (err) reject(err);

          const passwordHex = Buffer.from(row.password, 'hex');

          if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
            resolve(false);
          else resolve(user);
        });
      }
    });
  });
};

//get the id of an user given its username
exports.getUsername = (username) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username=?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      if (!row) {
        resolve({error:'User not found.'});
      } else {
        const user = { id: row.id };
        resolve(user);
      }
    });
  });
};