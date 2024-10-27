const express = require('express');
const LibraryController = require('../controller/libraryController');
const { validateBook, validatePartialBook, validateId, validateIsbn, handleValidationErrors } = require('../middleware/libraryValidation');

const router = express.Router();

// Get all books with optional filtering and sorting
router.get('/', 
    validateBook.query(['page', 'limit', 'sortBy', 'sortOrder', 'genre', 'author', 'search']), 
    handleValidationErrors,
    LibraryController.getBooks
);

// Search books
router.get('/search',
    validateBook.query(['q']),
    handleValidationErrors,
    LibraryController.searchBooks
);

// Get book by ISBN
router.get('/isbn/:isbn',
    validateIsbn,
    handleValidationErrors,
    LibraryController.getBookByIsbn
);

// Get book by ID
router.get('/:id',
    validateId,
    handleValidationErrors,
    LibraryController.getBook
);

// Create new book
router.post('/',
    validateBook.body(),
    handleValidationErrors,
    LibraryController.createBook
);

// Update book
router.put('/:id',
    validateId,
    validateBook.body(),
    handleValidationErrors,
    LibraryController.updateBook
);

// Partial update book
router.patch('/:id',
    validateId,
    validatePartialBook,
    handleValidationErrors,
    LibraryController.updateBook
);

// Delete book
router.delete('/:id',
    validateId,
    handleValidationErrors,
    LibraryController.deleteBook
);

// Checkout book
router.post('/:id/checkout',
    validateId,
    handleValidationErrors,
    LibraryController.checkoutBook
);

// Return book
router.post('/:id/return',
    validateId,
    handleValidationErrors,
    LibraryController.returnBook
);

module.exports = router;