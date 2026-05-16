import { Router } from "express";
import * as studentC from "../controllers/student.c.js";

// Separate routers for web pages and JSON APIs
export const webRouter = Router();
export const apiRouter = Router();

// --- Middleware: ensure req.user exists for student APIs ---
// In a real app you would rely on session/JWT. Here we keep a safe fallback
// using route params or a default ID (1) for development.
const ensureStudentUser = (req, _res, next) => {
  if (!req.user) {
    const fromParams = req.params.student_id;
    const fromBody = req.body?.student_id;
    const fromQuery = req.query?.student_id;
    const id = fromParams || fromBody || fromQuery;

    if (id) {
      req.user = { id, role: "student" };
    } else if (process.env.NODE_ENV === "development") {
      // Only set a default in development; otherwise require authentication upstream
      req.user = { id: 1, role: "student" };
    }
  }
  next();
};

// ========== WEB ROUTES (placeholder views) ==========

// Example: basic placeholder for student dashboard UI
webRouter.get("/", (_req, res) => {
  res.send("Student web interface placeholder");
});

// ========== API ROUTES (JSON) ==========

apiRouter.use(ensureStudentUser);

/**
 * NOTE:
 * Hiện tại FE Student Phase 2 đang gọi REST endpoints dạng:
 *   /students/:studentId/...
 * Trên server, router này được mount ở /students (app.use("/students", ...)).
 *
 * Các route mới dưới đây dùng pattern "/:student_id/..." để khớp với FE.
 */

// ---------------------------------------------------------------------------
// 0. REST-style endpoints cho FE Student (Phase 2)
// ---------------------------------------------------------------------------

// Academics summary (Overview + Academics tab)
apiRouter.get(
  "/:student_id/academics/summary",
  studentC.getAcademicSummary,
);

// Today's schedule for Dashboard
apiRouter.get(
  "/:student_id/today-schedule",
  studentC.getTodaySchedule,
);

// Full schedule (weekly/term) for Timetable page
apiRouter.get("/:student_id/schedule", studentC.mySchedule);

// Announcements (recent)
apiRouter.get(
  "/:student_id/announcements/recent",
  studentC.recentAnnouncements,
);

// E-Forms (student requests)
apiRouter.get("/:student_id/eforms", studentC.listEForms);
apiRouter.post("/:student_id/eforms", studentC.createEForm);

// ---------------------------------------------------------------------------
// 1. Dashboard & schedule (giữ lại các endpoint cũ để tương thích)
// ---------------------------------------------------------------------------

// GET /students/dashboard/:student_id
apiRouter.get("/dashboard/:student_id", studentC.getDashboardSummary);

// GET /students/schedule/:student_id
apiRouter.get("/schedule/:student_id", studentC.mySchedule);

// ---------------------------------------------------------------------------
// 2. Enrollment overview
// ---------------------------------------------------------------------------

// GET /students/enrollment/degree-count
apiRouter.get("/enrollment/degree-count", studentC.numberOfDegree);

// GET /students/enrollment/courses-registered
apiRouter.get(
  "/enrollment/courses-registered",
  studentC.courseRegistered,
);

// ---------------------------------------------------------------------------
// 3. Academics & learning plan
// ---------------------------------------------------------------------------

// GET /students/academics/summary
apiRouter.get("/academics/summary", studentC.getAcademicSummary);

// GET /students/academics/transcript
apiRouter.get("/academics/transcript", studentC.getTranscript);

// GET /students/academics/learning-plan
apiRouter.get(
  "/academics/learning-plan",
  studentC.getLearningPlanProgress,
);

// ---------------------------------------------------------------------------
// 4. Announcements
// ---------------------------------------------------------------------------

// GET /students/announcements/recent
apiRouter.get(
  "/announcements/recent",
  studentC.recentAnnouncements,
);

// ---------------------------------------------------------------------------
// 5. E-Forms (requests)
// ---------------------------------------------------------------------------

// POST /students/requests
apiRouter.post("/requests", studentC.createRequest);

// GET /students/requests
apiRouter.get("/requests", studentC.getRequestHistory);

// GET /students/requests/:request_id
apiRouter.get("/requests/:request_id", studentC.getRequestDetail);

// ---------------------------------------------------------------------------
// 6. COURSE REGISTRATION (REST-style, dùng chung cho FE Registration)
// ---------------------------------------------------------------------------

// GET /students/:student_id/registration/available
// -> DS các lớp/môn còn mở để SV này đăng ký
apiRouter.get(
  "/:student_id/registration/available",
  studentC.getAvailableCoursesForRegistration,
);

// GET /students/:student_id/registration
// -> Các lớp/môn SV hiện đang đăng ký (list id)
apiRouter.get(
  "/:student_id/registration",
  studentC.getCurrentRegistration,
);

// POST /students/:student_id/registration
// Body: { course_ids: number[] }
// -> Lưu lại danh sách đăng ký cho SV
apiRouter.post(
  "/:student_id/registration",
  studentC.saveRegistration,
);

// Keep a default export for backwards compatibility (treated as API router)
export default apiRouter;
