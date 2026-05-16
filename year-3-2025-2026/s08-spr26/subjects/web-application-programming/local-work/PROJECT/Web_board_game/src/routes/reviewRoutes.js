const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { getPaginationParams } = require('../middleware/paginationMiddleware');

// Mount expected at /api/games by default, so routes are relative to /api/games
router.get('/:id/reviews', getPaginationParams, reviewController.getReviewsByGameId);
router.post('/:id/reviews', protect, reviewController.addOrUpdateReview);

module.exports = router;
