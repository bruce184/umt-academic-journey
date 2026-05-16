const express = require('express');
const userSearchController = require('../controllers/userSearchController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/search', userSearchController.searchUsers);

module.exports = router;
