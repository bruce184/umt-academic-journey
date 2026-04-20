/**
 * Playlist model implemented with Knex query builder.
 * This provides a minimal API compatible with existing controllers
 * which expect Sequelize-like methods (`create`, `findAll`, `findByPk`, `update`, `destroy`).
 */
import db from "../db/db.js";

const table = "playlists";

export const Playlist = {
    create: async (data) => {
        const rows = await db(table).insert(data).returning("*");
        return rows && rows[0] ? rows[0] : null;
    },
    findAll: async () => {
        return db(table).select("*");
    },
    findByPk: async (id) => {
        return db(table).where("id", id).first();
    },
    // return format [count] to remain compatible with controller usage: `const [updated] = await Playlist.update(...)`
    update: async (values, options = {}) => {
        const where = options.where || {};
        const count = await db(table).where(where).update(values);
        return [count];
    },
    // `destroy({ where: { id } })` -> returns number of rows deleted
    destroy: async (options = {}) => {
        const where = options.where || {};
        const count = await db(table).where(where).del();
        return count;
    }
};