import { db as knex } from "../db/knex.js";

export const DEFAULT_SYSTEM_CONFIG = {
    maintenance_mode: false,
    registration_enabled: true,
    max_upload_size_mb: 10,
    posts_per_page: 20,
    allow_comments: true,
    site_name: "Outstagram",
};

const PUBLIC_CONFIG_KEYS = [
    "maintenance_mode",
    "registration_enabled",
    "max_upload_size_mb",
    "posts_per_page",
    "allow_comments",
    "site_name",
];

const CACHE_TTL_MS = 5000;

let cache = null;
let cacheExpiry = 0;

function parseStoredValue(value) {
    if (value === null || value === undefined) return value;
    if (typeof value === "boolean" || typeof value === "number" || typeof value === "object") {
        return value;
    }

    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    return value;
}

function serializeValue(value) {
    return JSON.stringify(value);
}

function buildConfigMap(rows) {
    return rows.reduce((acc, row) => {
        acc[row.key] = parseStoredValue(row.value);
        return acc;
    }, { ...DEFAULT_SYSTEM_CONFIG });
}

async function seedDefaultsIfMissing() {
    const existingRows = await knex("system_config").select("key");
    const existingKeys = new Set(existingRows.map((row) => row.key));
    const missingEntries = Object.entries(DEFAULT_SYSTEM_CONFIG)
        .filter(([key]) => !existingKeys.has(key))
        .map(([key, value]) => ({
            key,
            value: serializeValue(value),
        }));

    if (missingEntries.length > 0) {
        await knex("system_config").insert(missingEntries);
    }
}

export const SystemConfigService = {
    async getAll({ forceRefresh = false } = {}) {
        if (!forceRefresh && cache && cacheExpiry > Date.now()) {
            return cache;
        }

        await seedDefaultsIfMissing();
        const rows = await knex("system_config").select("*").orderBy("key", "asc");
        const configs = buildConfigMap(rows);

        cache = configs;
        cacheExpiry = Date.now() + CACHE_TTL_MS;
        return configs;
    },

    async getValue(key, fallback = undefined) {
        const configs = await this.getAll();
        return configs[key] ?? fallback;
    },

    async listForAdmin() {
        await seedDefaultsIfMissing();
        const rows = await knex("system_config").select("*").orderBy("key", "asc");

        return rows.map((row) => ({
            key: row.key,
            value: parseStoredValue(row.value),
            raw_value: parseStoredValue(row.value),
            updated_at: row.updated_at,
            updated_by: row.updated_by,
        }));
    },

    async getPublicConfig() {
        const configs = await this.getAll();
        return PUBLIC_CONFIG_KEYS.reduce((acc, key) => {
            acc[key] = configs[key] ?? DEFAULT_SYSTEM_CONFIG[key];
            return acc;
        }, {});
    },

    invalidateCache() {
        cache = null;
        cacheExpiry = 0;
    },
};
