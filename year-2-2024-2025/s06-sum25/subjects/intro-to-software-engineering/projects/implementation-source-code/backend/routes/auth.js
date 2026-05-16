const express = require('express');
const { login, getMe, register } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin'), register);

module.exports = router; 