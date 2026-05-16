/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

  /**
    Table "songs": 
      id: SERIAL PRIMARY KEY
      title: VARCHAR(255) NOT NULL
      artist: VARCHAR(255) NOT NULL UNIQUE
      duration_seconds: INTEGER NOT NULL
      genre: VARCHAR(100) DEFAULT CURRENT_TIMESTAMP
      audio_url: TEXT NOT NULL
      created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  */
export async function up(knex) {
  await knex.schema.createTable("songs", (t) => {
    t.increments("id").primary();
    t.string("title").notNullable();
    t.string("artist").notNullable().unique();
    t.integer("duration_seconds").notNullable();
    t.string("genre").nullable();
    t.text("audio_url").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  /**
    Table "playlists": 
      id: SERIAL PRIMARY KEY
      name: VARCHAR(255) NOT NULL
      description: TEXT NOT NULL UNIQUE
      created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  */
  await knex.schema.createTable("playlists", (t) => {
    t.increments("id").primary();
    t.string("name").notNullable();
    t.text("description").notNullable().unique();
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  /**
  Table "playlists_songs": 
    playlist_id: INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE
    song_id: INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE
    created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 */
  await knex.schema.createTable("playlists_songs", (t) => {
    t.integer("playlist_id").notNullable().references("id").inTable("playlists").onDelete("CASCADE");
    t.integer("song_id").notNullable().references("id").inTable("songs").onDelete("CASCADE");
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.primary(["playlist_id", "song_id"]);
  }); 
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("playlists_songs");
  await knex.schema.dropTableIfExists("playlists");
  await knex.schema.dropTableIfExists("songs");
}

/**
* How to run the migration:
* npx knex migrate:latest --knexfile path/to/your/knexfile.js
*/