'use strict';

/** DB access module **/

import { Database } from 'sqlite3';

// open the database
const db = new Database('ticketing.db', (err) => {
  if (err) throw err;
});

export default db;