// db/seeds/002_seed_users.js
const bcrypt = require('bcryptjs');

async function seed(db) {
  // Xoá dữ liệu cũ (nếu có)
  await db.run('DELETE FROM users;');

  const hash1 = bcrypt.hashSync('123456', 10);
  const hash2 = bcrypt.hashSync('secret', 10);

  await db.run(
    'INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?);',
    ['admin', 'Admin User', 'admin@example.com', hash1]
  );

  await db.run(
    'INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?);',
    ['bruce', 'Bruce Nguyen', 'bruce@example.com', hash2]
  );
}

module.exports = { seed };
