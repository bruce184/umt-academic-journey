import lecturerM from "../models/lecturer.m.js";
import { env } from "../config/env.js";

/** Core Logic: Lấy tất cả giảng viên. Trả về mảng giảng viên. */
export const fetchAllLecturersLogic = async () => {
  try {
    const res = await lecturerM.all();
    if (!res || !res.ok) {
      console.error("[lecturer] fetchAllLecturersLogic model error:", res && res.error);
      return null;
    }
    return res.data;
  } catch (err) {
    console.error("[lecturer] fetchAllLecturersLogic error:", err);
    return null;
  }
};

/** Core Logic: Lấy một giảng viên theo ID. Trả về đối tượng giảng viên hoặc null. */
export const fetchLecturerByIdLogic = async (lectureId) => {
  try {
    const res = await lecturerM.one(lectureId);
    if (!res || !res.ok) return null;
    return res.data;
  } catch (error) {
    console.error("[lecturer] fetchLecturerByIdLogic error:", error);
    return null;
  }
};

/** Core Logic: Đăng nhập. Trả về đối tượng giảng viên đã đăng nhập thành công hoặc null. */
export const lecturerLoginLogic = async (username, password) => {
  try {
    const res = await lecturerM.login(username, password);
    if (!res || !res.ok) return null;
    return res.data;
  } catch (error) {
    console.error("[lecturer] lecturerLoginLogic error:", error);
    return null;
  }
};

// Helper: lấy lecturerId từ params / body / query, có fallback mặc định (dev)
const resolveLecturerId = (req) => {
  const params = req?.params || {};
  const query = req?.query || {};
  const body = req?.body || {};

  const rawId =
    params.lectureId ||
    params.id ||
    body.lecturer_id ||
    query.lecturer_id ||
    query.lecturerId ||
    (req?.user && req.user.id);

  const parsed = Number(rawId);
  if (!rawId || Number.isNaN(parsed) || parsed <= 0) {
    return env.nodeEnv === "development" ? 1 : null;
  }

  return parsed;
};

// ===========================================
// 1. CHỨC NĂNG CƠ BẢN (RENDER VIEWS & CRUD)
// ===========================================

// Controller để lấy tất cả giảng viên (Sử dụng cho cả View và API)
export const getAllLecturers = async () => {
  try {
    const lecturers = await fetchAllLecturersLogic(); // Gọi Core Logic
    if (!lecturers) {
      return { ok: false, error: { code: "SERVER_ERROR", message: "Failed to fetch lecturers" } };
    }
    return { ok: true, data: { lecturers, title: "Lecturer List" } };
  } catch (error) {
    console.error("[lecturer] getAllLecturers error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to fetch lecturers",
      },
    };
  }
};

// Controller để lấy một giảng viên theo ID (Sử dụng cho cả View và API)
export const getLecturerById = async (req) => {
  const lectureId = req.params.lectureId || req.params.id;
  try {
    const lecturer = await fetchLecturerByIdLogic(lectureId); // Gọi Core Logic
    if (!lecturer) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Lecturer not found" },
      };
    }

    return { ok: true, data: { lecturer, title: "Lecturer Details" } };
  } catch (error) {
    console.error("[lecturer] getLecturerById error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to fetch lecturer",
      },
    };
  }
};

// ===========================================
// 2. CHỨC NĂNG NGHIỆP VỤ (API ENDPOINTS)
// ===========================================

// POST /lecturers/login - Đăng nhập / Auth (hiện tại chủ yếu để tham khảo, auth chính dùng auth.c.js)
export const lecturerLogin = async (req) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return {
      ok: false,
      error: { code: "BAD_REQUEST", message: "Missing username or password" },
    };
  }

  try {
    const lecturer = await lecturerLoginLogic(username, password); // Gọi Core Logic

    if (!lecturer) {
      return {
        ok: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
      };
    }

    return {
      ok: true,
      data: { lecturerId: lecturer.id, token: "JWT_TOKEN_HERE" },
      message: "Login successful",
    };
  } catch (error) {
    console.error("[lecturer] lecturerLogin error:", error);
    return {
      ok: false,
      error: { code: "SERVER_ERROR", message: error.message || "Login error" },
    };
  }
};

// PUT /lecturers/:id/profile - Cập nhật hồ sơ
export const updateProfile = async (req) => {
  const { id } = req.params;
  try {
    const res = await lecturerM.updateProfile(id, req.body);
    if (!res || !res.ok) return res;
    return { ok: true, data: { message: "Update profile successful", lecturer: res.data } };
  } catch (error) {
    console.error("[lecturer] updateProfile error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "System error updating profile",
      },
    };
  }
};

// GET /lecturers/catalog - Tra cứu catalog môn học
export const getCourseCatalog = async () => {
  try {
    const res = await lecturerM.getCourseCatalog();
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] getCourseCatalog error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to get catalog",
      },
    };
  }
};

// GET /lecturers/:id/schedule - Lịch học & nhắc hạn
export const getSchedule = async (req) => {
  const lecturerId = resolveLecturerId(req);
  if (!lecturerId) {
    return {
      ok: false,
      error: { code: "MISSING_LECTURER_ID", message: "Missing lecturer id" },
    };
  }

  try {
    const res = await lecturerM.getSchedule(lecturerId);
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] getSchedule error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to get schedule",
      },
    };
  }
};

// POST /lecturers/materials/:courseId - Tải lên Tài liệu & Bài tập
export const uploadMaterial = async (req) => {
  const { courseId } = req.params;
  try {
    const res = await lecturerM.uploadMaterial(courseId, req.body);
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] uploadMaterial error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to upload material",
      },
    };
  }
};

// GET /lecturers/attendance/:classId - Danh sách sinh viên để điểm danh (dùng DB thật)
export const getAttendanceTemplate = async (req) => {
  const { classId } = req.params || {};
  const dateParam = req.query?.date;
  if (!classId) {
    return {
      ok: false,
      error: { code: "BAD_REQUEST", message: "Missing classId" },
    };
  }

  try {
    const res = await lecturerM.getAttendanceTemplate(classId, dateParam);
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] getAttendanceTemplate error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to get attendance template",
      },
    };
  }
};

// POST /lecturers/attendance/:classId - Ghi nhận điểm danh
export const recordAttendance = async (req) => {
  const { classId } = req.params || {};
  const { studentAttendanceList, date } = req.body || {};

  if (!classId) {
    return {
      ok: false,
      error: { code: "BAD_REQUEST", message: "Missing classId" },
    };
  }

  if (!Array.isArray(studentAttendanceList) || studentAttendanceList.length === 0) {
    return {
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message: "Missing studentAttendanceList",
      },
    };
  }

  try {
    const normalized = studentAttendanceList.map((item) => ({
      studentId: String(item.studentId || ""),
      present: Boolean(item.present),
    }));

    // Delegate to model which persists to DB
    const res = await lecturerM.recordAttendance(classId, normalized, date);
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] recordAttendance error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to record attendance",
      },
    };
  }
};

// POST /lecturers/grades/:courseId/:assignmentId - Chấm điểm & Rubrics
export const submitGrades = async (req) => {
  const { courseId, assignmentId } = req.params;
  const { studentGrades } = req.body || {};

  if (!courseId || !assignmentId) {
    return {
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message: "Missing courseId or assignmentId",
      },
    };
  }

  if (!Array.isArray(studentGrades) || studentGrades.length === 0) {
    return {
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message: "Missing studentGrades",
      },
    };
  }

  try {
    const res = await lecturerM.submitGrades(courseId, assignmentId, studentGrades);
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] submitGrades error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to submit grades",
      },
    };
  }
};

// POST /lecturers/notifications/:courseId - Thông báo & Q&A
export const postNotification = async (req) => {
  const { courseId: courseIdParam } = req.params || {};
  const {
    title,
    message,
    type,
    courseId: bodyCourseId,
    courseName,
  } = req.body || {};

  const courseId = courseIdParam || bodyCourseId || "UNKNOWN";

  const lecturerId = resolveLecturerId(req);
  if (!lecturerId) {
    return {
      ok: false,
      error: { code: "MISSING_LECTURER_ID", message: "Missing lecturer id" },
    };
  }

  if (!title || !message) {
    return {
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message: "Missing title or message",
      },
    };
  }

  try {
    const res = await lecturerM.createAnnouncement(
      courseId,
      lecturerId,
      title,
      message,
      type || "ANNOUNCEMENT",
      courseName || null,
    );

    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] postNotification error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to post notification",
      },
    };
  }
};

// GET /lecturers/:id/announcements - Danh sách thông báo do giảng viên tạo
export const getAnnouncements = async (req) => {
  const lecturerId = resolveLecturerId(req);
  if (!lecturerId) {
    return {
      ok: false,
      error: { code: "MISSING_LECTURER_ID", message: "Missing lecturer id" },
    };
  }

  try {
    const res = await lecturerM.getAnnouncements(lecturerId);
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] getAnnouncements error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to get announcements",
      },
    };
  }
};

// GET /lecturers/:id/analytics - Báo cáo / Analytics cho Lecturer Dashboard
export const getAnalyticsReport = async (req) => {
  const lecturerId = resolveLecturerId(req);
  if (!lecturerId) {
    return {
      ok: false,
      error: { code: "MISSING_LECTURER_ID", message: "Missing lecturer id" },
    };
  }

  try {
    const res = await lecturerM.getAnalytics(lecturerId);
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] getAnalyticsReport error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to get analytics report",
      },
    };
  }
};

// GET /lecturers/:id/tests?courseId=SE101 - Danh sách bài kiểm tra cho 1 môn
export const getTestsForCourse = async (req) => {
  const lecturerId = resolveLecturerId(req);
  if (!lecturerId) {
    return {
      ok: false,
      error: { code: "MISSING_LECTURER_ID", message: "Missing lecturer id" },
    };
  }

  const courseId = req.query?.courseId || req.params?.courseId || "SE101"; // default: SE101

  try {
    const res = await lecturerM.getTestsForCourse(lecturerId, courseId);
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] getTestsForCourse error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to get tests for course",
      },
    };
  }
};

// GET /lecturers/:id/grades?courseId=SE101 - Bảng điểm cho 1 môn
export const getGradesForCourse = async (req) => {
  const lecturerId = resolveLecturerId(req);
  if (!lecturerId) {
    return {
      ok: false,
      error: { code: "MISSING_LECTURER_ID", message: "Missing lecturer id" },
    };
  }

  const courseId = req.query?.courseId || req.params?.courseId || "SE101"; // default: SE101

  try {
    const res = await lecturerM.getGradesForCourse(lecturerId, courseId);
    if (!res || !res.ok) return res;
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("[lecturer] getGradesForCourse error:", error);
    return {
      ok: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message || "Failed to get grades for course",
      },
    };
  }
};
