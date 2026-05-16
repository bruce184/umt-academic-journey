const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', userController.getAllUsers);
router.get('/profile', protect, userController.getProfile);

router.get('/stats', protect, userController.getUserStats);
router.post('/stats', protect, userController.updateUserStats);

module.exports = router;
