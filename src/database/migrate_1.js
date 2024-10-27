const db = require('./db');
const util = require('util');

// Promisify db.run and db.exec
const runAsync = util.promisify(db.run.bind(db));
const execAsync = util.promisify(db.exec.bind(db));

const createTables = async () => {
  try {
    // Start transaction
    await runAsync('BEGIN TRANSACTION;');

    const statements = [
      // Drop existing triggers
      `DROP TRIGGER IF EXISTS update_book_timestamp;
       DROP TRIGGER IF EXISTS update_user_timestamp;
       DROP TRIGGER IF EXISTS update_book_availability_on_checkout;
       DROP TRIGGER IF EXISTS check_overdue_status;
       DROP TRIGGER IF EXISTS validate_user_book_limit;`,

      // Drop and recreate library_settings table
      `DROP TABLE IF EXISTS library_settings;`,

      // Create library_settings table
      `CREATE TABLE IF NOT EXISTS library_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        data_type TEXT NOT NULL CHECK(data_type IN ('number', 'text', 'boolean', 'date')),
        description TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,

      // Create books table
      `CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        genre TEXT NOT NULL,
        publication_date DATE NOT NULL,
        isbn TEXT NOT NULL UNIQUE CHECK(length(isbn) IN (10, 13)),
        edition TEXT NOT NULL,
        summary TEXT NOT NULL,
        total_copies INTEGER NOT NULL CHECK(total_copies >= 0),
        available_copies INTEGER NOT NULL CHECK(available_copies >= 0 AND available_copies <= total_copies),
        location TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'maintenance', 'retired')),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
      CREATE INDEX IF NOT EXISTS idx_books_search ON books(title, author);
      CREATE INDEX IF NOT EXISTS idx_books_availability ON books(status, available_copies) 
        WHERE status = 'available' AND available_copies > 0;`,

      // Create users table
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL CHECK(length(trim(name)) > 0),
        email TEXT UNIQUE NOT NULL CHECK(email LIKE '%_@__%.__%'),
        password_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'banned')),
        membership_type TEXT NOT NULL DEFAULT 'standard' CHECK(membership_type IN ('standard', 'premium', 'student')),
        max_books_allowed INTEGER NOT NULL DEFAULT 5 CHECK(max_books_allowed >= 0),
        current_borrowed_books INTEGER NOT NULL DEFAULT 0 CHECK(current_borrowed_books >= 0),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        failed_login_attempts INTEGER DEFAULT 0 CHECK(failed_login_attempts >= 0),
        account_locked_until DATETIME
      );`,

      // Create checkouts table
      `CREATE TABLE IF NOT EXISTS checkouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        checked_out_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        due_date DATETIME NOT NULL CHECK(due_date > checked_out_at),
        returned_at DATETIME CHECK(returned_at IS NULL OR returned_at >= checked_out_at),
        status TEXT NOT NULL DEFAULT 'borrowed' 
          CHECK(status IN ('borrowed', 'returned', 'overdue', 'lost')),
        fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK(fine_amount >= 0),
        fine_paid BOOLEAN NOT NULL DEFAULT 0,
        notes TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE RESTRICT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT
      );`,

      // Create fine_history table
      `CREATE TABLE IF NOT EXISTS fine_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        checkout_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL CHECK(amount > 0),
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'waived')),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        paid_at DATETIME CHECK(paid_at IS NULL OR paid_at >= created_at),
        payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'online') OR payment_method IS NULL),
        waived_by TEXT REFERENCES users(id),
        waived_reason TEXT,
        notes TEXT,
        FOREIGN KEY(checkout_id) REFERENCES checkouts(id) ON DELETE RESTRICT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE RESTRICT
      );`,

      // Create triggers
      `CREATE TRIGGER IF NOT EXISTS update_book_timestamp 
       AFTER UPDATE ON books
       FOR EACH ROW
       BEGIN
         UPDATE books 
         SET updated_at = DATETIME('now') 
         WHERE id = NEW.id;
       END;`,

      `CREATE TRIGGER IF NOT EXISTS update_user_timestamp 
       AFTER UPDATE ON users
       BEGIN
         UPDATE users 
         SET updated_at = DATETIME('now') 
         WHERE id = NEW.id;
       END;`,

      `CREATE TRIGGER IF NOT EXISTS update_book_availability_on_checkout
       AFTER INSERT ON checkouts
       WHEN NEW.status = 'borrowed'
       BEGIN
         UPDATE books 
         SET available_copies = available_copies - 1,
             updated_at = DATETIME('now')
         WHERE id = NEW.book_id
         AND available_copies > 0;
         
         UPDATE users
         SET current_borrowed_books = current_borrowed_books + 1,
             updated_at = DATETIME('now')
         WHERE id = NEW.user_id;

         SELECT RAISE(ROLLBACK, 'No available copies')
         WHERE (SELECT available_copies FROM books WHERE id = NEW.book_id) < 0;
       END;`,

      `CREATE TRIGGER IF NOT EXISTS check_overdue_status
       AFTER UPDATE ON checkouts
       WHEN NEW.status = 'borrowed' 
       AND datetime('now') > NEW.due_date 
       AND NEW.status != 'overdue'
       BEGIN
         UPDATE checkouts 
         SET status = 'overdue',
             updated_at = DATETIME('now')
         WHERE id = NEW.id;
       END;`,

      `CREATE TRIGGER IF NOT EXISTS validate_user_book_limit
       BEFORE INSERT ON checkouts
       WHEN NEW.status = 'borrowed'
       BEGIN
         SELECT RAISE(ROLLBACK, 'User has reached maximum book limit')
         WHERE (
           SELECT current_borrowed_books >= max_books_allowed 
           FROM users 
           WHERE id = NEW.user_id
         );
       END;`,

      // Insert default settings
      `INSERT OR IGNORE INTO library_settings (
        setting_key, 
        setting_value, 
        data_type,
        description
      ) VALUES 
      ('max_checkout_days', '14', 'number', 'Maximum number of days a book can be borrowed'),
      ('daily_fine_rate', '0.50', 'number', 'Daily fine rate for overdue books'),
      ('max_fine_amount', '25.00', 'number', 'Maximum fine amount per book'),
      ('standard_max_books', '5', 'number', 'Maximum books allowed for standard membership'),
      ('premium_max_books', '10', 'number', 'Maximum books allowed for premium membership'),
      ('student_max_books', '7', 'number', 'Maximum books allowed for student membership'),
      ('allow_renewals', 'true', 'boolean', 'Whether to allow book renewals'),
      ('renewal_limit', '2', 'number', 'Maximum number of times a book can be renewed');`
    ];

    // Execute all statements in sequence
    for (const statement of statements) {
      await execAsync(statement);
    }

    // Commit transaction
    await runAsync('COMMIT;');
    console.log('Migration completed successfully');

  } catch (error) {
    // Rollback transaction
    console.error('Migration failed:', error);
    try {
      await runAsync('ROLLBACK;');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    throw error;
  }
};

// Export the function and run if this is the main module
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Database tables and initial settings created successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error setting up database:', err);
      process.exit(1);
    });
}

module.exports = { createTables };