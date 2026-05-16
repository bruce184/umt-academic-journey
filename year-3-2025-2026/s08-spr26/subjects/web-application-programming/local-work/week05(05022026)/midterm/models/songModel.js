/**
    Table "songs":
        id: SERIAL PRIMARY KEY
        title: VARCHAR(255) NOT NULL
        artist: VARCHAR(255) NOT NULL UNIQUE
        duration_seconds: INTEGER NOT NULL
        genre: VARCHAR(100)
        audio_url: TEXT NOT NULL
        created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
*/

import db from "../db/db.js";

const table = "songs";

export const Song = {
    create: async (data) => {
        const rows = await db(table).insert(data).returning("*");
        return rows && rows[0] ? rows[0] : null;
    },
    findAll: async () => db(table).select("*"),
    findByPk: async (id) => db(table).where("id", id).first(),
    update: async (values, options = {}) => {
        const where = options.where || {};
        const count = await db(table).where(where).update(values);
        return [count];
    },
    destroy: async (options = {}) => {
        const where = options.where || {};
        const count = await db(table).where(where).del();
        return count;
    }
};