const db = require('./db');

const createTables = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      price REAL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Database tables created successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error creating database tables:', err);
      process.exit(1);
    });
}

module.exports = { createTables };