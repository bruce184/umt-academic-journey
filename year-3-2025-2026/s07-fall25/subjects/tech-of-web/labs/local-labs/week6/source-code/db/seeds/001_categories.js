import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function seed(knex) {
  // 1) Dọn bảng & reset sequence (an toàn cho FK)
  await knex.raw('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
  await knex.raw('TRUNCATE TABLE categories RESTART IDENTITY CASCADE');

  // 2) Xác định đường dẫn data.json (assets hoặc web/assets)
  const p1 = path.join(__dirname, '../../assets/data.json');
  const p2 = path.join(__dirname, '../../web/assets/data.json');
  const dataPath = fs.existsSync(p1) ? p1 : p2;

  // 3) Đọc & trích categories (lọc trống, sort ổn định)
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const names = [...new Set(raw.map(p => String(p.category || '').trim()))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const rows = names.map(name => ({ name, description: null }));

  // 4) Chèn categories (id sẽ từ 1,2,3,... sau khi reset identity)
  await knex('categories').insert(rows);
}
