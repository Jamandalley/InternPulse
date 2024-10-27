const UserService = require('../services/userServices');

class UserController {
    static async registerUser(req, res) {
        try {
            const user = await UserService.createUser(req.body);
            res.status(201).json({
                status: 'success',
                code: 201,
                message: 'User registered successfully',
                data: { user }
            });
        } catch (error) {
            if (error.message === 'Email already registered') {
                return res.status(409).json({
                    status: 'error',
                    code: 409,
                    message: 'Registration failed',
                    errors: { details: error.message }
                });
            }
            res.status(500).json({
                status: 'error',
                code: 500,
                message: 'Internal server error',
                errors: { details: error.message }
            });
        }
    }

    static async getUserProfile(req, res) {
        try {
            const user = await UserService.getUser(req.params.userId);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    code: 404,
                    message: 'User not found'
                });
            }
            res.json({
                status: 'success',
                code: 200,
                message: 'User profile retrieved successfully',
                data: { user }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                code: 500,
                message: 'Internal server error',
                errors: { details: error.message }
            });
        }
    }

    static async getBorrowingHistory(req, res) {
        try {
            const history = await UserService.getUserBorrowingHistory(req.params.userId);
            res.json({
                status: 'success',
                code: 200,
                message: 'Borrowing history retrieved successfully',
                data: { history }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                code: 500,
                message: 'Internal server error',
                errors: { details: error.message }
            });
        }
    }

    static async getCurrentBorrowings(req, res) {
        try {
            const borrowings = await UserService.getCurrentBorrowings(req.params.userId);
            res.json({
                status: 'success',
                code: 200,
                message: 'Current borrowings retrieved successfully',
                data: { borrowings }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                code: 500,
                message: 'Internal server error',
                errors: { details: error.message }
            });
        }
    }
}

module.exports = UserController;