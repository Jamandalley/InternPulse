/*const db = require('./db');

const createTables = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      publication_date DATE NOT NULL,
      isbn TEXT NOT NULL UNIQUE,
      edition TEXT NOT NULL,
      summary TEXT NOT NULL,
      total_copies INTEGER NOT NULL,
      available_copies INTEGER NOT NULL,
      location TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Drop existing trigger if it exists to avoid conflicts
    DROP TRIGGER IF EXISTS update_timestamp;

    -- Create new trigger for updating the timestamp
    CREATE TRIGGER update_timestamp 
    AFTER UPDATE ON books
    FOR EACH ROW
    BEGIN
        UPDATE books 
        SET updated_at = DATETIME('now') 
        WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS checkouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER,
        user_id TEXT,
        checked_out_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        due_date DATETIME,
        returned_at DATETIME,
        status TEXT,
        total_copies INTEGER,
        available_copies INTEGER,
        location TEXT,
        FOREIGN KEY(book_id) REFERENCES books(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
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
      console.log('Books database table and trigger created successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error creating books database table:', err);
      process.exit(1);
    });
}

module.exports = { createTables };*/

// migrate.js
const db = require('./db');

const createTables = () => {
  const sql = `
    -- Books table with added indices
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      publication_date DATE NOT NULL,
      isbn TEXT NOT NULL UNIQUE,
      edition TEXT NOT NULL,
      summary TEXT NOT NULL,
      total_copies INTEGER NOT NULL,
      available_copies INTEGER NOT NULL,
      location TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indices for frequently queried columns
    CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
    CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
    CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
    CREATE INDEX IF NOT EXISTS idx_books_genre ON books(genre);

    -- Drop existing book update trigger if it exists
    DROP TRIGGER IF EXISTS update_book_timestamp;

    -- Create new book update trigger
    CREATE TRIGGER update_book_timestamp 
    AFTER UPDATE ON books
    FOR EACH ROW
    BEGIN
        UPDATE books 
        SET updated_at = DATETIME('now') 
        WHERE id = NEW.id;
    END;

    -- Enhanced users table with authentication and status
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'banned')),
        membership_type TEXT DEFAULT 'standard' CHECK(membership_type IN ('standard', 'premium', 'student')),
        max_books_allowed INTEGER DEFAULT 5,
        current_borrowed_books INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    );

    -- Create indices for user lookups
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

    -- User update trigger
    CREATE TRIGGER IF NOT EXISTS update_user_timestamp 
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users 
        SET updated_at = DATETIME('now') 
        WHERE id = NEW.id;
    END;

    -- Enhanced checkouts table with better tracking
    CREATE TABLE IF NOT EXISTS checkouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        checked_out_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        due_date DATETIME NOT NULL,
        returned_at DATETIME,
        status TEXT NOT NULL DEFAULT 'borrowed' 
          CHECK(status IN ('borrowed', 'returned', 'overdue', 'lost')),
        fine_amount DECIMAL(10,2) DEFAULT 0.00,
        fine_paid BOOLEAN DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE RESTRICT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    -- Create indices for checkout queries
    CREATE INDEX IF NOT EXISTS idx_checkouts_book_id ON checkouts(book_id);
    CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON checkouts(user_id);
    CREATE INDEX IF NOT EXISTS idx_checkouts_status ON checkouts(status);
    CREATE INDEX IF NOT EXISTS idx_checkouts_due_date ON checkouts(due_date);

    -- Checkout update trigger
    CREATE TRIGGER IF NOT EXISTS update_checkout_timestamp 
    AFTER UPDATE ON checkouts
    FOR EACH ROW
    BEGIN
        UPDATE checkouts 
        SET updated_at = DATETIME('now') 
        WHERE id = NEW.id;
    END;

    -- Library settings table for configurable parameters
    CREATE TABLE IF NOT EXISTS library_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create index for settings lookup
    CREATE INDEX IF NOT EXISTS idx_settings_key ON library_settings(setting_key);

    -- Settings update trigger
    CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
    AFTER UPDATE ON library_settings
    FOR EACH ROW
    BEGIN
        UPDATE library_settings 
        SET updated_at = DATETIME('now') 
        WHERE id = NEW.id;
    END;

    -- Trigger to update user's current_borrowed_books count on checkout
    CREATE TRIGGER IF NOT EXISTS update_user_borrowed_books_checkout
    AFTER INSERT ON checkouts
    FOR EACH ROW
    WHEN NEW.status = 'borrowed'
    BEGIN
        UPDATE users 
        SET current_borrowed_books = current_borrowed_books + 1
        WHERE id = NEW.user_id;
    END;

    -- Trigger to update user's current_borrowed_books count on return
    CREATE TRIGGER IF NOT EXISTS update_user_borrowed_books_return
    AFTER UPDATE ON checkouts
    FOR EACH ROW
    WHEN NEW.status = 'returned' AND OLD.status = 'borrowed'
    BEGIN
        UPDATE users 
        SET current_borrowed_books = current_borrowed_books - 1
        WHERE id = NEW.user_id;
    END;

    -- Trigger to automatically update status to 'overdue' when due date passes
    CREATE TRIGGER IF NOT EXISTS check_overdue_status
    AFTER UPDATE ON checkouts
    FOR EACH ROW
    WHEN NEW.status = 'borrowed' AND datetime('now') > NEW.due_date
    BEGIN
        UPDATE checkouts 
        SET status = 'overdue'
        WHERE id = NEW.id;
    END;

    -- Fine history table for tracking fines
    CREATE TABLE IF NOT EXISTS fine_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checkout_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'waived')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME,
        notes TEXT,
        FOREIGN KEY(checkout_id) REFERENCES checkouts(id) ON DELETE RESTRICT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    -- Create indices for fine history
    CREATE INDEX IF NOT EXISTS idx_fine_history_user_id ON fine_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_fine_history_status ON fine_history(status);
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

// Add function to initialize default library settings
const initializeLibrarySettings = () => {
  const sql = `
    INSERT OR IGNORE INTO library_settings (
      setting_key, 
      setting_value, 
      description
    ) VALUES 
    ('max_checkout_days', '14', 'Maximum number of days a book can be borrowed'),
    ('daily_fine_rate', '0.50', 'Daily fine rate for overdue books'),
    ('max_fine_amount', '25.00', 'Maximum fine amount per book'),
    ('standard_max_books', '5', 'Maximum books allowed for standard membership'),
    ('premium_max_books', '10', 'Maximum books allowed for premium membership'),
    ('student_max_books', '7', 'Maximum books allowed for student membership');
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
    .then(() => initializeLibrarySettings())
    .then(() => {
      console.log('Database tables and initial settings created successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error setting up database:', err);
      process.exit(1);
    });
}

module.exports = { createTables, initializeLibrarySettings };