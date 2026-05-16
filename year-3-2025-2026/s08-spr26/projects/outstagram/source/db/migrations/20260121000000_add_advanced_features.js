/**
 * Placeholder for missing migration file to satisfy Knex validation.
 * The database already lists this as executed.
 */
export const up = async (knex) => {
    // Already applied in DB, no-op locally to fix "corrupt" error
};

export const down = async (knex) => {
    // No-op
};
