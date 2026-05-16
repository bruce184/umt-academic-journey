// models/user.m.js
const db = require('../db'); // chính là db/index.js

module.exports = {
  async getByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ? LIMIT 1;';
    return db.get(sql, [username]);
  },

  async getById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?;';
    return db.get(sql, [id]);
  },

  async add(user) {
    const sql = `
      INSERT INTO users (username, name, email, password)
      VALUES (?, ?, ?, ?);
    `;
    return db.run(sql, [user.username, user.name, user.email, user.password]);
  },
};
