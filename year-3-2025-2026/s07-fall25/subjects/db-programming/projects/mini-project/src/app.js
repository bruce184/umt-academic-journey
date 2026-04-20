// src/app.js
// Express app: CRUD employees + CRUD details + /employees/full

const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware đọc JSON body
app.use(express.json());

// Endpoint test nhanh
app.get('/', (req, res) => {
  res.json({ message: 'Company API is running' });
});


// ==============================
// 1. Employee APIs
// ==============================

// GET /employees - Lấy tất cả nhân viên
app.get('/employees', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /employees/:id - Lấy 1 nhân viên theo id
// Accept any :id segment but if it's not numeric, pass to next() so
// routes like `/employees/full` can be handled elsewhere.
app.get('/employees/:id', async (req, res, next) => {
  const { id } = req.params;

  // If id is not numeric, skip to next route (e.g. /employees/full)
  if (!/^\d+$/.test(id)) return next();

  try {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /employees - Tạo nhân viên mới
app.post('/employees', async (req, res) => {
  const { name, position } = req.body;

  if (!name || !position) {
    return res.status(400).json({ error: 'name and position are required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO employees (name, position) VALUES (?, ?)',
      [name, position]
    );
    const insertedId = result.insertId;
    res.status(201).json({
      id: insertedId,
      name,
      position,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /employees/:id - Cập nhật nhân viên
app.put('/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, position } = req.body;

  if (!name || !position) {
    return res.status(400).json({ error: 'name and position are required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE employees SET name = ?, position = ? WHERE id = ?',
      [name, position, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ id: Number(id), name, position });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /employees/:id - Xóa nhân viên (sẽ tự xóa detail do ON DELETE CASCADE)
app.delete('/employees/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM employees WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ==============================
// 2. Employee Details APIs
// ==============================

// GET /employees/:id/details - Lấy chi tiết 1 nhân viên
app.get('/employees/:id/details', async (req, res) => {
  const { id } = req.params;

  try {
    // JOIN để trả cả thông tin chung + chi tiết
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.position, d.salary, d.address
       FROM employees e
       LEFT JOIN employee_details d ON e.id = d.id
       WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (rows[0].salary == null) {
      // Employee có tồn tại nhưng chưa có detail
      return res.status(404).json({ error: 'Employee details not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /employees/:id/details - Tạo record chi tiết cho 1 nhân viên
app.post('/employees/:id/details', async (req, res) => {
  const { id } = req.params;
  const { salary, address } = req.body;

  if (salary == null || !address) {
    return res.status(400).json({ error: 'salary and address are required' });
  }

  try {
    // 1. Kiểm tra nhân viên có tồn tại không
    const [empRows] = await pool.query('SELECT id FROM employees WHERE id = ?', [id]);
    if (empRows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // 2. Cố gắng insert detail
    const [result] = await pool.query(
      'INSERT INTO employee_details (id, salary, address) VALUES (?, ?, ?)',
      [id, salary, address]
    );

    res.status(201).json({
      id: Number(id),
      salary,
      address,
    });
  } catch (err) {
    console.error(err);

    // Nếu đã có 1 record detail rồi:
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Details for this employee already exist' });
    }

    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /employees/:id/details - Cập nhật chi tiết
app.put('/employees/:id/details', async (req, res) => {
  const { id } = req.params;
  const { salary, address } = req.body;

  if (salary == null || !address) {
    return res.status(400).json({ error: 'salary and address are required' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE employee_details SET salary = ?, address = ? WHERE id = ?',
      [salary, address, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee details not found' });
    }

    res.json({
      id: Number(id),
      salary,
      address,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /details - Lấy tất cả employee_details (kèm thông tin nhân viên thông qua JOIN)
app.get('/details', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.position, d.salary, d.address
       FROM employee_details d
       JOIN employees e ON e.id = d.id
       ORDER BY e.id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /employees/:id/details - Xóa record chi tiết của 1 nhân viên (không xóa nhân viên)
app.delete('/employees/:id/details', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM employee_details WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee details not found' });
    }

    res.json({ message: 'Employee details deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ==============================
// 3. Extended API: GET /employees/full
// ==============================

app.get('/employees/full', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id, e.name, e.position, d.salary, d.address
       FROM employees e
       LEFT JOIN employee_details d ON e.id = d.id
       ORDER BY e.id`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ==============================
// Start server
// ==============================
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function startServer() {
  const maxRetries = 10;
  const retryDelayMs = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Thử lấy connection để kiểm tra DB đã sẵn sàng
      const conn = await pool.getConnection();
      conn.release();
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
      return;
    } catch (err) {
      console.error(`DB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) {
        console.error('Max DB connection attempts reached, exiting.');
        process.exit(1);
      }
      await delay(retryDelayMs);
    }
  }
}

startServer();
