import { db } from "../db/knex.js";

const getClient = (trx) => trx || db;

export const NotificationModel = {
    getById: async (id) => {
        const client = getClient();
        return client("public.notifications")
            .select(["id", "recipient_id", "is_read"])
            .where({ id })
            .first();
    },

    listByRecipient: async ({ recipientId, limit, cursor }) => {
        const client = getClient();
        const rows = await client
            .select([
                "n.id",
                "n.type",
                "n.recipient_id",
                "n.actor_id",
                "n.post_id",
                "n.comment_id",
                "n.is_read",
                "n.created_at",
                "pr.username as actor_username",
                "pr.display_name as actor_display_name",
                "pr.avatar_url as actor_avatar_url",
                "pm.media_url as post_thumbnail_url"
            ])
            .from({ n: "public.notifications" })
            .join({ pr: "public.profiles" }, "pr.user_id", "n.actor_id")
            .leftJoin({ pm: "public.post_media" }, function () {
                this.on("pm.post_id", "=", "n.post_id")
                    .andOn("pm.position", "=", db.raw("0"));
            })
            .where("n.recipient_id", recipientId)
            .modify((qb) => {
                if (cursor?.createdAt) {
                    qb.andWhere((innerQb) => {
                        innerQb.where("n.created_at", "<", cursor.createdAt);

                        if (Number.isInteger(cursor.id) && cursor.id > 0) {
                            innerQb.orWhere((tieBreakerQb) => {
                                tieBreakerQb
                                    .where("n.created_at", "=", cursor.createdAt)
                                    .andWhere("n.id", "<", cursor.id);
                            });
                        }
                    });
                }
            })
            .orderBy("n.created_at", "desc")
            .orderBy("n.id", "desc")
            .limit(limit);

        return rows;
    },

    countUnreadByRecipient: async (recipientId) => {
        const client = getClient();
        const [row] = await client("public.notifications")
            .where({ recipient_id: recipientId, is_read: false })
            .count("* as count");
        return Number(row?.count || 0);
    },

    markAsRead: async ({ id, recipientId }) => {
        const client = getClient();
        const [row] = await client("public.notifications")
            .where({ id, recipient_id: recipientId })
            .update({ is_read: true })
            .returning([
                "id",
                "type",
                "recipient_id",
                "actor_id",
                "post_id",
                "comment_id",
                "is_read",
                "created_at"
            ]);
        return row || null;
    },

    markBatchAsRead: async ({ ids, recipientId }) => {
        const client = getClient();
        const result = await client("public.notifications")
            .whereIn("id", ids)
            .andWhere({ recipient_id: recipientId, is_read: false })
            .update({ is_read: true });
        return result; // Returns number of updated rows
    },

    markAllAsRead: async ({ recipientId }) => {
        const client = getClient();
        const result = await client("public.notifications")
            .where({ recipient_id: recipientId, is_read: false })
            .update({ is_read: true });
        return result; // Returns number of updated rows
    }
};
