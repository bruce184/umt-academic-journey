import { NotificationService } from "../services/notification.service.js";
import { errors } from "../utils/api-error.js";

const parseCursor = (rawCursor) => {
    if (!rawCursor || typeof rawCursor !== "string") return null;

    const [createdAtRaw, idRaw] = rawCursor.split("|");
    const createdAt = new Date(createdAtRaw);
    if (Number.isNaN(createdAt.getTime())) return null;

    const parsedId = Number.parseInt(idRaw || "", 10);

    return {
        createdAt,
        id: Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
    };
};

const buildCursor = (item) => {
    if (!item?.created_at) return null;

    const createdAt = new Date(item.created_at);
    if (Number.isNaN(createdAt.getTime())) return null;

    const parsedId = Number.parseInt(item.id, 10);
    if (Number.isInteger(parsedId) && parsedId > 0) {
        return `${createdAt.toISOString()}|${parsedId}`;
    }

    return createdAt.toISOString();
};

export const NotificationController = {
    getNotifications: async (req, res, next) => {
        try {
            const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
            const cursor = parseCursor(req.query.cursor);

            const items = await NotificationService.listForUser({
                userId: req.userId,
                limit,
                cursor
            });

            const nextCursor = items.length ? buildCursor(items[items.length - 1]) : null;
            return res.ok(
                { items },
                { meta: { pagination: { limit, nextCursor } } }
            );
        } catch (e) {
            return next(e);
        }
    },

    getUnreadCount: async (req, res, next) => {
        try {
            const unreadCount = await NotificationService.getUnreadCount(req.userId);
            return res.ok({ unreadCount });
        } catch (e) {
            return next(e);
        }
    },

    markAsRead: async (req, res, next) => {
        const id = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(id) || id <= 0) {
            return next(errors.validation("Invalid notification id"));
        }

        try {
            const notification = await NotificationService.markAsRead({
                userId: req.userId,
                notificationId: id
            });
            return res.ok({ notification });
        } catch (e) {
            if (e?.code === "NOT_FOUND") return next(errors.notFound("Notification not found"));
            if (e?.code === "FORBIDDEN") return next(errors.forbidden("Not allowed to mark this notification"));
            return next(e);
        }
    },

    markBatchRead: async (req, res, next) => {
        try {
            const { ids } = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return next(errors.validation("ids must be a non-empty array"));
            }

            // Validate all IDs are positive integers
            const validIds = ids
                .map(id => Number.parseInt(id, 10))
                .filter(id => Number.isInteger(id) && id > 0);

            if (validIds.length === 0) {
                return next(errors.validation("No valid notification IDs provided"));
            }

            const updatedCount = await NotificationService.markBatchAsRead({
                userId: req.userId,
                ids: validIds
            });

            return res.ok({ updatedCount });
        } catch (e) {
            return next(e);
        }
    },

    markAllRead: async (req, res, next) => {
        try {
            const updatedCount = await NotificationService.markAllAsRead({
                userId: req.userId
            });
            return res.ok({ updatedCount });
        } catch (e) {
            return next(e);
        }
    },
};
