const express = require('express');
const friendController = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', friendController.getFriends);
router.get('/requests', friendController.getFriendRequests);
router.post('/requests', friendController.sendFriendRequest);
router.patch('/requests/:id/accept', friendController.acceptFriendRequest);
router.delete('/requests/:id', friendController.deleteFriendRequest);
router.delete('/:friendId', friendController.removeFriend);

module.exports = router;
