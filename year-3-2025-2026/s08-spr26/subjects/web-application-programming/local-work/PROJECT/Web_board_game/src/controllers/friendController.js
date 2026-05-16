const friendService = require('../services/friendService');

const handleControllerError = (res, error, fallbackMessage) => {
    console.error(fallbackMessage, error);
    res.status(error.statusCode || 500).json({ error: error.message || fallbackMessage });
};

exports.getFriends = async (req, res) => {
    try {
        const result = await friendService.getFriends({
            userId: req.user.id,
            page: req.query.page,
            pageSize: req.query.pageSize,
        });

        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to fetch friends');
    }
};

exports.getFriendRequests = async (req, res) => {
    try {
        const result = await friendService.getFriendRequests(req.user.id);

        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to fetch friend requests');
    }
};

exports.sendFriendRequest = async (req, res) => {
    try {
        const request = await friendService.sendFriendRequest({
            senderId: req.user.id,
            receiverId: req.body.receiverId,
        });

        res.status(201).json({
            status: 'success',
            message: 'Friend request sent',
            data: {
                request,
            },
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to send friend request');
    }
};

exports.acceptFriendRequest = async (req, res) => {
    try {
        const friend = await friendService.acceptFriendRequest({
            requestId: req.params.id,
            userId: req.user.id,
        });

        res.json({
            status: 'success',
            message: 'Friend request accepted',
            data: {
                friend,
            },
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to accept friend request');
    }
};

exports.deleteFriendRequest = async (req, res) => {
    try {
        const result = await friendService.deleteFriendRequest({
            requestId: req.params.id,
            userId: req.user.id,
        });

        res.json({
            status: 'success',
            message: result.status === 'cancelled' ? 'Friend request cancelled' : 'Friend request rejected',
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to update friend request');
    }
};

exports.removeFriend = async (req, res) => {
    try {
        await friendService.removeFriend({
            userId: req.user.id,
            friendId: req.params.friendId,
        });

        res.json({
            status: 'success',
            message: 'Friend removed successfully',
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to remove friend');
    }
};
