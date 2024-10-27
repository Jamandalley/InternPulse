const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');
const { validateUser } = require('../middleware/userValidation');

router.post('/register', validateUser, UserController.registerUser);
router.get('/:userId', UserController.getUserProfile);
router.get('/:userId/history', UserController.getBorrowingHistory);
router.get('/:userId/current-borrowings', UserController.getCurrentBorrowings);

module.exports = router;