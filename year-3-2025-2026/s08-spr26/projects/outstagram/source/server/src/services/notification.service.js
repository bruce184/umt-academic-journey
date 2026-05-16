import { db } from "../db/knex.js";
import { NotificationModel } from "../models/notification.model.js";

export const NotificationService = {
    listForUser: async ({ userId, limit, cursor }) => {
        const rows = await NotificationModel.listByRecipient({
            recipientId: userId,
            limit,
            cursor
        });

        return rows.map((row) => ({
            id: row.id,
            type: row.type,
            recipient_id: row.recipient_id,
            actor_id: row.actor_id,
            actor: {
                username: row.actor_username,
                display_name: row.actor_display_name,
                avatar_url: row.actor_avatar_url
            },
            post_id: row.post_id,
            post_thumbnail: row.post_thumbnail_url || null,
            comment_id: row.comment_id,
            is_read: row.is_read,
            created_at: row.created_at
        }));
    },

    getUnreadCount: async (userId) => {
        return NotificationModel.countUnreadByRecipient(userId);
    },

    markAsRead: async ({ userId, notificationId }) => {
        const updated = await NotificationModel.markAsRead({
            id: notificationId,
            recipientId: userId
        });

        if (updated) return updated;

        const existing = await NotificationModel.getById(notificationId);
        if (!existing) {
            const err = new Error("Notification not found");
            err.code = "NOT_FOUND";
            throw err;
        }

        const err = new Error("Forbidden");
        err.code = "FORBIDDEN";
        throw err;
    },

    markBatchAsRead: async ({ userId, ids }) => {
        return NotificationModel.markBatchAsRead({
            ids,
            recipientId: userId
        });
    },

    markAllAsRead: async ({ userId }) => {
        return NotificationModel.markAllAsRead({
            recipientId: userId
        });
    }
};
