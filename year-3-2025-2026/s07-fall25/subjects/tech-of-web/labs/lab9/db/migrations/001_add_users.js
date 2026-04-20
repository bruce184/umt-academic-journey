// db/migrations/001_add_users.js

// Hàm up: tạo bảng users
async function up(db) {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;
  await db.run(sql);
}

// Hàm down: rollback (tuỳ, có thể không dùng)
async function down(db) {
  const sql = `DROP TABLE IF EXISTS users;`;
  await db.run(sql);
}

module.exports = { up, down };
