const express = require('express');
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);

module.exports = router;
