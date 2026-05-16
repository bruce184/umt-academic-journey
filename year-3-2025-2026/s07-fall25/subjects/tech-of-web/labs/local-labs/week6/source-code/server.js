import 'dotenv/config';
import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productRouter from './routers/product.r.js';
import categoryRouter from './routers/category.r.js';
import homeRouter from './routers/home.r.js';
import db from './db/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ---- Security & basics
app.disable('x-powered-by');

// ---- View engine (Handlebars)
app.engine(
  'hbs',
  exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    // helpers: { /* add if needed */ }
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// ---- Parsers
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

// ---- Static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/imgs', express.static(path.join(__dirname, 'assets', 'imgs'))); // ảnh local

// ---- Healthchecks
app.get('/__health/app', (_req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    uptime_sec: Math.round(process.uptime())
  });
});

app.get('/__health/db', async (_req, res) => {
  try {
    const r = await db.raw('select 1 as ok');
    res.json(r.rows ?? r);
  } catch (e) {
    // TẠM THỜI: trả lỗi chi tiết để debug
    console.error('[DB HEALTH ERROR]', e);
    res
      .status(500)
      .type('text/plain')
      .send(
        `[DB ERROR]\nname=${e?.name}\ncode=${e?.code}\nmessage=${e?.message}\n` +
        (e?.detail ? `detail=${e.detail}\n` : '') +
        (e?.hint ? `hint=${e.hint}\n` : '')
      );
  }
});

// ---- Routers
app.use('/', homeRouter);
app.use('/products', productRouter);
app.use('/categories', categoryRouter);
app.use('/home', homeRouter);

// server.js (tạm debug)
app.get('/__debug/schema/categories', async (_req,res,next)=>{
  try {
    const r = await db.raw(`
      select column_name, data_type
      from information_schema.columns
      where table_schema='public' and table_name='categories'
      order by ordinal_position
    `);
    res.json(r.rows ?? r);
  } catch(e){ next(e); }
});


// ---- 404 (sau cùng trước error handler)
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// ---- Error handler (Express 5)
app.use((err, _req, res, _next) => {
  // In ra lỗi đầy đủ ở server; tránh lộ chi tiết cho client
  console.error('[ERROR]', err?.stack || err);
  res.status(500).send('Internal Server Error');
});

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} [env=${process.env.NODE_ENV || 'development'}]`);
});

// (tuỳ chọn) export app để test
export default app;
