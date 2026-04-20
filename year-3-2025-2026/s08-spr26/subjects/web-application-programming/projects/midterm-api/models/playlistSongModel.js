import db from "../db/db.js";

/**
 * Knex-based PlaylistSong model.
 * Provides minimal methods used by controllers: create, findAll, destroy.
 */
const table = "playlist_songs";

export const PlaylistSong = {
    create: async (data) => {
        const rows = await db(table).insert(data).returning("*");
        return rows && rows[0] ? rows[0] : null;
    },
    findAll: async (options = {}) => {
        const where = options.where || {};
        return db(table).where(where).select("*");
    },
    destroy: async (options = {}) => {
        const where = options.where || {};
        const count = await db(table).where(where).del();
        return count;
    }
};

