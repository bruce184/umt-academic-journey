import { MessageService } from "../services/message.service.js";
import { errors } from "../utils/api-error.js";

export const MessageController = {
    /**
     * GET /conversations
     * List all conversations for the current user.
     */
    listConversations: async (req, res, next) => {
        try {
            const conversations = await MessageService.listConversations(req.userId);
            return res.ok({ conversations });
        } catch (e) {
            return next(e);
        }
    },

    /**
     * POST /conversations
     * Get or create a conversation with another user.
     * Body: { recipientId: string }
     */
    getOrCreateConversation: async (req, res, next) => {
        const { recipientId } = req.body;

        if (!recipientId || typeof recipientId !== "string") {
            return next(errors.validation("recipientId is required"));
        }
        if (recipientId === req.userId) {
            return next(errors.validation("Cannot start a conversation with yourself"));
        }

        try {
            const conversation = await MessageService.getOrCreateConversation(req.userId, recipientId);
            return res.ok({ conversation });
        } catch (e) {
            return next(e);
        }
    },

    /**
     * GET /conversations/:id/messages
     * Get paginated messages for a conversation.
     * Query: ?cursor=<ISO date>&limit=<number>
     */
    listMessages: async (req, res, next) => {
        const convId = parseInt(req.params.id, 10);
        if (!Number.isInteger(convId) || convId <= 0) {
            return next(errors.validation("Invalid conversation id"));
        }

        const limit = Math.min(parseInt(req.query.limit || "30", 10), 50);
        const cursorRaw = req.query.cursor ? new Date(req.query.cursor) : null;
        const cursor = cursorRaw && !isNaN(cursorRaw.getTime()) ? cursorRaw : null;

        try {
            const messages = await MessageService.listMessages({ convId, userId: req.userId, limit, cursor });
            const nextCursor = messages.length === limit ? messages[0]?.created_at : null;
            return res.ok({ messages }, { meta: { pagination: { limit, nextCursor } } });
        } catch (e) {
            if (e?.code === "NOT_FOUND") return next(errors.notFound("Conversation not found"));
            return next(e);
        }
    },

    /**
     * POST /conversations/:id/messages
     * Send a message in a conversation.
     * Body: { body?: string, messageType?: string, metadata?: object }
     */
    sendMessage: async (req, res, next) => {
        const convId = parseInt(req.params.id, 10);
        if (!Number.isInteger(convId) || convId <= 0) {
            return next(errors.validation("Invalid conversation id"));
        }

        const { body, messageType = "text", metadata = {} } = req.body;

        if (messageType !== "text" && messageType !== "post_share") {
            return next(errors.validation("Unsupported message type"));
        }

        const trimmedBody = typeof body === "string" ? body.trim() : "";
        if (messageType === "text" && trimmedBody.length === 0) {
            return next(errors.validation("Message body is required"));
        }
        if (trimmedBody.length > 2000) {
            return next(errors.validation("Message body must be 2000 characters or fewer"));
        }

        if (messageType === "post_share") {
            if (!metadata || typeof metadata !== "object" || !metadata.post?.id) {
                return next(errors.validation("Shared post metadata is required"));
            }
        }

        try {
            const message = await MessageService.sendMessage({
                convId,
                senderId: req.userId,
                body: trimmedBody || "__shared_post__",
                messageType,
                metadata,
            });
            return res.ok({ message }, { status: 201 });
        } catch (e) {
            if (e?.code === "NOT_FOUND") return next(errors.notFound("Conversation not found"));
            return next(e);
        }
    },

    /**
     * PATCH /messages/:id
     * Soft-delete a message the current user sent.
     */
    deleteMessage: async (req, res, next) => {
        const messageId = parseInt(req.params.id, 10);
        if (!Number.isInteger(messageId) || messageId <= 0) {
            return next(errors.validation("Invalid message id"));
        }

        try {
            const message = await MessageService.softDeleteMessage({ messageId, senderId: req.userId });
            return res.ok({ message });
        } catch (e) {
            if (e?.code === "NOT_FOUND") return next(errors.notFound("Message not found"));
            if (e?.code === "FORBIDDEN") return next(errors.forbidden("Cannot delete another user's message"));
            return next(e);
        }
    },

    /**
     * GET /conversations/unread-count
     * Number of conversations with unread messages.
     */
    getUnreadCount: async (req, res, next) => {
        try {
            const unreadCount = await MessageService.getUnreadConversationCount(req.userId);
            return res.ok({ unreadCount });
        } catch (e) {
            return next(e);
        }
    },
};
