const messageService = require('../services/messageService');

const handleControllerError = (res, error, fallbackMessage) => {
    console.error(fallbackMessage, error);
    res.status(error.statusCode || 500).json({ error: error.message || fallbackMessage });
};

exports.getConversations = async (req, res) => {
    try {
        const result = await messageService.getConversations({
            userId: req.user.id,
            page: req.query.page,
            pageSize: req.query.pageSize,
        });

        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to fetch conversations');
    }
};

exports.getConversationMessages = async (req, res) => {
    try {
        const result = await messageService.getConversationMessages({
            userId: req.user.id,
            partnerId: req.params.userId,
            page: req.query.page,
            pageSize: req.query.pageSize,
        });

        res.json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to fetch messages');
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const message = await messageService.sendMessage({
            senderId: req.user.id,
            recipientId: req.body.recipientId,
            content: req.body.content,
        });

        res.status(201).json({
            status: 'success',
            message: 'Message sent',
            data: {
                message,
            },
        });
    } catch (error) {
        handleControllerError(res, error, 'Failed to send message');
    }
};
