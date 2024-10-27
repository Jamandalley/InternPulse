const db = require('../database/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class UserService {
    static async createUser(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const userId = uuidv4();

        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO users (id, name, email, password_hash, created_at)
                VALUES (?, ?, ?, ?, datetime('now'))
            `;
            
            db.run(sql, [userId, userData.name, userData.email, hashedPassword], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        reject(new Error('Email already registered'));
                    }
                    reject(err);
                } else {
                    resolve({ id: userId, name: userData.name, email: userData.email });
                }
            });
        });
    }

    static async getUser(userId) {
        return new Promise((resolve, reject) => {
            db.get('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async getUserBorrowingHistory(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    c.id as checkout_id,
                    b.title,
                    b.author,
                    c.checked_out_at,
                    c.due_date,
                    c.returned_at,
                    c.status,
                    CASE 
                        WHEN c.returned_at IS NULL AND datetime('now') > c.due_date 
                        THEN CAST(ROUND((JULIANDAY('now') - JULIANDAY(c.due_date))) AS INTEGER)
                        ELSE 0 
                    END as days_overdue
                FROM checkouts c
                JOIN books b ON c.book_id = b.id
                WHERE c.user_id = ?
                ORDER BY c.checked_out_at DESC
            `;

            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getCurrentBorrowings(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    c.id as checkout_id,
                    b.title,
                    b.author,
                    c.checked_out_at,
                    c.due_date,
                    CASE 
                        WHEN datetime('now') > c.due_date 
                        THEN CAST(ROUND((JULIANDAY('now') - JULIANDAY(c.due_date))) AS INTEGER)
                        ELSE 0 
                    END as days_overdue
                FROM checkouts c
                JOIN books b ON c.book_id = b.id
                WHERE c.user_id = ? AND c.status = 'borrowed'
                ORDER BY c.checked_out_at DESC
            `;

            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = UserService;