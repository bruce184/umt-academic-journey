import express from "express";
import {
  getAllLecturers,
  getLecturerById,
  lecturerLogin,
  updateProfile,
  getCourseCatalog,
  getSchedule,
  uploadMaterial,
  getAttendanceTemplate,
  recordAttendance,
  submitGrades,
  postNotification,
  getAnnouncements,
  getAnalyticsReport,
  getTestsForCourse,      
  getGradesForCourse,     
} from "../controllers/lecturer.c.js";
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

  // Normalize error payloads that may be string or object
  const errPayload = result && (result.error || result.message) ? (result.error || result.message) : "An error occurred";
  const code = typeof errPayload === "object" && errPayload.code ? errPayload.code : "ERROR";
  const message = typeof errPayload === "object" && errPayload.message ? errPayload.message : String(errPayload);
  return sendError(res, failStatus, code, message);
};

// ========== 1. WEB ROUTES (render views – optional) ==========

// Example: list lecturers in HTML
webRouter.get("/", async (req, res) => {
  try {
    const result = await getAllLecturers(req);
    if (result && result.ok) {
      res.render("lecturers/list", result.data);
    } else {
      res.render("error", { message: result && (result.error || result.message) });
    }
  } catch (err) {
    res.render("error", { message: err.message || "Unexpected error" });
  }
});

// Example: lecturer detail page
webRouter.get("/:id", async (req, res) => {
  try {
    const result = await getLecturerById(req);
    if (result && result.ok) {
      res.render("lecturers/detail", result.data);
    } else {
      res.render("error", { message: result && (result.error || result.message) });
    }
  } catch (err) {
    res.render("error", { message: err.message || "Unexpected error" });
  }
});

// ========== 2. API ROUTES (JSON under /api/lecturer) ==========

// Get all lecturers
apiRouter.get("/all", async (req, res) => {
  const result = await getAllLecturers(req);
  sendResponse(res, result, "Fetched all lecturers successfully");
});

// Get one lecturer by ID
apiRouter.get("/:id", async (req, res) => {
  const result = await getLecturerById(req);
  sendResponse(res, result, "Fetched lecturer details successfully", 404);
});

// Lecturer login
apiRouter.post("/login", async (req, res) => {
  const result = await lecturerLogin(req);
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

// Upload material
apiRouter.post("/materials/:courseId", async (req, res) => {
  const result = await uploadMaterial(req);
  sendResponse(res, result, "Material uploaded successfully");
});

// Get attendance template (students of a class for a date)
apiRouter.get("/attendance/:classId", async (req, res) => {
  const result = await getAttendanceTemplate(req);
  sendResponse(res, result, "Attendance template fetched successfully");
});

// Record attendance
apiRouter.post("/attendance/:classId", async (req, res) => {
  const result = await recordAttendance(req);
  sendResponse(res, result, "Attendance recorded successfully");
});


// Submit grades
apiRouter.post("/grades/:courseId/:assignmentId", async (req, res) => {
  const result = await submitGrades(req);
  sendResponse(res, result, "Grades submitted successfully");
});

// Post notification
apiRouter.post("/notifications/:courseId", async (req, res) => {
  const result = await postNotification(req);
  sendResponse(res, result, "Notification posted successfully");
});

// Announcements created by lecturer
apiRouter.get("/:id/announcements", async (req, res) => {
  const result = await getAnnouncements(req);
  sendResponse(res, result, "Announcements fetched successfully");
});

// Analytics report
apiRouter.get("/:id/analytics", async (req, res) => {
  const result = await getAnalyticsReport(req);
  sendResponse(res, result, "Analytics report fetched successfully");
});

// Tests for a course (Lecturer view)
apiRouter.get("/:id/tests", async (req, res) => {
  const result = await getTestsForCourse(req);
  sendResponse(res, result, "Tests fetched successfully");
});

// Grades for a course (Lecturer view)
apiRouter.get("/:id/grades", async (req, res) => {
  const result = await getGradesForCourse(req);
  sendResponse(res, result, "Grades fetched successfully");
});


// Default export for backwards compatibility (treated as API router)
export default apiRouter;
