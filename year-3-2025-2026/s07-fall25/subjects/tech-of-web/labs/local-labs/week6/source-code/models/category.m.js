// models/category.m.js
import db from '../db/db.js';

// Whitelist cột cho sort để tránh SQL injection
const SORTABLE = new Set(['id', 'name', 'created_at', 'updated_at', 'product_count']);
const sanitizeSort  = (s) => (SORTABLE.has(String(s)) ? String(s) : 'id');
const sanitizeOrder = (o) => (String(o).toLowerCase() === 'desc' ? 'desc' : 'asc');

// Subquery: đếm số sản phẩm trong từng category
const productCountSQL = `
  (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id) AS product_count
`;

export default {
  /**
   * Danh sách category
   * opts: { page=1, pageSize=100, sortBy='id', order='asc', q, withCount=true }
   */
  async all(opts = {}) {
    const {
      page = 1,
      pageSize = 100,
      sortBy = 'id',
      order = 'asc',
      q,
      withCount = true,
    } = opts;

    const safeSort  = sanitizeSort(sortBy);
    const safeOrder = sanitizeOrder(order);
    const limit  = Math.max(1, Math.min(200, Number(pageSize) || 100));
    const offset = Math.max(0, (Number(page) - 1) * limit);

    const query = db('categories as c')
      .select('c.id', 'c.name', 'c.description', 'c.created_at', 'c.updated_at');

    // Nếu cần sắp xếp theo product_count mà withCount=false, vẫn ép thêm cột này
    const needCount = withCount || safeSort === 'product_count';
    if (needCount) query.select(db.raw(productCountSQL));

    if (q && String(q).trim()) {
      query.whereILike('c.name', `%${q.trim()}%`);
    }

    // orderBy: nếu sort theo product_count thì dùng raw alias, ngược lại dùng c.<col>
    if (safeSort === 'product_count') {
      query.orderBy(db.raw('product_count'), safeOrder);
    } else {
      query.orderBy(`c.${safeSort}`, safeOrder);
    }

    return query.limit(limit).offset(offset);
  },

  /** Lấy 1 category theo id (kèm product_count) */
  async byId(id) {
    const cid = Number(id);
    if (!Number.isInteger(cid) || cid <= 0) return null;

    const row = await db('categories as c')
      .select('c.id', 'c.name', 'c.description', 'c.created_at', 'c.updated_at', db.raw(productCountSQL))
      .where('c.id', cid)
      .first();
    return row ?? null;
  },

  /** Lấy category theo tên (không phân biệt hoa–thường) */
  async byName(name) {
    const nm = String(name || '').trim();
    if (!nm) return null;
    return db('categories as c')
      .select('c.id', 'c.name', 'c.description', 'c.created_at', 'c.updated_at', db.raw(productCountSQL))
      .whereRaw('LOWER(c.name) = LOWER(?)', [nm])
      .first();
  },

  /** Tạo category mới */
  async create(payload) {
    const rowIn = {
      name: String(payload.name || '').trim(),
      description: payload.description ?? null,
    };
    if (!rowIn.name) throw new Error('Category name is required');

    try {
      const [row] = await db('categories').insert(rowIn).returning('*');
      return row;
    } catch (e) {
      // 23505 = unique_violation (trùng name)
      if (e && e.code === '23505') {
        e.message = `Category "${rowIn.name}" already exists`;
      }
      throw e;
    }
  },

  /** Cập nhật category */
  async update(id, patch) {
    const cid = Number(id);
    if (!Number.isInteger(cid) || cid <= 0) return null;

    const data = { ...patch };
    if (data.name != null) data.name = String(data.name).trim();

    try {
      const [row] = await db('categories')
        .where({ id: cid })
        .update({ ...data, updated_at: db.fn.now() })
        .returning('*');
      return row ?? null;
    } catch (e) {
      if (e && e.code === '23505') {
        e.message = `Category "${data.name}" already exists`;
      }
      throw e;
    }
  },

  /** Xoá category (products.category_id sẽ SET NULL theo FK) */
  async remove(id) {
    const cid = Number(id);
    if (!Number.isInteger(cid) || cid <= 0) return { deleted: 0 };
    const deleted = await db('categories').where({ id: cid }).del();
    return { id: cid, deleted };
  },

  /** Đếm tất cả categories (phục vụ paging) */
  async count() {
    const [{ count }] = await db('categories').count({ count: '*' });
    return Number(count) || 0;
  }
};
