import departmentHeadM from "../models/department-head.m.js";
import { env } from "../config/env.js";

// Helper: lấy ID trưởng khoa từ params/query/body, fallback = 1
const resolveHeadId = (req) => {
  const params = req?.params || {};
  const query = req?.query || {};
  const body = req?.body || {};

  const raw =
    params.id ||
    query.headId ||
    query.head_id ||
    body.headId ||
    body.head_id ||
    (req?.user && req.user.id);

  const parsed = Number(raw);

  if (!raw || Number.isNaN(parsed) || parsed <= 0) {
    // In development allow a safe default for convenience, otherwise signal missing id
    return env.nodeEnv === "development" ? 1 : null;
  }

  return parsed;
};


// ===========================================
// 1. CHỨC NĂNG CƠ BẢN (RENDER VIEWS & CRUD)
// ===========================================

// GET /heads/all (hoặc '/') - Lấy tất cả trưởng khoa (RENDER VIEW)
export const getAllDepartmentHeads = async () => {
  try {
    const res = await departmentHeadM.all();
    if (!res || !res.ok) return res;
    const department_heads = res.data;
    console.log(department_heads);
    return { ok: true, data: { title: "Department Heads List", department_heads } };
  } catch (error) {
    console.error("Error fetching all department heads:", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch department heads" } };
  }
};

// GET /heads/:id - Lấy một trưởng khoa theo ID (RENDER VIEW)
export const getDepartmentHeadById = async (req) => {
  const headId = req.params.id;
  try {
    const res = await departmentHeadM.one(headId);
    if (!res || !res.ok) return res;
    const departmentHead = res.data;
    console.log(departmentHead);
    return { ok: true, data: { title: "Department Head Details", departmentHead } };
  } catch (error) {
    console.error("Failed to fetch department head", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch department head" } };
  }
};

// ===========================================
// 2. CHỨC NĂNG NGHIỆP VỤ (API ENDPOINTS)
// ===========================================

// POST /heads/login - Đăng nhập / Auth
export const headLogin = async (req) => {
  const { username, password } = req.body;
  try {
    const res = await departmentHeadM.login(username, password);
    if (res && res.ok) {
      const head = res.data;
      // Lý tưởng: trả về JWT token
      const result = {
        message: "Login successful",
        headId: head.id,
        token: "JWT_TOKEN_HERE",
      };
      console.log(result);
      return { ok: true, data: result };
    }
    return res;
  } catch (error) {
    console.error("System error in logging in", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "System error during login" } };
  }
};

// PUT /heads/:id/profile - Cập nhật hồ sơ
export const updateProfile = async (req) => {
  const { id } = req.params;
  try {
    const res = await departmentHeadM.updateProfile(id, req.body);
    if (!res || !res.ok) return res;
    const result = {
      message: "Update profile successful",
      head: res.data,
    };
    console.log(result);
    return { ok: true, data: result };
  } catch (error) {
    console.error("System error in updating profile", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "System error updating profile" } };
  }
};

// GET /heads/catalog - Tra cứu catalog môn học
export const getCourseCatalog = async () => {
  try {
    const res = await departmentHeadM.getCourseCatalog();
    if (!res || !res.ok) return res;
    console.log(res.data);
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("System error in getting catalog", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch course catalog" } };
  }
};

// GET /heads/:id/schedule - Lịch học & nhắc hạn
export const getSchedule = async (req) => {
  const { id } = req.params;
  try {
    const res = await departmentHeadM.getSchedule(id);
    if (!res || !res.ok) return res;
    console.log(res.data);
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("System error in getting schedule", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch schedule" } };
  }
};

// GET /heads/rules/:courseId - Kiểm tra tiên quyết / giới hạn tín chỉ
export const getPrerequisiteRules = async (req) => {
  const { courseId } = req.params;
  try {
    const res = await departmentHeadM.getPrerequisiteRules(courseId);
    if (!res || !res.ok) return res;
    console.log(res.data);
    return { ok: true, data: res.data };
  } catch (error) {
    console.error("System error in getting prerequisite rules", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch prerequisite rules" } };
  }
};

// GET /heads/:id/enrollment-requests - Danh sách yêu cầu ghi danh
export const getEnrollmentRequests = async (req) => {
  const headId = resolveHeadId(req);
  if (!headId) return { ok: false, error: { code: "MISSING_HEAD_ID", message: "Missing department head id" } };
  try {
    const headRes = await departmentHeadM.one(headId);
    const departmentId = headRes && headRes.ok && headRes.data ? headRes.data.departmentId : null;
    const res = await departmentHeadM.getEnrollmentRequests(departmentId);
    if (!res.ok) return res;
    const requests = res.data || [];
    const summary = {
      total: requests.length,
      pendingCount: requests.filter((r) => r.status === "Pending").length,
      approvedCount: requests.filter((r) => r.status === "Approved").length,
      rejectedCount: requests.filter((r) => r.status === "Rejected").length,
    };
    return { ok: true, data: { headId, summary, requests } };
  } catch (error) {
    console.error("System error in getting enrollment requests", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch enrollment requests" } };
  }
};

// POST /heads/:id/enrollment/:enrollmentId - Phê duyệt ghi danh (Phase 2)
export const reviewEnrollmentRequest = async (req) => {
  const { id, enrollmentId } = req.params || {};
  const { action, comment } = req.body || {}; // action: 'Approved' | 'Rejected'

  if (action !== "Approved" && action !== "Rejected") {
    console.error("Invalid action for approval:", action);
    return { ok: false, error: { code: "INVALID_ACTION", message: "Invalid action for approval (must be 'Approved' or 'Rejected')" } };
  }

  try {
    const headIdParam = Number(id);
    const headId = headIdParam && headIdParam > 0 ? headIdParam : resolveHeadId(req);
    if (!headId) return { ok: false, error: { code: "MISSING_HEAD_ID", message: "Missing department head id" } };
    const res = await departmentHeadM.reviewEnrollment(enrollmentId, action, headId, comment);
    return res;
  } catch (error) {
    console.error("System error approving enrollment", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to approve enrollment" } };
  }
};

// GET /heads/:id/attendance-summary - Tổng quan điểm danh theo môn (Phase 2)
export const getAttendanceSummary = async (req) => {
  const headId = resolveHeadId(req);
  if (!headId) return { ok: false, error: { code: "MISSING_HEAD_ID", message: "Missing department head id" } };
  const term = (req.query && req.query.term) || "2025-S1";

  try {
    const headRes = await departmentHeadM.one(headId);
    const departmentId = headRes && headRes.ok && headRes.data ? headRes.data.departmentId : null;
    const res = await departmentHeadM.getAttendanceSummary(departmentId, term);
    if (!res.ok) return res;
    return { ok: true, data: { headId, term, ...res.data } };
  } catch (error) {
    console.error("System error in getting attendance summary", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch attendance summary" } };
  }
};

// GET /heads/grades/:courseId/review - Xem xét điểm cuối
export const reviewFinalGrades = async (req) => {
  const { courseId } = req.params;
  try {
    const res = await departmentHeadM.reviewFinalGrades(courseId);
    if (!res || !res.ok) return res;
    const gradesToReview = res.data;
    const gradesIssued = {
      message: `Final grades to approve for course ${courseId}`,
      grades: gradesToReview,
    };
    console.log(gradesIssued);
    return { ok: true, data: gradesIssued };
  } catch (error) {
    console.error("System error in approving grades", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch final grades" } };
  }
};

// POST /heads/:id/announcements - Tạo thông báo khoa (Phase 2)
export const postDepartmentNotification = async (req) => {
  const headId = resolveHeadId(req);
  if (!headId) return { ok: false, error: { code: "MISSING_HEAD_ID", message: "Missing department head id" } };
  const body = req.body || {};
  const { title, message, audience, pinned } = body;

  if (!title || !message) {
    return { ok: false, error: { code: "BAD_REQUEST", message: "Title and message are required" } };
  }

  try {
    const headRes = await departmentHeadM.one(headId);
    const departmentId = headRes && headRes.ok && headRes.data ? headRes.data.departmentId : null;
    const payload = { title: title.trim(), message: message.trim(), audience: audience || "all", pinned: Boolean(pinned), createdBy: headId };
    const res = await departmentHeadM.postDepartmentNotification(departmentId, payload);
    return res;
  } catch (error) {
    console.error("System error in posting department notification", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to post department notification" } };
  }
};

// GET /heads/:id/announcements - Danh sách thông báo khoa (Phase 2)
export const getDepartmentAnnouncements = async (req) => {
  const headId = resolveHeadId(req);
  if (!headId) return { ok: false, error: { code: "MISSING_HEAD_ID", message: "Missing department head id" } };
  const term = (req.query && req.query.term) || "2025-S1";

  try {
    const headRes = await departmentHeadM.one(headId);
    const departmentId = headRes && headRes.ok && headRes.data ? headRes.data.departmentId : null;
    const res = await departmentHeadM.getDepartmentAnnouncements(departmentId, term);
    if (!res.ok) return res;
    const items = res.data || [];
    const summary = {
      total: items.length,
      pinnedCount: items.filter((a) => a.pinned).length,
      forStudents: items.filter((a) => a.audience === "students").length,
      forLecturers: items.filter((a) => a.audience === "lecturers").length,
      forAll: items.filter((a) => a.audience === "all").length,
    };

    return { ok: true, data: { headId, term, summary, items } };
  } catch (error) {
    console.error("System error in getting department announcements", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch department announcements" } };
  }
};

// GET /heads/:id/final-grades - Tổng quan điểm số theo môn (Phase 2)
export const getFinalGradesOverview = async (req) => {
  const headId = resolveHeadId(req);
  if (!headId) return { ok: false, error: { code: "MISSING_HEAD_ID", message: "Missing department head id" } };
  const term = (req.query && req.query.term) || "2025-S1";

  try {
    const headRes = await departmentHeadM.one(headId);
    const departmentId = headRes && headRes.ok && headRes.data ? headRes.data.departmentId : null;
    const res = await departmentHeadM.getFinalGradesOverview(departmentId, term);
    if (!res.ok) return res;
    const items = res.data || [];
    const totalCourses = items.length;
    const avgScoreOverall = totalCourses > 0 ? Number((items.reduce((sum, c) => sum + (c.avgScore || 0), 0) / totalCourses).toFixed(2)) : null;
    const avgPassRateOverall = totalCourses > 0 ? Number((items.reduce((sum, c) => sum + (c.passRate || 0), 0) / totalCourses).toFixed(2)) : null;
    const summary = { totalCourses, avgScoreOverall, avgPassRateOverall };
    return { ok: true, data: { headId, term, summary, items } };
  } catch (error) {
    console.error("System error in getting final grades overview", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to fetch final grades overview" } };
  }
};

// GET /heads/:id/analytics - Báo cáo tổng quan Khoa
export const getAnalyticsReport = async (req) => {
  const headId = resolveHeadId(req);
  if (!headId) return { ok: false, error: { code: "MISSING_HEAD_ID", message: "Missing department head id" } };

  try {
    const res = await departmentHeadM.getAnalytics(headId);
    return res;
  } catch (error) {
    console.error("Error building department head analytics:", error);
    return { ok: false, error: { code: "SERVER_ERROR", message: "Failed to build analytics report for department head" } };
  }
};

