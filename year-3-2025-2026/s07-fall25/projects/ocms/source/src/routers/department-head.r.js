import express from "express";
import {
  getAllDepartmentHeads,
  getDepartmentHeadById,
  headLogin,
  updateProfile,
  getCourseCatalog,
  getSchedule,
  getPrerequisiteRules,
  getEnrollmentRequests,
  reviewEnrollmentRequest,
  getAttendanceSummary,
  reviewFinalGrades,
  postDepartmentNotification,
  getAnalyticsReport,
  getFinalGradesOverview,
  getDepartmentAnnouncements,
} from "../controllers/department-head.c.js";
import { sendOk, sendError } from "../controllers/response-util.js";


// Separate routers for web pages and JSON APIs
export const webRouter = express.Router();
export const apiRouter = express.Router();

// Helper to standardize API responses using centralized response-util
const sendResponse = (res, result, _successMessage = "", failStatus = 500) => {
  void _successMessage; // intentionally unused placeholder for future message handling
  if (result && result.ok) {
    return sendOk(res, result.data);
  }

  const errPayload = result && (result.error || result.message) ? (result.error || result.message) : "An error occurred";
  const code = typeof errPayload === "object" && errPayload.code ? errPayload.code : "ERROR";
  const message = typeof errPayload === "object" && errPayload.message ? errPayload.message : String(errPayload);
  return sendError(res, failStatus, code, message);
};

// ========== 1. WEB ROUTES (render views – optional) ==========

// Example: list department heads in HTML
webRouter.get("/", async (req, res) => {
  try {
    const result = await getAllDepartmentHeads(req);
    if (result && result.ok) {
      res.render("department-head/list", result.data);
    } else {
      res.render("error", { message: result && (result.error || result.message) });
    }
  } catch (err) {
    res.render("error", { message: err.message || "Unexpected error" });
  }
});

// Example: department head detail page
webRouter.get("/:id", async (req, res) => {
  try {
    const result = await getDepartmentHeadById(req);
    if (result && result.ok) {
      res.render("department-head/detail", result.data);
    } else {
      res.render("error", { message: result && (result.error || result.message) });
    }
  } catch (err) {
    res.render("error", { message: err.message || "Unexpected error" });
  }
});

// ========== 2. API ROUTES (JSON under /api/department-head) ==========

// Get all department heads
apiRouter.get("/all", async (req, res) => {
  const result = await getAllDepartmentHeads(req);
  sendResponse(res, result, "Fetched all department heads successfully");
});

// Get one department head by ID
apiRouter.get("/:id", async (req, res) => {
  const result = await getDepartmentHeadById(req);
  sendResponse(
    res,
    result,
    "Fetched department head details successfully",
    404
  );
});

// Department head login
apiRouter.post("/login", async (req, res) => {
  const result = await headLogin(req);
  sendResponse(res, result, "Login successful", 401);
});

// Update profile
apiRouter.put("/:id/profile", async (req, res) => {
  const result = await updateProfile(req);
  sendResponse(res, result, "Profile updated successfully", 400);
});

// Course catalog
apiRouter.get("/catalog", async (req, res) => {
  const result = await getCourseCatalog(req);
  sendResponse(res, result, "Course catalog fetched successfully");
});

// Schedule
apiRouter.get("/:id/schedule", async (req, res) => {
  const result = await getSchedule(req);
  sendResponse(res, result, "Schedule fetched successfully");
});

// Prerequisite rules
apiRouter.get("/rules/:courseId", async (req, res) => {
  const result = await getPrerequisiteRules(req);
  sendResponse(res, result, "Prerequisite rules fetched successfully");
});

// Enrollment requests list (pending/approved/rejected)
apiRouter.get("/:id/enrollment-requests", async (req, res) => {
  const result = await getEnrollmentRequests(req);
  sendResponse(res, result, "Enrollment requests fetched successfully");
});

// Review a specific enrollment request
apiRouter.post("/:id/enrollment/:enrollmentId", async (req, res) => {
  const result = await reviewEnrollmentRequest(req);
  sendResponse(res, result, "Enrollment request reviewed successfully", 400);
});

// Attendance summary
apiRouter.get("/:id/attendance-summary", async (req, res) => {
  const result = await getAttendanceSummary(req);
  sendResponse(res, result, "Attendance summary fetched successfully");
});

// Review final grades
apiRouter.get("/grades/:courseId/review", async (req, res) => {
  const result = await reviewFinalGrades(req);
  sendResponse(res, result, "Final grades reviewed successfully");
});

// Grades overview for department head
apiRouter.get("/:id/final-grades", async (req, res) => {
  const result = await getFinalGradesOverview(req);
  sendResponse(res, result, "Final grades overview fetched successfully");
});

// Post department notifications
apiRouter.post("/notifications", async (req, res) => {
  const result = await postDepartmentNotification(req);
  sendResponse(res, result, "Notification posted successfully");
});

// Get department announcements (Dept-head view)
apiRouter.get("/:id/announcements", async (req, res) => {
  const result = await getDepartmentAnnouncements(req);
  sendResponse(res, result, "Announcements fetched successfully");
});

// Post a new department announcement
apiRouter.post("/:id/announcements", async (req, res) => {
  const result = await postDepartmentNotification(req);
  sendResponse(res, result, "Notification posted successfully", 400);
});

// Get analytics report
apiRouter.get("/:id/analytics", async (req, res) => {
  const result = await getAnalyticsReport(req);
  sendResponse(res, result, "Analytics report fetched successfully");
});

// Default export for backwards compatibility (treated as API router)
export default apiRouter;
