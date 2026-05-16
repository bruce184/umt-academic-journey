// src/controllers/admin.c.js
import { db } from "../models/db.js";
// response-util helpers are imported where needed; not used in this file

// In-memory stores for backups and logs (simple, safe fallback)
const _backups = [];
const _logs = [];

const makeBackupRecord = () => {
  const now = new Date();
  return {
    id: `bk_${Date.now()}`,
    filename: `backup_${now.toISOString()}.sql.gz`,
    date: now.toISOString(),
    size: "0 MB",
    type: "manual",
  };
};

// Giới hạn số log giữ trong bộ nhớ
const MAX_INMEM_LOGS = 500;

// Chuẩn hóa 1 dòng từ bảng audit_logs thành format FE dễ dùng
const mapAuditRowToLog = (row) => ({
  id: `sys_${row.log_id}`, // prefix cho log từ DB
  level: row.action_type, // INSERT / UPDATE / DELETE / SYSTEM...
  entity: row.entity,
  message: row.description,
  timestamp: row.log_timestamp,
  userId: row.user_id,
  userName: row.user_name || null,
  source: "audit", // đánh dấu là log từ DB
});

// GET /admin/stats - return counts used by admin dashboard
export const getStats = async () => {
  try {
    const courseRow = await db("courses").count("course_id as cnt").first();
    const userRow = await db("users").count("user_id as cnt").first();
    return {
      ok: true,
      data: {
        totalCourses: Number(courseRow?.cnt || 0),
        totalUsers: Number(userRow?.cnt || 0),
      },
    };
  } catch (err) {
    console.error("[admin.c] getStats error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

// GET /admin/users - list users (basic)
export const getUsers = async () => {
  try {
    const rows = await db("users as u")
      .leftJoin("accounts as a", "a.user_id", "u.user_id")
      .select(
        "u.user_id as id",
        "u.full_name as name",
        "u.email",
        "a.user_role as role",
      )
      .orderBy("u.full_name", "asc");
    return { ok: true, data: rows };
  } catch (err) {
    console.error("[admin.c] getUsers error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

export const getUserById = async (req) => {
  const id = req.params?.id;
  if (!id)
    return { ok: false, error: { code: "BAD_REQUEST", message: "Missing id" } };
  try {
    const row = await db("users as u")
      .leftJoin("accounts as a", "a.user_id", "u.user_id")
      .where("u.user_id", id)
      .first()
      .select(
        "u.user_id as id",
        "u.full_name as name",
        "u.email",
        "a.user_role as role",
      );
    if (!row)
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "User not found" },
      };
    return { ok: true, data: row };
  } catch (err) {
    console.error("[admin.c] getUserById error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

export const createUser = async (req) => {
  const body = req.body || {};
  const { name, email, role, password } = body;
  if (!name || !email)
    return {
      ok: false,
      error: { code: "BAD_REQUEST", message: "Missing name or email" },
    };
  try {
    const trxResult = await db.transaction(async (trx) => {
      const userRows = await trx("users")
        .insert({ full_name: name, email })
        .returning(["user_id"]);
      const userId =
        Array.isArray(userRows) && userRows[0]
          ? userRows[0].user_id
          : userRows.user_id;
      if (password || role) {
        await trx("accounts").insert({
          user_name: email,
          user_id: userId,
          password: password || "",
          user_role: (role || "").toUpperCase(),
        });
      }
      return userId;
    });
    return { ok: true, data: { id: trxResult, name, email, role } };
  } catch (err) {
    console.error("[admin.c] createUser error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

export const updateUser = async (req) => {
  const id = req.params?.id;
  const body = req.body || {};
  if (!id)
    return { ok: false, error: { code: "BAD_REQUEST", message: "Missing id" } };
  try {
    const userFields = {};
    if (body.name) userFields.full_name = body.name;
    if (body.email) userFields.email = body.email;
    if (Object.keys(userFields).length)
      await db("users").where({ user_id: id }).update(userFields);
    if (body.role || body.password) {
      const acc = await db("accounts").where({ user_id: id }).first();
      const accFields = {};
      if (body.password) accFields.password = body.password;
      if (body.role) accFields.user_role = (body.role || "").toUpperCase();
      if (acc)
        await db("accounts").where({ user_id: id }).update(accFields);
      else
        await db("accounts").insert({
          user_name: body.email || body.name || `user${id}`,
          user_id: id,
          password: body.password || "",
          user_role: (body.role || "").toUpperCase(),
        });
    }
    return { ok: true, data: { id } };
  } catch (err) {
    console.error("[admin.c] updateUser error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

export const deleteUser = async (req) => {
  const id = req.params?.id;
  if (!id)
    return { ok: false, error: { code: "BAD_REQUEST", message: "Missing id" } };
  try {
    await db.transaction(async (trx) => {
      await trx("accounts").where({ user_id: id }).del();
      await trx("users").where({ user_id: id }).del();
    });
    return { ok: true, data: { id } };
  } catch (err) {
    console.error("[admin.c] deleteUser error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

// Courses endpoints (basic)
export const getCourses = async () => {
  try {
    const rows = await db("courses")
      .select("course_id as id", "course_name as name", "course_credit as credit")
      .orderBy("course_name", "asc");
    return { ok: true, data: rows };
  } catch (err) {
    console.error("[admin.c] getCourses error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

export const getCourseById = async (req) => {
  const id = req.params?.id;
  if (!id)
    return { ok: false, error: { code: "BAD_REQUEST", message: "Missing id" } };
  try {
    const row = await db("courses")
      .where({ course_id: id })
      .first()
      .select("course_id as id", "course_name as name", "course_credit as credit");
    if (!row)
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Course not found" },
      };
    return { ok: true, data: row };
  } catch (err) {
    console.error("[admin.c] getCourseById error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

export const createCourse = async (req) => {
  const body = req.body || {};
  if (!body.name)
    return {
      ok: false,
      error: { code: "BAD_REQUEST", message: "Missing name" },
    };
  try {
    const inserted = await db("courses")
      .insert({
        course_name: body.name,
        course_credit: body.credit ?? null,
      })
      .returning(["course_id"]);

    const id =
      Array.isArray(inserted) && inserted[0]
        ? inserted[0].course_id
        : inserted.course_id;

    return { ok: true, data: { id, name: body.name } };
  } catch (err) {
    console.error("[admin.c] createCourse error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

export const updateCourse = async (req) => {
  const id = req.params?.id;
  const body = req.body || {};
  if (!id)
    return { ok: false, error: { code: "BAD_REQUEST", message: "Missing id" } };
  try {
    const fields = {};
    if (body.name) fields.course_name = body.name;
    if (body.credit !== undefined) fields.course_credit = body.credit;
    if (Object.keys(fields).length)
      await db("courses").where({ course_id: id }).update(fields);
    return { ok: true, data: { id } };
  } catch (err) {
    console.error("[admin.c] updateCourse error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

export const deleteCourse = async (req) => {
  const id = req.params?.id;
  if (!id)
    return { ok: false, error: { code: "BAD_REQUEST", message: "Missing id" } };
  try {
    await db("courses").where({ course_id: id }).del();
    return { ok: true, data: { id } };
  } catch (err) {
    console.error("[admin.c] deleteCourse error:", err);
    return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
  }
};

// Backups (in-memory)
export const listBackups = async () => {
  return { ok: true, data: _backups };
};

export const createBackup = async () => {
  const rec = makeBackupRecord();
  _backups.unshift(rec);
  return { ok: true, data: rec };
};

export const deleteBackup = async (req) => {
  const id = req.params?.id;
  if (!id)
    return { ok: false, error: { code: "BAD_REQUEST", message: "Missing id" } };
  const idx = _backups.findIndex((b) => b.id === id);
  if (idx >= 0) _backups.splice(idx, 1);
  return { ok: true, data: { id } };
};

export const restoreBackup = async (req) => {
  const id = req.params?.id;
  const b = _backups.find((x) => x.id === id) || null;
  if (!b)
    return {
      ok: false,
      error: { code: "NOT_FOUND", message: "Backup not found" },
    };
  // For safety, we do not perform actual DB restore here; return success indicator
  return {
    ok: true,
    data: { id, message: "Restore simulated (server-side)." },
  };
};

// Logs: ưu tiên lấy từ bảng audit_logs, _logs chỉ là fallback/in-memory
export const listLogs = async (req) => {
  try {
    const q = req?.query || {};
    const limitRaw = Number(q.limit);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 500
        ? limitRaw
        : 100;

    const rows = await db("audit_logs as al")
      .leftJoin("users as u", "al.user_id", "u.user_id")
      .select(
        "al.log_id",
        "al.action_type",
        "al.entity",
        "al.description",
        "al.log_timestamp",
        "al.user_id",
        "u.full_name as user_name",
      )
      .orderBy("al.log_timestamp", "desc")
      .limit(limit);

    const auditLogs = rows.map(mapAuditRowToLog);

    // Gộp log in-memory (ứng dụng) + audit log từ DB
    const combined = [..._logs, ...auditLogs];

    return { ok: true, data: combined };
  } catch (err) {
    console.error("[admin.c] listLogs error:", err);
    // Nếu DB lỗi, vẫn trả về log in-memory để UI không vỡ
    return { ok: true, data: _logs };
  }
};

export const createLog = async (req) => {
  const body = req?.body || {};
  const { level, message, entity, meta } = body;

  // Bản ghi in-memory để UI phản hồi nhanh
  const rec = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: level || "INFO",
    message: message || "",
    entity: entity || "SYSTEM",
    meta: meta || {},
    source: "app",
  };

  try {
    // Lưu thêm vào audit_logs nếu có thể
    const userId = req?.session?.user?.userId || null;

    const actionType = String(level || "SYSTEM").slice(0, 20);
    const description = message || JSON.stringify(meta || {});

    await db("audit_logs").insert({
      user_id: userId,
      action_type: actionType,
      entity: entity || "SYSTEM",
      description,
      // log_timestamp: DEFAULT NOW()
    });

    // Dù DB insert thành công hay không, ta vẫn giữ rec trong _logs
  } catch (err) {
    console.error("[admin.c] createLog DB insert error:", err);
    // Nếu lỗi DB thì xem như chỉ log in-memory, không throw ra ngoài
  }

  // Cập nhật in-memory
  _logs.unshift(rec);
  if (_logs.length > MAX_INMEM_LOGS) _logs.pop();

  return { ok: true, data: rec };
};
