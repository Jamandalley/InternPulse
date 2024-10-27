// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// const dbPath = process.env.NODE_ENV === 'test' 
//   ? ':memory:'
//   : path.resolve(__dirname, '../../dev-library.db');

// const db = new sqlite3.Database(dbPath, (err) => {
//   if (err) {
//     console.error('Error connecting to database:', err);
//   } else {
//     console.log('Connected to SQLite database');
//   }
// });

// module.exports = db;

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:'
  : path.resolve(__dirname, '../../dev-library.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    db.run('PRAGMA foreign_keys = ON;', (err) => {
      if (err) {
        console.error('Error enabling foreign key support:', err);
      } else {
        console.log('Connected to SQLite database with foreign key support');
      }
    });
  }
});

module.exports = db;