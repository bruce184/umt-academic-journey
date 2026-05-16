const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', gameController.getAllGames);
router.get('/:id', gameController.getGameById);

router.post('/:id/save', protect, gameController.saveGameProgress);
router.get('/:id/save', protect, gameController.loadGameProgress);
router.delete('/:id/save', protect, gameController.deleteGameProgress);

router.post('/:id/session', protect, gameController.submitSession);

module.exports = router;
