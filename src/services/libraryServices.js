const db = require('../database/db');

class LibraryService {
    // Create a new book
    static async existingBook(book) {
        const existingBook = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM books WHERE isbn = ?', [book.isbn], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingBook) {
            throw new Error('Book with this ISBN already exists');
        }
    }
    
    static async createBook(book) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO books (
                    title, author, genre, publication_date, isbn,
                    edition, summary, total_copies, available_copies, location,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;
            
            const params = [
                book.title.trim(),
                book.author.trim(),
                book.genre.trim(),
                book.publicationDate,
                book.isbn.replace(/-/g, ''), // Remove hyphens from ISBN
                book.edition.trim(),
                book.summary.trim(),
                book.totalCopies,
                book.availableCopies,
                book.location.trim()
            ];

            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    // Return the newly created book
                    db.get('SELECT * FROM books WHERE id = ?', [this.lastID], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                }
            });
        });
    }

    // Get books with pagination, sorting, and filtering
    static async getBooks(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'id',
            sortOrder = 'ASC',
            genre = null,
            author = null,
            searchTerm = null
        } = options;

        return new Promise((resolve, reject) => {
            let whereClause = '';
            const params = [];
            const conditions = [];

            if (genre) {
                conditions.push('genre = ?');
                params.push(genre);
            }
            if (author) {
                conditions.push('author = ?');
                params.push(author);
            }
            if (searchTerm) {
                conditions.push('(title LIKE ? OR author LIKE ? OR summary LIKE ?)');
                params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
            }

            if (conditions.length > 0) {
                whereClause = 'WHERE ' + conditions.join(' AND ');
            }

            const offset = (page - 1) * limit;
            params.push(limit, offset);

            const sql = `
                SELECT * FROM books 
                ${whereClause}
                ORDER BY ${sortBy} ${sortOrder}
                LIMIT ? OFFSET ?
            `;

            db.all(sql, params, async (err, books) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Get total count for pagination
                const countSql = `SELECT COUNT(*) as count FROM books ${whereClause}`;
                const countParams = params.slice(0, -2); // Remove limit and offset

                db.get(countSql, countParams, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            books,
                            pagination: {
                                total: result.count,
                                page: page,
                                limit: limit,
                                totalPages: Math.ceil(result.count / limit)
                            }
                        });
                    }
                });
            });
        });
    }

    // Get a book by ID
    static async getBookById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Get a book by ISBN
    static async getBookByIsbn(isbn) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM books WHERE isbn = ?', [isbn], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Update a book
    static async updateBook(id, updates) {
        // Check if book exists
        const existingBook = await this.getBookById(id);
        if (!existingBook) {
            throw new Error('Book not found');
        }

        // If ISBN is being updated, check it's not already in use
        // if (updates.isbn && updates.isbn !== existingBook.isbn) {
        //     const isbnExists = await this.getBookByIsbn(updates.isbn);
        //     if (isbnExists) {
        //         throw new Error('ISBN already in use');
        //     }
        // }

        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE books SET
                    title = ?, author = ?, genre = ?, publication_date = ?,
                    isbn = ?, edition = ?, summary = ?, total_copies = ?,
                    available_copies = ?, location = ?
                WHERE id = ?
            `;

            db.run(sql, [
                updates.title || existingBook.title,
                updates.author || existingBook.author,
                updates.genre || existingBook.genre,
                updates.publicationDate || existingBook.publication_date,
                updates.isbn || existingBook.isbn,
                updates.edition || existingBook.edition,
                updates.summary || existingBook.summary,
                updates.totalCopies || existingBook.total_copies,
                updates.availableCopies || existingBook.available_copies,
                updates.location || existingBook.location,
                id
            ], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    resolve(null);
                } else {
                    // Return updated book
                    db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                }
            });
        });
    }

    // Delete a book
    static async deleteBook(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM books WHERE id = ?', [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    // Check out a book
    // static async checkoutBook(id) {
    //     return new Promise((resolve, reject) => {
    //         db.run(`
    //             UPDATE books 
    //             SET available_copies = available_copies - 1
    //             WHERE id = ? AND available_copies > 0
    //         `, [id], function(err) {
    //             if (err) {
    //                 reject(err);
    //             } else if (this.changes === 0) {
    //                 reject(new Error('Book not available for checkout'));
    //             } else {
    //                 resolve(true);
    //             }
    //         });
    //     });
    // }

    // Return a book
    // static async returnBook(id) {
    //     return new Promise((resolve, reject) => {
    //         db.run(`
    //             UPDATE books 
    //             SET available_copies = available_copies + 1
    //             WHERE id = ? AND available_copies < total_copies
    //         `, [id], function(err) {
    //             if (err) {
    //                 reject(err);
    //             } else if (this.changes === 0) {
    //                 reject(new Error('Cannot return book'));
    //             } else {
    //                 resolve(true);
    //             }
    //         });
    //     });
    // }

    static async checkoutBook(bookId, userId) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION;', (err) => {
                    if (err) return reject(err);

                    // Check if the book is available
                    db.get(
                        'SELECT available_copies FROM books WHERE id = ?',
                        [bookId],
                        (err, book) => {
                            if (err) return db.run('ROLLBACK;', () => reject(err));

                            if (!book || book.available_copies <= 0) {
                                return db.run('ROLLBACK;', () =>
                                    reject(new Error('Book not available for checkout'))
                                );
                            }

                            // Calculate due date (14 days from now)
                            const dueDate = new Date();
                            dueDate.setDate(dueDate.getDate() + 14);

                            // Decrease available copies
                            db.run(
                                'UPDATE books SET available_copies = available_copies - 1 WHERE id = ?',
                                [bookId],
                                (err) => {
                                    if (err) return db.run('ROLLBACK;', () => reject(err));

                                    // Insert into checkouts
                                    const checkoutSql = `
                                        INSERT INTO checkouts (
                                            book_id, user_id, checked_out_at, due_date, status
                                        ) VALUES (?, ?, datetime('now'), ?, 'borrowed')
                                    `;

                                    db.run(
                                        checkoutSql,
                                        [bookId, userId, dueDate.toISOString()],
                                        (err) => {
                                            if (err) return db.run('ROLLBACK;', () => reject(err));

                                            // Commit the transaction
                                            db.run('COMMIT;', (err) => {
                                                if (err) return reject(err);
                                                resolve(true);
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            });
        });
    }

    // Return a book
    static async returnBook(bookId, userId) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION;', (err) => {
                    if (err) return reject(err);

                    // Find the active checkout record
                    const checkoutSql = `
                        SELECT id FROM checkouts 
                        WHERE book_id = ? AND user_id = ? AND status = 'borrowed'
                    `;

                    db.get(checkoutSql, [bookId, userId], (err, checkout) => {
                        if (err) return db.run('ROLLBACK;', () => reject(err));

                        if (!checkout) {
                            return db.run('ROLLBACK;', () =>
                                reject(new Error('No active checkout found for this book and user'))
                            );
                        }

                        // Increment available copies
                        db.run(
                            'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?',
                            [bookId],
                            (err) => {
                                if (err) return db.run('ROLLBACK;', () => reject(err));

                                // Update the checkout record to mark it as returned
                                const updateCheckoutSql = `
                                    UPDATE checkouts 
                                    SET returned_at = datetime('now'), status = 'returned'
                                    WHERE id = ?
                                `;

                                db.run(updateCheckoutSql, [checkout.id], (err) => {
                                    if (err) return db.run('ROLLBACK;', () => reject(err));

                                    // Commit the transaction
                                    db.run('COMMIT;', (err) => {
                                        if (err) return reject(err);
                                        resolve(true);
                                    });
                                });
                            }
                        );
                    });
                });
            });
        });
    }

    // Search books by various criteria
    static async searchBooks(searchTerm) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM books 
                WHERE title LIKE ? 
                OR author LIKE ? 
                OR isbn LIKE ? 
                OR genre LIKE ?
                OR summary LIKE ?
            `;
            const searchPattern = `%${searchTerm}%`;
            const params = Array(5).fill(searchPattern);

            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = LibraryService;