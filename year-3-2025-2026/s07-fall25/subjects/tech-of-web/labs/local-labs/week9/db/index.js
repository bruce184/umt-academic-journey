// db/index.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Đường dẫn tới file DB
const dbPath = path.join(__dirname, 'app.db');
const db = new sqlite3.Database(dbPath);

// Helper chạy câu lệnh không trả dữ liệu (INSERT, UPDATE, DELETE, DDL)
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this); // this.lastID, this.changes
    });
  });
}

// Helper lấy 1 dòng
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Helper lấy nhiều dòng (nếu cần sau này)
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  run,
  get,
  all,
  db, // export thô nếu cần
};
