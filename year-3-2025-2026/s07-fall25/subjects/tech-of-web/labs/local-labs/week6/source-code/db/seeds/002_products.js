import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function seed(knex) {
  // 1) Xác định data.json (assets/ hoặc web/assets/)
  const p1 = path.join(__dirname, '../../assets/data.json');
  const p2 = path.join(__dirname, '../../web/assets/data.json');
  const dataPath = fs.existsSync(p1) ? p1 : p2;

  // 2) Đọc dữ liệu & lọc bản ghi hợp lệ (có title)
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const items = Array.isArray(raw) ? raw.filter(p => p && p.title) : [];

  // 3) Lấy categories (map theo lowercase + trim để khớp an toàn)
  const cats = await knex('categories').select('id', 'name');
  const catMap = new Map(cats.map(c => [String(c.name).trim().toLowerCase(), c.id]));

  // 4) Helper ép kiểu số an toàn
  const numOr = (v, def = null) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };
  const clamp = (v, lo, hi) => (v == null ? null : Math.min(hi, Math.max(lo, v)));
  const round2 = v => (v == null ? null : Math.round(v * 100) / 100);

  // 5) Chuẩn hoá rows để insert
  const rows = items.map(p => {
    const catKey = String(p.category ?? '').trim().toLowerCase();
    const category_id = catMap.get(catKey) ?? null;

    const price = round2(Math.max(0, numOr(p.price, 0)));
    const rating_rate = clamp(numOr(p?.rating?.rate, null), 0, 5);
    const rating_count = (() => {
      const n = numOr(p?.rating?.count, null);
      return n == null ? null : Math.max(0, Math.trunc(n));
    })();

    const image =
      (p.image && String(p.image)) ||
      (p.img && String(p.img)) ||
      (p.id != null ? `p${p.id}.png` : null);

    return {
      // KHÔNG set id để giữ auto-increment
      title: String(p.title),
      description: p.description ?? null,
      price,
      category_id,
      rating_rate,
      rating_count,
      image
    };
  });

  // 6) Ghi DB trong transaction (an toàn)
  await knex.transaction(async trx => {
    await trx('products').insert(rows);
  });
}
