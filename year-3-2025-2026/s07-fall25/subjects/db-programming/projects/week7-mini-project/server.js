// server.js
// Simple API server for Instructor table (mini project Part B)

const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware: parse JSON body
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'miniprojectdb',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123456',
});

// Test DB connection on start
pool.connect()
  .then((client) => {
    console.log('✅ Connected to PostgreSQL');
    client.release();
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
  });

// ============================
// Helper: parse ID
// ============================
function getInstructorIdFromAny(req) {
  if (req.params.id) {
    const id = parseInt(req.params.id, 10);
    if (!Number.isNaN(id)) return id;
  }
  if (req.query.instructorID) {
    const id = parseInt(req.query.instructorID, 10);
    if (!Number.isNaN(id)) return id;
  }
  return null;
}

// ============================
// 1. GET /miniproj/instructors/:id
//    → dùng path param
// ============================
app.get('/miniproj/instructors/:id', async (req, res) => {
  const instructorId = getInstructorIdFromAny(req);

  if (!instructorId) {
    return res.status(400).json({
      error: 'Missing or invalid instructor ID in path',
    });
  }

  try {
    const sql = 'SELECT * FROM fn_getInstructor($1)';
    const result = await pool.query(sql, [instructorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `InstructorID ${instructorId} not found` });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /miniproj/instructors/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================
// 1b. GET /miniproj/instructors?instructorID=...
//     → version theo Testing URL trong sheet
// ============================
app.get('/miniproj/instructors', async (req, res) => {
  const instructorId = getInstructorIdFromAny(req);

  if (!instructorId) {
    return res.status(400).json({
      error: 'Missing instructorID query param, e.g. /miniproj/instructors?instructorID=1',
    });
  }

  try {
    const sql = 'SELECT * FROM fn_getInstructor($1)';
    const result = await pool.query(sql, [instructorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `InstructorID ${instructorId} not found` });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('GET /miniproj/instructors error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================
// 2. DELETE /miniproj/instructors/:id
// ============================
app.delete('/miniproj/instructors/:id', async (req, res) => {
  const instructorId = getInstructorIdFromAny(req);

  if (!instructorId) {
    return res.status(400).json({
      error: 'Missing or invalid instructor ID in path',
    });
  }

  try {
    const sql = 'SELECT fn_deleteInstructor($1) AS message';
    const result = await pool.query(sql, [instructorId]);

    return res.json({
      instructorID: instructorId,
      message: result.rows[0]?.message || null,
    });
  } catch (err) {
    console.error('DELETE /miniproj/instructors/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================
// 3. PUT /miniproj/instructors/:id
// ============================
app.put('/miniproj/instructors/:id', async (req, res) => {
  const instructorId = getInstructorIdFromAny(req);
  const { InstructorName, InstructorLocation } = req.body;

  if (!instructorId) {
    return res.status(400).json({
      error: 'Missing or invalid instructor ID in path',
    });
  }

  if (!InstructorName || !InstructorLocation) {
    return res.status(400).json({
      error: 'Missing fields: need InstructorName and InstructorLocation in request body',
    });
  }

  try {
    const sql = 'SELECT fn_updateInstructor($1, $2, $3) AS message';
    const params = [instructorId, InstructorName, InstructorLocation];

    const result = await pool.query(sql, params);

    return res.json({
      instructorID: instructorId,
      message: result.rows[0]?.message || null,
      updatedValues: { InstructorName, InstructorLocation },
    });
  } catch (err) {
    console.error('PUT /miniproj/instructors/:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================
// 4. POST /miniproj/instructors
// ============================
app.post('/miniproj/instructors', async (req, res) => {
  const { InstructorID, InstructorName, InstructorLocation } = req.body;

  if (!InstructorName || !InstructorLocation) {
    return res.status(400).json({
      error: 'Missing fields: need InstructorName and InstructorLocation in request body',
    });
  }

  try {
    const sql = 'SELECT fn_createInstructor($1, $2, $3) AS message';
    const params = [
      InstructorID ?? null,
      InstructorName,
      InstructorLocation,
    ];

    const result = await pool.query(sql, params);

    return res.status(201).json({
      input: { InstructorID, InstructorName, InstructorLocation },
      message: result.rows[0]?.message || null,
    });
  } catch (err) {
    console.error('POST /miniproj/instructors error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================
// Start server
// ============================
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Instructor API server is running at http://localhost:${port}`);
});
