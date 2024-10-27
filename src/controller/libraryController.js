const LibraryService = require('../services/libraryServices');
const { isISBN } = require('validator');

class LibraryController {
    // Helper method for consistent response formatting
    static formatResponse(status, code, message, data = null, errors = null) {
        const response = {
            status,
            code,
            message
        };

        if (data) response.data = data;
        if (errors) response.errors = errors;
        return response;
    }

    // Get books with pagination, sorting, and filtering
    static async getBooks(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'id',
                sortOrder = 'ASC',
                genre,
                author,
                search
            } = req.query;
    
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy,
                sortOrder: sortOrder.toUpperCase(),
                genre,
                author,
                searchTerm: search
            };
    
            const result = await LibraryService.getBooks(options);
            const { books, pagination } = result;
    
            const response = LibraryController.formatResponse('success', 200, 'Books retrieved successfully', {
                books,
                pagination,
                links: {
                    self: `/api/v1/books?page=${pagination.page}`,
                    next: pagination.page < pagination.totalPages ? 
                        `/api/v1/books?page=${pagination.page + 1}` : null,
                    prev: pagination.page > 1 ? 
                        `/api/v1/books?page=${pagination.page - 1}` : null
                }
            });
    
            res.json(response);
        } catch (error) {
            res.status(500).json(
                LibraryController.formatResponse('error', 500, 'Internal server error', null, { details: error.message })
            );
        }
    }

    // Search books
    static async searchBooks(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json(
                    LibraryController.formatResponse('error', 400, 'Any of book Title, ISBN, Author, Genre or Summary is required', null, 
                        { details: 'Please provide any of the book Title, ISBN, Author, Genre or Summary of the book' })
                );
            }

            const books = await LibraryService.searchBooks(q);
            res.json(
                LibraryController.formatResponse('success', 200, 'Search completed successfully', { books })
            );
        } catch (error) {
            res.status(500).json(
                LibraryController.formatResponse('error', 500, 'Internal server error', null, { details: error.message })
            );
        }
    }

    // Get book by ID
    static async getBook(req, res) {
        try {
            const book = await LibraryService.getBookById(req.params.id);
            if (!book) {
                return res.status(404).json(
                    LibraryController.formatResponse('error', 404, 'Book not found', null, 
                        { details: 'The requested book does not exist' })
                );
            }

            res.json(
                LibraryController.formatResponse('success', 200, 'Book retrieved successfully', { book })
            );
        } catch (error) {
            res.status(500).json(
                LibraryController.formatResponse('error', 500, 'Internal server error', null, { details: error.message })
            );
        }
    }

    // Get book by ISBN
    static async getBookByIsbn(req, res) {
        try {
            // Validate ISBN format
            let { isbn } = req.params;
            isbn = isbn.replace(/-/g, '');  // Remove dashes from the ISBN

            if (isbn.length < 10 || isbn.length > 13) {  // Validate if the ISBN is either ISBN-10 or ISBN-13
                return res.status(400).json(
                    LibraryController.formatResponse('error', 400, 'Invalid ISBN format', null, 
                        { details: 'The provided ISBN is not valid. ISBN must be either 10 or 13 characters long.' })
                );
            }
    
            // Proceed to fetch the book if the ISBN is valid
            const book = await LibraryService.getBookByIsbn(isbn);
            if (!book) {
                return res.status(404).json(
                    LibraryController.formatResponse('error', 404, 'Book not found', null, 
                        { details: 'No book found with the provided ISBN' })
                );
            }
    
            res.json(
                LibraryController.formatResponse('success', 200, 'Book retrieved successfully', { book })
            );
        } catch (error) {
            res.status(500).json(
                LibraryController.formatResponse('error', 500, 'Internal server error', null, { details: error.message })
            );
        }
    }

    // Create new book
    static async createBook(req, res) {
        try {
            const existingBook = await LibraryService.existingBook(req.body);
            if (existingBook) {
                return res.status(409).json(
                    LibraryController.formatResponse('error', 409, 'Duplicate ISBN', null, 
                        { details: error.message }));
            }
            // Sanitize and prepare the book data
            const bookData = {
                title: req.body.title,
                author: req.body.author,
                genre: req.body.genre,
                publicationDate: req.body.publication_date,
                isbn: req.body.isbn,
                edition: req.body.edition,
                summary: req.body.summary,
                totalCopies: parseInt(req.body.total_copies),
                availableCopies: parseInt(req.body.available_copies),
                location: req.body.location
            };

            const newBook = await LibraryService.createBook(bookData);
            
            res.status(201).json(
                LibraryController.formatResponse('success', 201, 'Book created successfully', { book: newBook })
            );
        } catch (error) {
            if (error.message.includes('Validation failed')) {
                return res.status(400).json(
                    LibraryController.formatResponse('error', 400, 'Validation error', null, 
                        { details: error.message })
                );
            }
            
            if (error.message.includes('ISBN already exists')) {
                return res.status(409).json(
                    LibraryController.formatResponse('error', 409, 'Duplicate ISBN', null, 
                        { details: error.message })
                );
            }

            res.status(500).json(
                LibraryController.formatResponse('error', 500, 'Internal server error', null, 
                    { details: error.message })
            );
        }
    }

    // Update book
    static async updateBook(req, res) {
        try {
            // Basic validation for the request body
            const { title, author, isbn, genre } = req.body;
            if (!title && !author && !isbn && !genre) {
                return res.status(400).json(
                    LibraryController.formatResponse('error', 400, 'At least one field is required to update', null, 
                        { details: 'Provide at least one of the following fields: title, author, ISBN, genre.' })
                );
            }
    
            const updatedBook = await LibraryService.updateBook(req.params.id, req.body);
            if (!updatedBook) {
                return res.status(404).json(
                    LibraryController.formatResponse('error', 404, 'Book not found', null, 
                        { details: 'The requested book does not exist' })
                );
            }
    
            res.json(
                LibraryController.formatResponse('success', 200, 'Book updated successfully', { book: updatedBook })
            );
        } catch (error) {
            if (error.message.includes('ISBN already in use')) {
                return res.status(409).json(
                    LibraryController.formatResponse('error', 409, 'Duplicate ISBN', null, 
                        { details: error.message })
                );
            }
    
            // Handle other unexpected errors
            res.status(500).json(
                LibraryController.formatResponse('error', 500, 'Internal server error', null, { details: error.message })
            );
        }
    }

    // Delete book
    static async deleteBook(req, res) {
        try {
            const deleted = await LibraryService.deleteBook(req.params.id);
            if (!deleted) {
                return res.status(404).json(
                    LibraryController.formatResponse('error', 404, 'Book not found', null, 
                        { details: 'The requested book does not exist' })
                );
            }

            res.status(200).json(
                LibraryController.formatResponse('success', 200, 'Book deleted successfully')
            );
        } catch (error) {
            res.status(500).json(
                LibraryController.formatResponse('error', 500, 'Internal server error', null, { details: error.message })
            );
        }
    }

    // Checkout book
    // static async checkoutBook(req, res) {
    //     try {
    //         await LibraryService.checkoutBook(req.params.id);
    //         const book = await LibraryService.getBookById(req.params.id);
            
    //         res.json(
    //             LibraryController.formatResponse('success', 200, 'Book checked out successfully', { book })
    //         );
    //     } catch (error) {
    //         if (error.message.includes('not available')) {
    //             return res.status(400).json(
    //                 LibraryController.formatResponse('error', 400, 'Book not available', null, 
    //                     { details: error.message })
    //             );
    //         }

    //         res.status(500).json(
    //             LibraryController.formatResponse('error', 500, 'Internal server error', null, { details: error.message })
    //         );
    //     }
    // }

    // Return book
    // static async returnBook(req, res) {
    //     try {
    //         await LibraryService.returnBook(req.params.id);
    //         const book = await LibraryService.getBookById(req.params.id);
            
    //         res.json(
    //             LibraryController.formatResponse('success', 200, 'Book returned successfully', { book })
    //         );
    //     } catch (error) {
    //         if (error.message.includes('Cannot return')) {
    //             return res.status(400).json(
    //                 LibraryController.formatResponse('error', 400, 'Cannot return book', null, 
    //                     { details: error.message })
    //             );
    //         }

    //         res.status(500).json(
    //             LibraryController.formatResponse('error', 500, 'Internal server error', null, { details: error.message })
    //         );
    //     }
    // }

    static async checkoutBook(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json(
                    LibraryController.formatResponse('error', 400, 'User ID is required', null, 
                        { details: 'Please provide a user ID to checkout the book' })
                );
            }

            await LibraryService.checkoutBook(req.params.id, userId);
            const book = await LibraryService.getBookById(req.params.id);
            
            res.json(
                LibraryController.formatResponse('success', 200, 'Book checked out successfully', { book })
            );
        } catch (error) {
            if (error.message.includes('not available')) {
                return res.status(400).json(
                    LibraryController.formatResponse('error', 400, 'Book not available', null, 
                        { details: error.message })
                );
            }

            res.status(500).json(
                LibraryController.formatResponse('error', 500, 'Internal server error', null, 
                    { details: error.message })
            );
        }
    }

    // Updated return book
    static async returnBook(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json(
                    LibraryController.formatResponse('error', 400, 'User ID is required', null, 
                        { details: 'Please provide a user ID to return the book' })
                );
            }

            await LibraryService.returnBook(req.params.id, userId);
            const book = await LibraryService.getBookById(req.params.id);
            
            res.json(
                LibraryController.formatResponse('success', 200, 'Book returned successfully', { book })
            );
        } catch (error) {
            if (error.message.includes('No active checkout')) {
                return res.status(400).json(
                    LibraryController.formatResponse('error', 400, 'Invalid return attempt', null, 
                        { details: error.message })
                );
            }

            res.status(500).json(
                LibraryController.formatResponse('error', 500, 'Internal server error', null, 
                    { details: error.message })
            );
        }
    }
}

module.exports = LibraryController;