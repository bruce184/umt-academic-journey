const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getPaginationParams } = require('../middleware/paginationMiddleware');
const adminController = require('../controllers/adminController');

// Protect all admin routes
router.use(authMiddleware.protect);

router.get('/dashboard', authMiddleware.restrictTo('admin'), adminController.getDashboard);
router.get('/users', authMiddleware.restrictTo('admin', 'moderator'), getPaginationParams, adminController.getUsers);
router.patch('/users/:id', authMiddleware.restrictTo('admin', 'moderator'), adminController.updateUser);
router.get('/games', authMiddleware.restrictTo('admin'), getPaginationParams, adminController.getGames);
router.patch('/games/:id', authMiddleware.restrictTo('admin'), adminController.updateGame);
router.get('/stats', authMiddleware.restrictTo('admin'), adminController.getStats);

module.exports = router;
