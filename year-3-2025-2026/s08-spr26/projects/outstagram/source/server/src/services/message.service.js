import { db } from "../db/knex.js";

/**
 * Normalize user IDs so that user1_id < user2_id in UUID order.
 * This guarantees a single row per pair.
 */
function normalizeConvUsers(idA, idB) {
    return idA < idB ? { user1_id: idA, user2_id: idB } : { user1_id: idB, user2_id: idA };
}

export const MessageService = {
    /**
     * Get or create a conversation between two users.
     * Returns the conversation row.
     */
    async getOrCreateConversation(userAId, userBId) {
        const { user1_id, user2_id } = normalizeConvUsers(userAId, userBId);

        // Try to find existing
        const existing = await db("conversations")
            .where({ user1_id, user2_id })
            .first();

        if (existing) return existing;

        // Create new
        const [conv] = await db("conversations")
            .insert({ user1_id, user2_id })
            .returning("*");

        return conv;
    },

    /**
     * List all conversations for a user, ordered by last_msg_at DESC.
     * Enriches each with the other participant's profile and the last message preview.
     */
    async listConversations(userId) {
        const convs = await db("conversations as c")
            .where("c.user1_id", userId)
            .orWhere("c.user2_id", userId)
            .orderBy("c.last_msg_at", "desc")
            .select("c.*");

        if (!convs.length) return [];

        // Get last message + other user profile for each conversation
        const enriched = await Promise.all(convs.map(async (conv) => {
            const otherId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
            const lastReadAt = conv.user1_id === userId ? conv.user1_last_read : conv.user2_last_read;

            const [other, lastMsg] = await Promise.all([
                db("profiles")
                    .where("user_id", otherId)
                    .select("user_id", "username", "display_name", "avatar_url")
                    .first(),
                db("messages")
                    .where("conversation_id", conv.id)
                    .orderBy("created_at", "desc")
                    .select("id", "sender_id", "body", "message_type", "metadata", "is_deleted", "created_at")
                    .first(),
            ]);

            // Count unread: messages after last_read_at not sent by current user
            let unreadCount = 0;
            if (lastMsg) {
                const q = db("messages")
                    .where("conversation_id", conv.id)
                    .whereNot("sender_id", userId)
                    .where("is_deleted", false);
                if (lastReadAt) q.where("created_at", ">", lastReadAt);
                const result = await q.count("id as count").first();
                unreadCount = parseInt(result?.count || 0, 10);
            }

            return {
                ...conv,
                other_user: other || null,
                last_message: lastMsg || null,
                unread_count: unreadCount,
            };
        }));

        return enriched;
    },

    /**
     * List messages in a conversation (cursor-based pagination, newest first).
     * Verifies user is a member of the conversation.
     */
    async listMessages({ convId, userId, limit = 30, cursor = null }) {
        // Verify membership
        const conv = await db("conversations")
            .where("id", convId)
            .where(function () {
                this.where("user1_id", userId).orWhere("user2_id", userId);
            })
            .first();

        if (!conv) {
            const err = new Error("Conversation not found or access denied");
            err.code = "NOT_FOUND";
            throw err;
        }

        const q = db("messages as m")
            .join("profiles as p", "p.user_id", "m.sender_id")
            .where("m.conversation_id", convId)
            .select(
                "m.id", "m.conversation_id", "m.body", "m.message_type", "m.metadata", "m.is_deleted",
                "m.sender_id", "m.created_at",
                "p.username as sender_username",
                "p.display_name as sender_display_name",
                "p.avatar_url as sender_avatar_url"
            )
            .orderBy("m.created_at", "desc")
            .limit(limit);

        if (cursor) {
            q.where("m.created_at", "<", cursor);
        }

        const messages = await q;

        // Update last_read_at for the current user (mark all read)
        const col = conv.user1_id === userId ? "user1_last_read" : "user2_last_read";
        await db("conversations")
            .where("id", convId)
            .update({ [col]: db.fn.now() });

        return messages.reverse(); // Oldest first for chat display
    },

    /**
     * Send a new message. Also bumps last_msg_at on the conversation.
     */
    async sendMessage({ convId, senderId, body, messageType = "text", metadata = {} }) {
        // Verify membership
        const conv = await db("conversations")
            .where("id", convId)
            .where(function () {
                this.where("user1_id", senderId).orWhere("user2_id", senderId);
            })
            .first();

        if (!conv) {
            const err = new Error("Conversation not found or access denied");
            err.code = "NOT_FOUND";
            throw err;
        }

        const [message] = await db("messages")
            .insert({
                conversation_id: convId,
                sender_id: senderId,
                body,
                message_type: messageType,
                metadata,
            })
            .returning("*");

        // Bump last_msg_at on conversation
        await db("conversations")
            .where("id", convId)
            .update({ last_msg_at: message.created_at });

        return message;
    },

    /**
     * Soft-delete a message. Only the sender can delete.
     */
    async softDeleteMessage({ messageId, senderId }) {
        const message = await db("messages").where("id", messageId).first();
        if (!message) {
            const err = new Error("Message not found");
            err.code = "NOT_FOUND";
            throw err;
        }
        if (message.sender_id !== senderId) {
            const err = new Error("Cannot delete another user's message");
            err.code = "FORBIDDEN";
            throw err;
        }
        const [updated] = await db("messages")
            .where("id", messageId)
            .update({ is_deleted: true })
            .returning("*");
        return updated;
    },

    /**
     * Total number of conversations with at least 1 unread message for userId.
     */
    async getUnreadConversationCount(userId) {
        const convs = await db("conversations")
            .where("user1_id", userId)
            .orWhere("user2_id", userId)
            .select("id", "user1_id", "user2_id", "user1_last_read", "user2_last_read");

        let count = 0;
        await Promise.all(convs.map(async (conv) => {
            const lastReadAt = conv.user1_id === userId ? conv.user1_last_read : conv.user2_last_read;
            const q = db("messages")
                .where("conversation_id", conv.id)
                .whereNot("sender_id", userId)
                .where("is_deleted", false);
            if (lastReadAt) q.where("created_at", ">", lastReadAt);
            const result = await q.count("id as cnt").first();
            if (parseInt(result?.cnt || 0, 10) > 0) count++;
        }));

        return count;
    },
};
