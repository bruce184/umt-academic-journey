// src/controllers/student.c.js
import db from "../models/db.js";
import { sendOk, sendCreated, sendError } from "./response-util.js";

// Tính mốc đầu tháng / đầu tháng sau để dùng cho các thống kê.
const getCurrentMonthBound = () => {
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  ).toISOString();

  return { startOfMonth, startOfNextMonth };
};

/// Helper: lấy studentId từ params / req.user.
const resolveStudentId = (req) => {
  return (
    req.params?.student_id ||
    req.body?.student_id ||
    req.query?.student_id ||
    req.user?.id
  );
};

/**
 * Helper: lấy current_term_id của 1 sinh viên.
 * Giả định bảng "students" có cột current_term_id.
 */
const getStudentCurrentTermId = async (studentId) => {
  const row = await db("students")
    .select("current_term_id")
    .where("id", studentId)
    .first();

  return row ? row.current_term_id : null;
};


// ============================================================================
// 1. DASHBOARD & SCHEDULE
// ============================================================================

/**
 * GET /api/student/dashboard/:student_id
 *
 * Tổng quan dashboard:
 *  - todaySchedule: dựa trên getTodaySchedule (query lại trực tiếp)
 *  - creditsRegistered: từ courseRegistered
 *  - currentGpa: từ bảng điểm (tính nhanh)
 *  - pendingRequests: số request đang PENDING/PROCESSING
 *  - notificationsUnread: tạm thời = số announcements trong tháng (chưa có per-user read)
 */
export const getDashboardSummary = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const { startOfMonth, startOfNextMonth } = getCurrentMonthBound();
    const today = new Date().toISOString().slice(0, 10);

    const termId = await getStudentCurrentTermId(studentId);
    if (!termId) {
      return sendError(
        res,
        400,
        "MISSING_TERM",
        "Không xác định được học kỳ hiện tại của sinh viên",
      );
    }

    // 1) Today schedule (giống getTodaySchedule)
    const now = new Date();
    const weekday = now.getDay() === 0 ? 7 : now.getDay();

    const todayRows = await db("student_registrations as sr")
      .join("course_offerings as co", "co.id", "sr.offering_id")
      .join("courses as c", "c.id", "co.course_id")
      .leftJoin("lecturers as l", "l.id", "co.lecturer_id")
      .where("sr.student_id", studentId)
      .andWhere("sr.term_id", termId)
      .andWhere("co.day_of_week", weekday)
      .select(
        "c.course_code",
        "c.course_name",
        "co.class_group",
        "co.room_name",
        "co.start_time",
        "co.end_time",
        "l.full_name as lecturer_name"
      )
      .orderBy("co.start_time", "asc");

    const todaySchedule = todayRows.map((row) => ({
      time:
        (row.start_time?.toString().slice(0, 5) ?? "") +
        " - " +
        (row.end_time?.toString().slice(0, 5) ?? ""),
      courseCode: row.course_code,
      courseName: row.course_name,
      room: row.room_name,
      status: "upcoming", // nếu cần, có thể tính ongoing/finished theo giờ
    }));

    // 2) Credits registered trong term hiện tại
    const regRows = await db("student_registrations as sr")
      .join("course_offerings as co", "co.id", "sr.offering_id")
      .join("courses as c", "c.id", "co.course_id")
      .where("sr.student_id", studentId)
      .andWhere("sr.term_id", termId)
      .select("c.credits");

    const creditsRegistered = regRows.reduce(
      (sum, r) => sum + (Number(r.credits) || 0),
      0
    );

    // 3) GPA (cumulative) nhanh
    const gradeRows = await db("student_course_results as r")
      .join("courses as c", "c.id", "r.course_id")
      .where("r.student_id", studentId)
      .select("r.grade_point", "c.credits");

    let qpAll = 0;
    let crAll = 0;
    for (const row of gradeRows) {
      const gp = Number(row.grade_point);
      const cr = Number(row.credits);
      if (!Number.isFinite(gp) || !Number.isFinite(cr) || cr <= 0) continue;
      qpAll += gp * cr;
      crAll += cr;
    }
    const currentGpa = crAll > 0 ? Number((qpAll / crAll).toFixed(2)) : null;

    // 4) Pending requests
    const pendingCountRow = await db("requests")
      .where("student_id", studentId)
      .whereIn("status", ["PENDING", "PROCESSING"])
      .count("* as cnt")
      .first();

    const pendingRequests = pendingCountRow ? Number(pendingCountRow.cnt) : 0;

    // 5) Notifications unread (tạm = tổng thông báo tháng này, chưa tracking read)
    const annCountRow = await db("announcements")
      .where("is_active", true)
      .andWhere("created_at", ">=", startOfMonth)
      .andWhere("created_at", "<", startOfNextMonth)
      .count("* as cnt")
      .first();

    const notificationsUnread = annCountRow ? Number(annCountRow.cnt) : 0;

    const summary = {
      studentId,
      period: {
        startOfMonth,
        startOfNextMonth,
      },
      today,
      todaySchedule,
      creditsRegistered,
      currentGpa,
      pendingRequests,
      notificationsUnread,
    };

    return sendOk(res, summary);
  } catch (err) {
    console.error("[student] getDashboardSummary error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy dữ liệu Dashboard");
  }
};

/**
 * GET /students/:student_id/today-schedule
 * Lịch học trong ngày (theo thứ).
 *
 * Giả định schema:
 *  - student_registrations(student_id, term_id, offering_id)
 *  - course_offerings(id, course_id, term_id, day_of_week, start_time, end_time, room_name, class_group, lecturer_id)
 *  - courses(id, course_code, course_name)
 *  - lecturers(id, full_name)
 */
export const getTodaySchedule = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const termId = await getStudentCurrentTermId(studentId);
    if (!termId) {
      return sendError(
        res,
        400,
        "MISSING_TERM",
        "Không xác định được học kỳ hiện tại của sinh viên",
      );
    }

    const today = new Date();
    const isoDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
    const weekday = today.getDay() === 0 ? 7 : today.getDay(); // Chủ nhật = 7

    const rows = await db("student_registrations as sr")
      .join("course_offerings as co", "co.id", "sr.offering_id")
      .join("courses as c", "c.id", "co.course_id")
      .leftJoin("lecturers as l", "l.id", "co.lecturer_id")
      .where("sr.student_id", studentId)
      .andWhere("sr.term_id", termId)
      .andWhere("co.day_of_week", weekday)
      .select(
        "c.course_code",
        "c.course_name",
        "co.class_group",
        "co.room_name",
        "co.start_time",
        "co.end_time",
        "l.full_name as lecturer_name"
      )
      .orderBy("co.start_time", "asc");

    const items = rows.map((row) => ({
      course_code: row.course_code,
      course_name: row.course_name,
      class_group: row.class_group,
      room: row.room_name,
      lecturer_name: row.lecturer_name || null,
      start_time: row.start_time?.toString().slice(0, 5) ?? null,
      end_time: row.end_time?.toString().slice(0, 5) ?? null,
      session_type: "lecture",
    }));

    return sendOk(res, { date: isoDate, items });
  } catch (err) {
    console.error("[student] getTodaySchedule error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy lịch học hôm nay");
  }
};

/**
 * GET /api/student/schedule/:student_id
 * GET /students/:student_id/schedule
 *
 * Trả về toàn bộ lịch học (theo tuần/kỳ).
 * FE Student Schedule đang chấp nhận một mảng ([]) các buổi:
 *  {
 *    weekday,          // 1..7
 *    start_time,       // "HH:MM"
 *    end_time,         // "HH:MM"
 *    course_code,
 *    course_name,
 *    class_group,
 *    room,
 *    lecturer_name
 *  }
 */
export const mySchedule = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const termId = await getStudentCurrentTermId(studentId);
    if (!termId) {
      return sendError(
        res,
        400,
        "MISSING_TERM",
        "Không xác định được học kỳ hiện tại của sinh viên",
      );
    }

    const rows = await db("student_registrations as sr")
      .join("course_offerings as co", "co.id", "sr.offering_id")
      .join("courses as c", "c.id", "co.course_id")
      .leftJoin("lecturers as l", "l.id", "co.lecturer_id")
      .where("sr.student_id", studentId)
      .andWhere("sr.term_id", termId)
      .select(
        "co.day_of_week",
        "co.start_time",
        "co.end_time",
        "c.course_code",
        "c.course_name",
        "co.class_group",
        "co.room_name",
        "l.full_name as lecturer_name"
      )
      .orderBy("co.day_of_week", "asc")
      .orderBy("co.start_time", "asc");

    const result = rows.map((row) => ({
      weekday: row.day_of_week,
      start_time: row.start_time?.toString().slice(0, 5) ?? null,
      end_time: row.end_time?.toString().slice(0, 5) ?? null,
      course_code: row.course_code,
      course_name: row.course_name,
      class_group: row.class_group,
      room: row.room_name,
      lecturer_name: row.lecturer_name || null,
    }));

    return sendOk(res, result); // trả array in data
  } catch (err) {
    console.error("[student] mySchedule error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy dữ liệu lịch học");
  }
};

// ============================================================================
// 2. ENROLLMENT OVERVIEW
// ============================================================================

/**
 * GET /api/student/enrollment/degree-count
 * Thống kê số chương trình đào tạo (degree) mà SV đang theo.
 *
 * Giả định đơn giản:
 *  - Mỗi sinh viên thuộc 1 program trong bảng students.program_id.
 *  - Nên degreeCount sẽ là 1 nếu có program_id, ngược lại 0.
 */
export const numberOfDegree = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const row = await db("students")
      .select("program_id")
      .where("id", studentId)
      .first();

    if (!row) {
      return sendError(res, 404, "NOT_FOUND", "Student not found");
    }

    const degreeCount = row.program_id ? 1 : 0;

    const data = {
      studentId,
      degreeCount,
    };

    return sendOk(res, data);
  } catch (err) {
    console.error("[student] numberOfDegree error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy số lượng chương trình");
  }
};

/**
 * GET /api/student/enrollment/courses-registered
 *
 * Thống kê số môn & tín chỉ mà SV đang đăng ký trong term hiện tại.
 *
 * Dùng bảng:
 *  - student_registrations(student_id, term_id, offering_id)
 *  - course_offerings(id, course_id, ...)
 *  - courses(id, course_code, course_name, credits)
 */
export const courseRegistered = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const termId = await getStudentCurrentTermId(studentId);
    if (!termId) {
      return sendError(
        res,
        400,
        "MISSING_TERM",
        "Không xác định được học kỳ hiện tại của sinh viên",
      );
    }

    const rows = await db("student_registrations as sr")
      .join("course_offerings as co", "co.id", "sr.offering_id")
      .join("courses as c", "c.id", "co.course_id")
      .where("sr.student_id", studentId)
      .andWhere("sr.term_id", termId)
      .select(
        "co.id as offering_id",
        "c.course_code",
        "c.course_name",
        "c.credits"
      )
      .orderBy("c.course_code", "asc");

    const items = rows.map((row) => ({
      offering_id: row.offering_id,
      course_code: row.course_code,
      course_name: row.course_name,
      credits: row.credits,
    }));

    const totalCourses = items.length;
    const totalCredits = items.reduce(
      (sum, it) => sum + (Number(it.credits) || 0),
      0
    );

    const data = {
      studentId,
      termId,
      totalCourses,
      totalCredits,
      items,
    };

    return sendOk(res, data);
  } catch (err) {
    console.error("[student] courseRegistered error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy thống kê đăng ký môn");
  }
};

// ============================================================================
// 3. ACADEMICS & LEARNING PLAN
// ============================================================================

/**
 * GET /api/student/academics/summary
 * GET /students/:student_id/academics/summary
 *
 * Trả về tổng quan học tập:
 *  - cumulativeGpa
 *  - currentTermGpa
 *  - totalCreditsPassed
 *  - totalCoursesPassed
 *  - programName, totalCreditsRequired
 *  - currentTermLabel
 *
 * Giả định schema:
 *  - students(id, program_id, current_term_id, ...)
 *  - programs(id, name, total_credits_required)
 *  - terms(id, label)
 *  - student_course_results(
 *        id, student_id, course_id, term_id,
 *        grade_point numeric, grade_letter text,
 *        is_passed boolean
 *    )
 *  - courses(id, course_code, course_name, credits)
 */
export const getAcademicSummary = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    // 1) lấy thông tin chương trình + term hiện tại
    const meta = await db("students as s")
      .leftJoin("programs as p", "p.id", "s.program_id")
      .leftJoin("terms as t", "t.id", "s.current_term_id")
      .where("s.id", studentId)
      .select(
        "s.id as student_id",
        "s.current_term_id",
        "p.name as program_name",
        "p.total_credits_required",
        "t.label as current_term_label"
      )
      .first();

    if (!meta) {
      return sendError(res, 404, "NOT_FOUND", "Student not found");
    }

    const termId = meta.current_term_id;

    // 2) Lấy toàn bộ kết quả môn học của SV
    const gradeRows = await db("student_course_results as r")
      .join("courses as c", "c.id", "r.course_id")
      .where("r.student_id", studentId)
      .select(
        "r.term_id",
        "r.grade_point",
        "r.is_passed",
        "c.credits"
      );

    let totalCreditsPassed = 0;
    let totalCoursesPassed = 0;

    let totalQualityPointsAll = 0;
    let totalCreditsAll = 0;

    let totalQualityPointsTerm = 0;
    let totalCreditsTerm = 0;

    for (const row of gradeRows) {
      const gp = Number(row.grade_point);
      const cr = Number(row.credits);

      if (!Number.isFinite(cr) || cr <= 0) continue;

      // Tổng Credits & QP cho overall GPA
      if (Number.isFinite(gp)) {
        totalQualityPointsAll += gp * cr;
        totalCreditsAll += cr;
      }

      // Cho current term
      if (row.term_id && termId && Number(row.term_id) === Number(termId)) {
        if (Number.isFinite(gp)) {
          totalQualityPointsTerm += gp * cr;
          totalCreditsTerm += cr;
        }
      }

      // Credits passed
      if (row.is_passed) {
        totalCreditsPassed += cr;
        totalCoursesPassed += 1;
      }
    }

    const cumulativeGpa =
      totalCreditsAll > 0 ? totalQualityPointsAll / totalCreditsAll : null;

    const currentTermGpa =
      totalCreditsTerm > 0 ? totalQualityPointsTerm / totalCreditsTerm : null;

    // Academic status (tuỳ chính sách, tạm thời dùng theo cumulativeGpa)
    let academicStatus = "Đang học tốt";
    if (cumulativeGpa !== null) {
      if (cumulativeGpa < 2.0) academicStatus = "Cảnh báo học vụ";
      else if (cumulativeGpa < 2.5) academicStatus = "Cần cải thiện";
    }

    const data = {
      studentId: studentId,
      programName: meta.program_name || null,
      cumulativeGpa: cumulativeGpa !== null ? Number(cumulativeGpa.toFixed(2)) : null,
      currentTermLabel: meta.current_term_label || null,
      currentTermGpa: currentTermGpa !== null ? Number(currentTermGpa.toFixed(2)) : null,
      totalCreditsRequired: meta.total_credits_required || null,
      totalCreditsPassed,
      totalCoursesPassed,
      academicStatus,
    };

    // Giữ shape cũ: { data: {...} }
    return sendOk(res, data);
  } catch (err) {
    console.error("[student] getAcademicSummary error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy tổng quan học tập");
  }
};

/**
 * GET /api/student/academics/transcript
 * Bảng điểm chi tiết theo từng học kỳ.
 *
 * Giả định dùng cùng bảng student_course_results + courses + terms như trên.
 *
 * Response:
 * {
 *   data: {
 *     studentId,
 *     terms: [
 *       {
 *         termId,
 *         termLabel,
 *         items: [
 *           {
 *             course_code,
 *             course_name,
 *             credits,
 *             grade_letter,
 *             grade_point,
 *             is_passed
 *           }, ...
 *         ]
 *       }, ...
 *     ]
 *   }
 * }
 */
export const getTranscript = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const rows = await db("student_course_results as r")
      .join("courses as c", "c.id", "r.course_id")
      .leftJoin("terms as t", "t.id", "r.term_id")
      .where("r.student_id", studentId)
      .select(
        "r.term_id",
        "t.label as term_label",
        "c.course_code",
        "c.course_name",
        "c.credits",
        "r.grade_letter",
        "r.grade_point",
        "r.is_passed"
      )
      .orderBy("r.term_id", "asc")
      .orderBy("c.course_code", "asc");

    const termMap = new Map();

    for (const row of rows) {
      const termId = row.term_id || 0;
      if (!termMap.has(termId)) {
        termMap.set(termId, {
          termId,
          termLabel: row.term_label || (termId ? `Term ${termId}` : "No term"),
          items: [],
        });
      }

      termMap.get(termId).items.push({
        course_code: row.course_code,
        course_name: row.course_name,
        credits: row.credits,
        grade_letter: row.grade_letter,
        grade_point: row.grade_point,
        is_passed: row.is_passed,
      });
    }

    const data = { studentId, terms: Array.from(termMap.values()) };
    return sendOk(res, data);
  } catch (err) {
    console.error("[student] getTranscript error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy bảng điểm");
  }
};

/**
 * GET /api/student/academics/learning-plan
 * Tiến độ học tập so với chương trình (credits).
 *
 * Dùng lại:
 *  - programs.total_credits_required
 *  - student_course_results + courses để tính credits đã qua.
 */
export const getLearningPlanProgress = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const s = await db("students as s")
      .leftJoin("programs as p", "p.id", "s.program_id")
      .where("s.id", studentId)
      .select("p.total_credits_required")
      .first();

    if (!s) {
      return sendError(res, 404, "NOT_FOUND", "Student not found");
    }

    const required = s.total_credits_required || null;

    const rows = await db("student_course_results as r")
      .join("courses as c", "c.id", "r.course_id")
      .where("r.student_id", studentId)
      .andWhere("r.is_passed", true)
      .select("c.credits");

    let completed = 0;
    for (const row of rows) {
      const cr = Number(row.credits);
      if (Number.isFinite(cr) && cr > 0) completed += cr;
    }

    const remaining =
      required !== null ? Math.max(required - completed, 0) : null;

    const data = {
      studentId,
      totalRequiredCredits: required,
      completedCredits: completed,
      remainingCredits: remaining,
    };

    return sendOk(res, data);
  } catch (err) {
    console.error("[student] getLearningPlanProgress error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy tiến độ học tập");
  }
};

// ============================================================================
// 4. ANNOUNCEMENTS
// ============================================================================
/**
 * GET /students/announcements/recent?student_id=...
 *
 * FE Student Announcements đang dùng:
 *  - STUDENT_API_BASE = "/students"
 *  - Gọi GET /students/announcements/recent?student_id=...
 *  - Parse JSON:
 *      if (payload && typeof === "object" && Array.isArray(payload.data)) -> dùng payload.data
 *      else if (Array.isArray(payload)) -> dùng payload
 *
 * => Ở đây mình giữ response dạng { data: [...] } cho đơn giản.
 */
export const recentAnnouncements = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const { startOfMonth } = getCurrentMonthBound();

    // Giả định:
    //  - Bảng "announcements" như phần SQL gợi ý.
    //  - Hiện tại hiển thị chung cho tất cả sinh viên (chưa filter theo lớp/khoa).
    //
    //  Nếu schema thật có:
    //    - cột khác tên (vd: subject, body, department,...)
    //    - hoặc bảng mapping "announcement_targets"
    //  thì chỉ cần chỉnh phần .from() / .select() / .where().
    const rowsFromDb = await db("announcements")
      .where("is_active", true)
      .andWhere("created_at", ">=", startOfMonth)
      .orderBy("created_at", "desc")
      .limit(20)
      .select(
        "id",
        "title",
        "summary",
        "content",
        "category",
        "source",
        "created_at"
      );

    // Map sang shape mà FE mong đợi:
    //   title, summary/contentPreview/content, source, createdAt/created_at
    const items = rowsFromDb.map((row) => {
      // Nếu không có summary, cắt content làm preview ngắn.
      let preview = row.summary;
      if (!preview && row.content) {
        preview = row.content.length > 160
          ? row.content.slice(0, 157) + "..."
          : row.content;
      }

      return {
        id: row.id,
        title: row.title,
        summary: preview,          // FE dùng item.summary || item.contentPreview || item.content
        content: row.content,
        category: row.category,
        source: row.source,
        createdAt: row.created_at, // FE sẽ gọi formatDate(item.createdAt || item.date || item.created_at)
      };
    });

    return sendOk(res, items);
  } catch (err) {
    console.error("[student] recentAnnouncements error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy thông báo");
  }
};

// ============================================================================
// 5. E-FORMS / REQUESTS
// ============================================================================

/**
 * POST /api/student/requests
 * Tạo đơn e-form mới (xin nghỉ học, phúc khảo, xác nhận sinh viên, ...).
 *
 * Body (FE eForm gửi):
 *  {
 *    "student_id": 1,            // hoặc lấy từ session / params
 *    "type": "ABSENCE",
 *    "title": "Xin nghỉ học môn OS ngày 05/01",
 *    "content": "Lý do, thời gian, môn học, ..."
 *  }
 */
export const createRequest = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const { type, title, content } = req.body || {};

    if (!type || !title || !content) {
      return sendError(
        res,
        400,
        "INVALID_INPUT",
        "Thiếu thông tin bắt buộc: type, title, content",
      );
    }

    const now = new Date().toISOString();

    // INSERT thật vào bảng "requests"
    const [row] = await db("requests")
      .insert({
        student_id: studentId,
        request_type: type,
        title,
        content,
        status: "PENDING",
        created_at: now,
        updated_at: now,
      })
      .returning([
        "id",
        "student_id",
        "request_type",
        "title",
        "content",
        "status",
        "created_at",
        "updated_at",
      ]);

    // Chuẩn hóa response cho FE
    const created = {
      id: row.id,
      studentId: row.student_id,
      type: row.request_type,
      title: row.title,
      content: row.content,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return sendCreated(res, created);
  } catch (err) {
    console.error("[student] createRequest error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi tạo e-form");
  }
};

/**
 * POST /students/:student_id/eforms
 * Dùng cho FE Student eForms (eform-student.js).
 *
 * Body FE gửi:
 * {
 *   "form_type": "ABSENCE",
 *   "title": "Xin nghỉ học môn ...",
 *   "content": "Lý do chi tiết ...",
 *   "attachment_url": null  // hiện tại chưa dùng
 * }
 *
 * FE sau đó chỉ cần biết thành công/thất bại, không phụ thuộc chặt vào shape;
 * nhưng ta vẫn trả lại object chuẩn để dễ debug.
 */
export const createEForm = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const { form_type, type, title, content } = req.body || {};
    const finalType = form_type || type;

    if (!finalType || !title || !content) {
      return sendError(
        res,
        400,
        "INVALID_INPUT",
        "Thiếu thông tin bắt buộc: form_type/type, title, content",
      );
    }

    const now = new Date().toISOString();

    // INSERT vào bảng "requests"
    const [row] = await db("requests")
      .insert({
        student_id: studentId,
        request_type: finalType,
        title,
        content,
        status: "PENDING",
        created_at: now,
        updated_at: now,
      })
      .returning([
        "id",
        "student_id",
        "request_type",
        "title",
        "content",
        "status",
        "created_at",
        "updated_at",
      ]);

    // Map sang shape mà FE đọc được (eform-student.js) 
    const created = {
      id: row.id,
      form_type: row.request_type,
      title: row.title,
      content: row.content,
      status: row.status,
      created_at: row.created_at,
      last_updated_at: row.updated_at,
    };

    // eform-student.js: nếu body có { data: ... } thì lấy data, nếu object thường thì lấy luôn. 
    return sendCreated(res, created);
  } catch (err) {
    console.error("[student] createEForm error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi tạo eForm");
  }
};

/**
 * GET /api/student/requests
 * Lịch sử các e-form mà sinh viên đã gửi.
 */
export const getRequestHistory = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const rows = await db("requests")
      .where("student_id", studentId)
      .orderBy("created_at", "desc");

    const data = rows.map((row) => ({
      id: row.id,
      studentId: row.student_id,
      type: row.request_type,
      title: row.title,
      content: row.content,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return sendOk(res, data);
  } catch (err) {
    console.error("[student] getRequestHistory error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy lịch sử e-form");
  }
};

/**
 * GET /students/:student_id/eforms
 * FE Student eForms dùng để load lịch sử, format trong eform-student.js. 
 *
 * FE chấp nhận:
 *   - { ok: true, data: { items: [...] } }
 *   - { items: [...] }
 *   - [ ... ]  // plain array
 *
 * Ở đây mình trả đơn giản là mảng [] cho gọn.
 */
export const listEForms = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const rows = await db("requests")
      .where("student_id", studentId)
      .orderBy("created_at", "desc")
      .select(
        "id",
        "request_type",
        "title",
        "content",
        "status",
        "created_at",
        "updated_at"
      );

    const items = rows.map((row) => ({
      id: row.id,
      form_type: row.request_type,
      title: row.title,
      content: row.content,
      status: row.status,
      created_at: row.created_at,
      last_updated_at: row.updated_at,
    }));

    // Return standardized envelope with array in data
    return sendOk(res, items);
  } catch (err) {
    console.error("[student] listEForms error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy danh sách eForm");
  }
};

/**
 * GET /api/student/requests/:request_id
 * Chi tiết một e-form cụ thể của sinh viên.
 */
export const getRequestDetail = async (req, res) => {
  const studentId = resolveStudentId(req);
  const requestId = req.params?.request_id;

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }
  if (!requestId) {
    return sendError(res, 400, "MISSING_REQUEST_ID", "Missing request_id");
  }

  try {
    const row = await db("requests")
      .where({
        id: requestId,
        student_id: studentId,
      })
      .first();

    if (!row) {
      return sendError(res, 404, "NOT_FOUND", "Không tìm thấy e-form");
    }

    const data = {
      id: row.id,
      studentId: row.student_id,
      type: row.request_type,
      title: row.title,
      content: row.content,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return sendOk(res, data);
  } catch (err) {
    console.error("[student] getRequestDetail error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy chi tiết e-form");
  }
};

// ============================================================================
// 6. COURSE REGISTRATION (API + DB-ready skeleton)
// ============================================================================

/**
 * GET /students/:student_id/registration/available
 * Trả về danh sách lớp/môn còn mở để SV đăng ký.
 *
 * FE chấp nhận:
 *  - { data: { items: [...] } }
 *  - { items: [...] }
 *  - [ ... ]
 * Ở đây mình trả đơn giản là **array** cho gọn.
 *
 * Giả định schema:
 *  - students(id, current_term_id)
 *  - courses(id, course_code, course_name, credits)
 *  - course_offerings(
 *        id, course_id, term_id, day_of_week,
 *        start_time, end_time, room_name, class_group,
 *        capacity, is_open_for_registration
 *    )
 */
export const getAvailableCoursesForRegistration = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const termId = await getStudentCurrentTermId(studentId);
    if (!termId) {
      return sendError(
        res,
        400,
        "MISSING_TERM",
        "Không xác định được học kỳ hiện tại của sinh viên",
      );
    }

    // Lấy các lớp đang mở đăng ký trong kỳ hiện tại
    const offerings = await db("course_offerings as co")
      .join("courses as c", "c.id", "co.course_id")
      .where("co.term_id", termId)
      .andWhere("co.is_open_for_registration", true) // Giả định cột này tồn tại
      .select(
        "co.id as offering_id",
        "c.course_code",
        "c.course_name",
        "c.credits",
        "co.day_of_week",
        "co.start_time",
        "co.end_time",
        "co.room_name",
        "co.class_group",
        "co.capacity"
      )
      .orderBy("c.course_code", "asc")
      .orderBy("co.class_group", "asc");

    // Lấy số lượng SV đã đăng ký cho từng offering để tính is_full
    const offeringIds = offerings.map((o) => o.offering_id);
    let countMap = new Map();

    if (offeringIds.length > 0) {
      const counts = await db("student_registrations")
        .whereIn("offering_id", offeringIds)
        .andWhere("term_id", termId)
        .groupBy("offering_id")
        .select("offering_id")
        .count("* as enrolled_count");

      countMap = new Map(
        counts.map((r) => [r.offering_id, Number(r.enrolled_count)])
      );
    }

    const items = offerings.map((row) => {
      const enrolled = countMap.get(row.offering_id) || 0;
      const capacity = row.capacity || 0;
      const isFull = capacity > 0 ? enrolled >= capacity : false;

      return {
        id: row.offering_id,
        course_code: row.course_code,
        course_name: row.course_name,
        credits: row.credits,
        weekday: row.day_of_week,
        start_time: row.start_time?.toString().slice(0, 5) ?? null, // "HH:MM"
        end_time: row.end_time?.toString().slice(0, 5) ?? null,
        room: row.room_name,
        class_group: row.class_group,
        is_full: isFull,
        description: null,
      };
    });

    // Return standardized envelope
    return sendOk(res, items);
  } catch (err) {
    console.error("[student] getAvailableCoursesForRegistration error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy danh sách môn mở đăng ký");
  }
};

/**
 * GET /students/:student_id/registration
 * Trả về danh sách id lớp/môn SV đang đăng ký trong kỳ hiện tại.
 *
 * FE Student Registration chấp nhận nhiều format:
 *  - { course_ids: [...] }
 *  - { items: [...] }
 *  - [ ... ]
 * Ở đây mình trả: { course_ids: [...] } cho rõ ràng.
 *
 * Giả định bảng:
 *  - student_registrations(student_id, term_id, offering_id, registered_at)
 */
export const getCurrentRegistration = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  try {
    const termId = await getStudentCurrentTermId(studentId);
    if (!termId) {
      return sendError(
        res,
        400,
        "MISSING_TERM",
        "Không xác định được học kỳ hiện tại của sinh viên",
      );
    }

    const rows = await db("student_registrations")
      .where({
        student_id: studentId,
        term_id: termId,
      })
      .select("offering_id");

    const courseIds = rows
      .map((r) => r.offering_id)
      .filter((id) => typeof id === "number");

    return sendOk(res, { course_ids: courseIds });
  } catch (err) {
    console.error("[student] getCurrentRegistration error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lấy đăng ký hiện tại");
  }
};

/**
 * POST /students/:student_id/registration
 *
 * Body:
 *  { course_ids: number[] }
 *
 * Ghi đè danh sách đăng ký của SV trong kỳ hiện tại:
 *  - Xoá hết `student_registrations` cũ của SV trong term đó
 *  - Insert lại các `offering_id` mới
 */
export const saveRegistration = async (req, res) => {
  const studentId = resolveStudentId(req);

  if (!studentId) {
    return sendError(res, 400, "MISSING_STUDENT_ID", "Missing student_id");
  }

  const body = req.body || {};
  const rawIds = Array.isArray(body.course_ids) ? body.course_ids : [];

  // Chuẩn hoá sang mảng số duy nhất
  const courseIds = Array.from(
    new Set(
      rawIds
        .map((v) => {
          if (typeof v === "number") return v;
          if (typeof v === "string" && v.trim() !== "") {
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
          }
          if (v && typeof v === "object") {
            const candidate = v.offering_id ?? v.id ?? v.course_id;
            if (typeof candidate === "number") return candidate;
            if (
              typeof candidate === "string" &&
              candidate.trim() !== "" &&
              Number.isFinite(Number(candidate))
            ) {
              return Number(candidate);
            }
          }
          return null;
        })
        .filter((x) => typeof x === "number")
    )
  );

  try {
    await db.transaction(async (trx) => {
      const termId = await getStudentCurrentTermId(studentId);
      if (!termId) {
        throw new Error("Cannot resolve current_term_id for student");
      }
        // Check capacity for requested offerings: if any offering is full, reject
        if (courseIds.length > 0) {
          const counts = await trx('student_registrations')
            .whereIn('offering_id', courseIds)
            .andWhere('term_id', termId)
            .groupBy('offering_id')
            .select('offering_id')
            .count('* as enrolled_count');

          const countMap = new Map(counts.map((r) => [r.offering_id, Number(r.enrolled_count)]));

          const offerings = await trx('course_offerings')
            .whereIn('id', courseIds)
            .select('id', 'capacity');

          for (const off of offerings) {
            const enrolled = countMap.get(off.id) || 0;
            const cap = Number(off.capacity) || 0;
            if (cap > 0 && enrolled >= cap) {
              // If full, abort the transaction by throwing — upper catch will send 409
              const err = new Error(`Offering ${off.id} is full`);
              err.code = 'OFFERING_FULL';
              throw err;
            }
          }
        }

      // Xoá đăng ký cũ của SV trong kỳ này
      await trx("student_registrations")
        .where({ student_id: studentId, term_id: termId })
        .del();

      // Insert mới nếu có courseIds
      if (courseIds.length > 0) {
        const rowsToInsert = courseIds.map((offeringId) => ({
          student_id: studentId,
          term_id: termId,
          offering_id: offeringId,
          registered_at: trx.fn.now(),
        }));

        await trx("student_registrations").insert(rowsToInsert);
      }
    });

    // Trả lại danh sách vừa lưu để FE sync state
    return sendOk(res, { course_ids: courseIds });
  } catch (err) {
    console.error("[student] saveRegistration error:", err);
    return sendError(res, 500, "SERVER_ERROR", "Lỗi máy chủ khi lưu đăng ký học phần");
  }
};
