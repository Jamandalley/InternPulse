const request = require('supertest');
const express = require('express');
const LibraryController = require('../controller/libraryController');
const LibraryService = require('../services/libraryServices');
const { createTables } = require('../database/migrate');

const db = require('../database/db');

beforeAll(async () => {
    await createTables();
});

afterEach(async () => {
    await db.run('DELETE FROM Books');
});

afterAll(async () => {
    await db.close();
});


// Mock LibraryService
jest.mock('../services/libraryServices');

const app = express();
app.use(express.json());
app.use('/api/v1/books', require('../routes/libraryRoutes'));

describe('LibraryController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/v1/books', () => {
        it('should get books with default pagination', async () => {
        const mockBooks = [
            { id: 1, title: 'Book 1' },
            { id: 2, title: 'Book 2' }
        ];
        
        const mockPagination = {
            page: 1,
            limit: 10,
            totalItems: 2,
            totalPages: 1
        };

        LibraryService.getBooks.mockResolvedValue({ 
            books: mockBooks, 
            pagination: mockPagination 
        });

        const response = await request(app)
            .get('/api/v1/books')
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.books).toEqual(mockBooks);
        expect(response.body.data.pagination).toEqual(mockPagination);
        expect(response.body.data.links).toBeDefined();
        });

        it('should handle filtering and sorting parameters', async () => {
            await request(app)
                .get('/api/v1/books')
                .query({
                page: 2,
                limit: 5,
                sortBy: 'title',
                sortOrder: 'DESC',
                genre: 'Fiction',
                author: 'John Doe',
                search: 'mystery'
                })
                .expect(200);

            expect(LibraryService.getBooks).toHaveBeenCalledWith({
                page: 2,
                limit: 5,
                sortBy: 'title',
                sortOrder: 'DESC',
                genre: 'Fiction',
                author: 'John Doe',
                searchTerm: 'mystery'
            });
        });
    });

    describe('GET /api/v1/books/search', () => {
        it('should search books successfully', async () => {
        const mockBooks = [
            { id: 1, title: 'Found Book 1' },
            { id: 2, title: 'Found Book 2' }
        ];

        LibraryService.searchBooks.mockResolvedValue(mockBooks);

        const response = await request(app)
            .get('/api/v1/books/search')
            .query({ q: 'Found' })
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.books).toEqual(mockBooks);
        });

        it('should return 400 when search query is missing', async () => {
        const response = await request(app)
            .get('/api/v1/books/search')
            .expect(400);

        expect(response.body.status).toBe('error');
        });
    });

    describe('GET /api/v1/books/:id', () => {
        it('should get book by id successfully', async () => {
        const mockBook = { id: 1, title: 'Test Book' };
        LibraryService.getBookById.mockResolvedValue(mockBook);

        const response = await request(app)
            .get('/api/v1/books/1')
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.book).toEqual(mockBook);
        });

        it('should return 404 when book is not found', async () => {
        LibraryService.getBookById.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/v1/books/999')
            .expect(404);

        expect(response.body.status).toBe('error');
        });
    });

    describe('GET /api/v1/books/isbn/:isbn', () => {
        it('should get book by ISBN successfully', async () => {
        const mockBook = { 
            id: 1, 
            title: 'Test Book',
            isbn: '978-3-16-148410-0'
        };
        LibraryService.getBookByIsbn.mockResolvedValue(mockBook);

        const response = await request(app)
            .get('/api/v1/books/isbn/978-3-16-148410-0')
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.book).toEqual(mockBook);
        });

        it('should return 400 when ISBN is not valid', async () => {
        LibraryService.getBookByIsbn.mockResolvedValue(null);

        const response = await request(app)
            .get('/api/v1/books/isbn/invalid-isbn')
            .expect(400);

        expect(response.body.status).toBe('error');
        });

        it('should return 404 when ISBN is not found', async () => {
            LibraryService.getBookByIsbn.mockResolvedValue(null);
    
            const response = await request(app)
                .get('/api/v1/books/isbn/978-3-16-148410-9')
                .expect(404);
    
            expect(response.body.status).toBe('error');
        });
    });

    describe('POST /api/v1/books', () => {
        it('should create a new book successfully', async () => {
            const newBook = {
                title: 'New Book',
                author: 'John Doe',
                isbn: '978-3-16-148410-0',
                genre: 'Fiction',
                publication_date: '2023-01-01', // Add any missing required fields
                edition: '1st',
                summary: 'This is a test book.',
                total_copies: 10,
                available_copies: 10,
                location: "Shelf B2"
            };
    
            const mockCreatedBook = { id: 1, ...newBook };
            LibraryService.createBook.mockResolvedValue(mockCreatedBook);
    
            const response = await request(app)
                .post('/api/v1/books')
                .send(newBook)
                .expect(201);
    
            expect(response.body.status).toBe('success');
            expect(response.body.data.book.title).toBe(newBook.title);
        });
    
        it('should handle duplicate ISBN error', async () => {
            await request(app)
                .post('/api/v1/books')
                .send({
                    title: 'Existing Book',
                    author: 'John Doe',
                    isbn: '978-3-16-148410-0',
                    genre: 'Fiction',
                    publication_date: '2023-01-01',
                    edition: '1st',
                    summary: 'This is an existing book.',
                    total_copies: 5,
                    available_copies: 10,
                    location: "Shelf B2"
            });
    
            const response = await request(app)
                .post('/api/v1/books')
                .send({
                    title: 'New Book',
                    author: 'John Doe',
                    isbn: '978-3-16-148410-0',
                    genre: 'Fiction',
                    publication_date: '2023-01-01',
                    edition: '1st',
                    summary: 'This is a test book.',
                    total_copies: 10,
                    available_copies: 10,
                    location: "Shelf B2"
                })
                .expect(409);
    
            expect(response.body.status).toBe('error');
            expect(response.body.errors.details).toContain('Book with this ISBN already exists.');
        });
    
        it('should return 400 when required fields are missing', async () => {
            const response = await request(app)
                .post('/api/v1/books')
                .send({}) // Sending an empty object to trigger validation error
                .expect(400);
    
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Validation error');
        });
    });
    
    describe('PUT /api/v1/books/:id', () => {
        beforeEach(async () => {
            // Create a book to update
            await request(app)
                .post('/api/v1/books')
                .send({
                    id: 1,
                    title: 'Original Book',
                    author: 'John Doe',
                    isbn: '9783161484100',
                    genre: 'Fiction',
                    publication_date: '2023-01-01',
                    edition: '1st',
                    summary: 'This is the original book.',
                    total_copies: 10,
                    available_copies: 10,
                    location: "Shelf B2"
                });
        });

        it('should update a book successfully', async () => {
            const updatedBook = {
                id: 1,
                title: 'Updated Book',
                author: 'Jane Doe',
                isbn: '9783161484100',
                genre: 'Non-Fiction',
                publication_date: '2023-01-01',
                edition: '2nd',
                summary: 'This is an updated test book.',
                total_copies: 5
            };
    
            const response = await request(app)
                .put('/api/v1/books/1') // Assuming the ID of the original book is 1
                .send(updatedBook)
                .expect(200);
    
            expect(response.body.status).toBe('success');
            expect(response.body.data.book.title).toBe(updatedBook.title);
        });
    
        it('should return 404 when updating non-existent book', async () => {
            const response = await request(app)
                .put('/api/v1/books/999') // Non-existent ID
                .send({
                    title: 'Updated Book',
                    author: 'Jane Doe',
                    isbn: '978-3-16-148410-1',
                    genre: 'Non-Fiction',
                    publication_date: '2023-01-01',
                    edition: '2nd',
                    summary: 'This is an updated test book.',
                    total_copies: 5
                })
                .expect(404);
    
            expect(response.body.status).toBe('error');
            expect(response.body.errors.details).toContain('The requested book does not exist');
        });
    
        it('should return 400 when no fields are provided', async () => {
            const response = await request(app)
                .put('/api/v1/books/1')
                .send({}) // Sending an empty object to trigger validation error
                .expect(400);
    
            expect(response.body.status).toBe('error');
        });
    
        it('should handle duplicate ISBN error during update', async () => {
            LibraryService.updateBook.mockRejectedValue(
                new Error('ISBN already in use')
            );
    
            const response = await request(app)
                .put('/api/v1/books/1')
                .send({
                    title: 'Updated Book',
                    author: 'Jane Doe',
                    isbn: '978-3-16-148410-1',
                    genre: 'Non-Fiction',
                    publication_date: '2023-01-01',
                    edition: '2nd',
                    summary: 'This is an updated test book.',
                    total_copies: 5,
                    available_copies: 10,
                    location: "Shelf B2"
                })
                .expect(409);
    
            expect(response.body.status).toBe('error');
            expect(response.body.errors.details).toContain('Duplicate ISBN');
        });
    });    

    describe('DELETE /api/v1/books/:id', () => {
        it('should delete a book successfully', async () => {
        LibraryService.deleteBook.mockResolvedValue(true);

        const response = await request(app)
            .delete('/api/v1/books/1')
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Book deleted successfully');
        });

        it('should return 404 when deleting non-existent book', async () => {
        LibraryService.deleteBook.mockResolvedValue(false);

        const response = await request(app)
            .delete('/api/v1/books/999')
            .expect(404);

        expect(response.body.status).toBe('error');
        });
    });

    describe('POST /api/v1/books/:id/checkout', () => {
        it('should checkout a book successfully', async () => {
        const mockBook = { 
            id: 1, 
            title: 'Test Book',
            status: 'checked_out'
        };
        
        LibraryService.checkoutBook.mockResolvedValue();
        LibraryService.getBookById.mockResolvedValue(mockBook);

        const response = await request(app)
            .post('/api/v1/books/1/checkout')
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.book).toEqual(mockBook);
        });

        it('should handle checkout of unavailable book', async () => {
        LibraryService.checkoutBook.mockRejectedValue(
            new Error('Book is not available')
        );

        const response = await request(app)
            .post('/api/v1/books/1/checkout')
            .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.errors.details).toContain('Book is not available');
        });
    });

    describe('POST /api/v1/books/:id/return', () => {
        it('should return a book successfully', async () => {
        const mockBook = { 
            id: 1, 
            title: 'Test Book',
            status: 'available'
        };
        
        LibraryService.returnBook.mockResolvedValue();
        LibraryService.getBookById.mockResolvedValue(mockBook);

        const response = await request(app)
            .post('/api/v1/books/1/return')
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.book).toEqual(mockBook);
        });

        it('should handle return of book that cannot be returned', async () => {
        LibraryService.returnBook.mockRejectedValue(
            new Error('Cannot return book that is not checked out')
        );

        const response = await request(app)
            .post('/api/v1/books/1/return')
            .expect(400);

        expect(response.body.status).toBe('error');
        expect(response.body.errors.details).toContain('Cannot return book that is not checked out');
        });
    });
});