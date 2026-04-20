require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Build pool config: prefer DATABASE_URL, otherwise use individual PG_* env vars
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    };

if (process.env.PGSSLMODE === 'require' && process.env.DATABASE_URL) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

// Log pool errors to console for visibility
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err && err.stack ? err.stack : err);
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Route: lấy tất cả sản phẩm
app.get('/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM product');
    res.json(rows);
  } catch (err) {
    console.error('DB query error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route: lấy 1 sản phẩm theo id
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM product WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('DB query error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route: xóa 1 sản phẩm theo id
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM product WHERE id = $1 RETURNING *', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại' });
    }
    res.json({ message: 'Xóa sản phẩm thành công', product: rows[0] });
  } catch (err) {
    console.error('DB query error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Start/stop helpers
let server;
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

function startServer() {
  server = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

async function stopServer() {
  console.log('Shutting down server...');
  if (server && server.close) {
    server.close(() => console.log('HTTP server closed'));
  }
  try {
    await pool.end();
    console.log('Postgres pool has ended');
  } catch (e) {
    console.error('Error while shutting down pool', e && e.stack ? e.stack : e);
  }
}

process.on('SIGINT', async () => {
  await stopServer();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await stopServer();
  process.exit(0);
});

// Only start if main
if (require.main === module) startServer();

module.exports = { app, pool, startServer, stopServer };