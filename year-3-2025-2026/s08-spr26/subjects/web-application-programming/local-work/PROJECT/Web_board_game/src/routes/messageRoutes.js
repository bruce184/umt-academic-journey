const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/conversations/:userId', messageController.getConversationMessages);
router.post('/', messageController.sendMessage);

module.exports = router;
