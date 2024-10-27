const { body, param, query, validationResult } = require('express-validator');

const validateBook = {
    body: () => [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ max: 255 })
            .withMessage('Title must be less than 255 characters'),
        
        body('author')
            .trim()
            .notEmpty()
            .withMessage('Author is required')
            .isLength({ max: 255 })
            .withMessage('Author must be less than 255 characters'),
        
        body('genre')
            .trim()
            .notEmpty()
            .withMessage('Genre is required')
            .isLength({ max: 100 })
            .withMessage('Genre must be less than 100 characters'),
        
        body('publication_date')
            .notEmpty()
            .withMessage('Publication date is required')
            .isISO8601()
            .withMessage('Invalid publication date format'),
        
        body('isbn')
            .trim()
            .notEmpty()
            .withMessage('ISBN is required')
            .matches(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)
            .withMessage('Invalid ISBN format'),
        
        body('edition')
            .trim()
            .notEmpty()
            .withMessage('Edition is required')
            .isLength({ max: 50 })
            .withMessage('Edition must be less than 50 characters'),
        
        body('summary')
            .trim()
            .notEmpty()
            .withMessage('Summary is required')
            .isLength({ max: 2000 })
            .withMessage('Summary must be less than 2000 characters'),
        
        body('total_copies')
            .isInt({ min: 0 })
            .withMessage('Total copies must be a non-negative integer'),
        
        body('available_copies')
            .isInt({ min: 0 })
            .withMessage('Available copies must be a non-negative integer')
            .custom((value, { req }) => {
                if (value > req.body.total_copies) {
                    throw new Error('Available copies cannot exceed total copies');
                }
                return true;
            }),
        
        body('location')
            .trim()
            .notEmpty()
            .withMessage('Location is required')
            .isLength({ max: 100 })
            .withMessage('Location must be less than 100 characters')
    ],

    query: (fields) => {
        const validations = [];
        
        if (fields.includes('page')) {
            validations.push(
                query('page')
                    .optional()
                    .isInt({ min: 1 })
                    .withMessage('Page must be a positive integer')
            );
        }

        if (fields.includes('limit')) {
            validations.push(
                query('limit')
                    .optional()
                    .isInt({ min: 1, max: 100 })
                    .withMessage('Limit must be between 1 and 100')
            );
        }

        if (fields.includes('sortBy')) {
            validations.push(
                query('sortBy')
                    .optional()
                    .isIn(['title', 'author', 'genre', 'publication_date', 'isbn'])
                    .withMessage('Invalid sort field')
            );
        }

        if (fields.includes('sortOrder')) {
            validations.push(
                query('sortOrder')
                    .optional()
                    .isIn(['ASC', 'DESC', 'asc', 'desc'])
                    .withMessage('Sort order must be ASC or DESC')
            );
        }

        if (fields.includes('genre')) {
            validations.push(
                query('genre')
                    .optional()
                    .isLength({ max: 100 })
                    .withMessage('Genre must be less than 100 characters')
            );
        }

        if (fields.includes('author')) {
            validations.push(
                query('author')
                    .optional()
                    .isLength({ max: 255 })
                    .withMessage('Author must be less than 255 characters')
            );
        }

        if (fields.includes('search')) {
            validations.push(
                query('search')
                    .optional()
                    .isLength({ max: 255 })
                    .withMessage('Search term must be less than 255 characters')
            );
        }

        if (fields.includes('q')) {
            validations.push(
                query('q')
                    .notEmpty()
                    .withMessage('Search term is required')
                    .isLength({ max: 255 })
                    .withMessage('Search term must be less than 255 characters')
            );
        }

        return validations;
    }
};

const validatePartialBook = [
    body().custom((value, { req }) => {
        if (Object.keys(req.body).length === 0) {
            throw new Error('Request body cannot be empty');
        }
        return true;
    }),
    
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ max: 255 })
        .withMessage('Title must be less than 255 characters'),
    
    body('author')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Author cannot be empty')
        .isLength({ max: 255 }),
    
    // ... similar optional validations for other fields
];

const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid ID format')
];

const validateIsbn = [
    param('isbn')
        .matches(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/)
        .withMessage('Invalid ISBN format')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            code: 400,
            message: 'Validation error',
            errors: {
                details: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            }
        });
    }
    next();
};

module.exports = {
    validateBook,
    validatePartialBook,
    validateId,
    validateIsbn,
    handleValidationErrors
};