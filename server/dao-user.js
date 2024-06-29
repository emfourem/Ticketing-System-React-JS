'use strict';
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');
const crypto = require('crypto');

/**
 * Open the database.
 */
const db = new sqlite.Database('ticketing.db', (err) => {
  if (err) throw err;
});

/**
 * Function to get the information of an user given its id.
 * 
 * @param id integer unique identifier of the user  
 * @returns a promise that resolves to an object containing the user info {id: 1, username : "user", admin: 1} or an error message
 */

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {

    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve({ error: 'User not found.' });
      else {
        const user = { id: row.id, username: row.username, admin: row.admin }
        resolve(user);
      }
    });
  });
};

/**
 * Function to check if the username and password are correct.
 * 
 * @param username string containing the user username
 * @param password string containing the user password
 * @returns a promise that resolves to an object containing the user info {id: 1, username : "user", admin: 1} or an error message
 */

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

/**
 * Function to get the ID of a user given its username.
 * 
 * @param username the username of the user
 * @returns a promise that resolves to an object containing the user ID {id: 1} or an error message
 */

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