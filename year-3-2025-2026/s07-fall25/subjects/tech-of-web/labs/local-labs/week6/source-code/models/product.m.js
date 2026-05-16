// models/product.m.js
import db from '../db/db.js';

/** Whitelist cột cho sort để tránh SQL injection dạng cột tùy ý */
const SORTABLE = new Set(['id', 'title', 'price', 'rating_rate', 'rating_count', 'created_at', 'updated_at']);
const sanitizeSort = (s) => (SORTABLE.has(String(s)) ? String(s) : 'id');
const sanitizeOrder = (o) => (String(o).toLowerCase() === 'desc' ? 'desc' : 'asc');

/** Truy vấn chung: join + alias category */
const selectBase = () =>
  db('products as p')
    .leftJoin('categories as c', 'p.category_id', 'c.id')
    .select(
      'p.id',
      'p.title',
      'p.description',
      'p.price',
      'p.category_id',
      'p.rating_rate',
      'p.rating_count',
      'p.image',
      'p.created_at',
      'p.updated_at',
      db.raw('c.name as category')
    );

export default {
  /** Danh sách + phân trang + sắp xếp + tìm kiếm theo title (tuỳ chọn)
   * @param {Object} opts
   * @param {number} [opts.page=1]
   * @param {number} [opts.pageSize=20]
   * @param {string} [opts.sortBy='id']    // id|title|price|rating_rate|rating_count|created_at|updated_at
   * @param {'asc'|'desc'} [opts.order='asc']
   * @param {string} [opts.q]              // optional: search in title (ILIKE %q%)
   */
  async all(opts = {}) {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'id',
      order = 'asc',
      q,
    } = opts;

    const safeSort = sanitizeSort(sortBy);
    const safeOrder = sanitizeOrder(order);
    const limit = Math.max(1, Math.min(100, Number(pageSize) || 20));
    const offset = Math.max(0, (Number(page) - 1) * limit);

    const qBuilder = selectBase().orderBy(`p.${safeSort}`, safeOrder).limit(limit).offset(offset);

    if (q && String(q).trim()) {
      // Postgres ILIKE for case-insensitive search
      qBuilder.whereILike('p.title', `%${q.trim()}%`);
    }
    return qBuilder;
  },

  /** Lấy 1 sản phẩm theo id */
  async one(id) {
    const pid = Number(id);
    if (!Number.isInteger(pid) || pid <= 0) return null;
    return selectBase().where('p.id', pid).first();
  },

  /** Danh sách theo category (so khớp không phân biệt hoa–thường) + paging/sort */
  async allOfCategory(name, opts = {}) {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'id',
      order = 'asc',
    } = opts;

    const safeSort = sanitizeSort(sortBy);
    const safeOrder = sanitizeOrder(order);
    const limit = Math.max(1, Math.min(100, Number(page) || 20));
    const offset = Math.max(0, (Number(page) - 1) * limit);

    return selectBase()
      .whereRaw('LOWER(c.name) = LOWER(?)', [String(name || '').trim()])
      .orderBy(`p.${safeSort}`, safeOrder)
      .limit(limit)
      .offset(offset);
  },

  /** Tạo mới */
  async add(payload) {
    // Gợi ý: controller nên validate trước; ở đây chỉ ép kiểu an toàn tối thiểu
    const rowIn = {
      title: String(payload.title),
      description: payload.description ?? null,
      price: payload.price != null ? Number(payload.price) : 0,
      category_id: payload.category_id ?? null,
      rating_rate: payload.rating_rate ?? null,
      rating_count: payload.rating_count ?? null,
      image: payload.image ?? null,
      // created_at/updated_at tự set bởi timestamps
    };
    const [row] = await db('products').insert(rowIn).returning('*');
    return row;
  },

  /** Cập nhật */
  async update(id, payload) {
    const pid = Number(id);
    if (!Number.isInteger(pid) || pid <= 0) return null;

    const patch = { ...payload };
    if (patch.price != null) patch.price = Number(patch.price);
    if (patch.rating_rate != null) patch.rating_rate = Number(patch.rating_rate);
    if (patch.rating_count != null) patch.rating_count = Number(patch.rating_count);

    const [row] = await db('products')
      .where({ id: pid })
      .update({ ...patch, updated_at: db.fn.now() })
      .returning('*');
    return row ?? null;
  },

  /** Xoá */
  async remove(id) {
    const pid = Number(id);
    if (!Number.isInteger(pid) || pid <= 0) return { deleted: 0 };
    const deleted = await db('products').where({ id: pid }).del();
    return { id: pid, deleted };
  },

  /** Đếm tất cả (phục vụ paging) */
  async count() {
    const [{ count }] = await db('products').count({ count: '*' });
    return Number(count) || 0;
  },

  /** Đếm theo category (phục vụ paging) */
  async countByCategory(name) {
    const [{ count }] = await db('products as p')
      .join('categories as c', 'p.category_id', 'c.id')
      .whereRaw('LOWER(c.name) = LOWER(?)', [String(name || '').trim()])
      .count({ count: '*' });
    return Number(count) || 0;
  }
};
