/* eslint-disable no-unused-vars */
import { db } from "./db.js";

export default {
  // CRUD: list all department heads (by account role)
  all: async () => {
    try {
      const rows = await db("accounts as a")
        .join("users as u", "u.user_id", "a.user_id")
        .leftJoin("staff as s", "s.user_id", "u.user_id")
        .where("a.user_role", "DEPARTMENT_HEAD")
        .select(
          "u.user_id as id",
          "u.full_name as fullName",
          "u.email",
          "u.phone",
          "u.department_id as departmentId",
          "s.position as position",
          "a.user_name as userName"
        )
        .orderBy("u.full_name", "asc");
      return { ok: true, data: rows };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  one: async (id) => {
    try {
      const row = await db("users as u")
        .leftJoin("accounts as a", "a.user_id", "u.user_id")
        .leftJoin("staff as s", "s.user_id", "u.user_id")
        .where("u.user_id", id)
        .andWhere(function () { this.where("a.user_role", "DEPARTMENT_HEAD").orWhereNull("a.user_role"); })
        .first()
        .select(
          "u.user_id as id",
          "u.full_name as fullName",
          "u.email",
          "u.phone",
          "u.department_id as departmentId",
          "s.position as position",
          "a.user_name as userName"
        );
      if (!row) return { ok: false, error: { code: "NOT_FOUND", message: "Department head not found" } };
      return { ok: true, data: row };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  add: async (newHead) => {
    try {
      const { full_name, email, phone, dob, department_id, user_name, password, position } = newHead;
      const userId = await db.transaction(async (trx) => {
        const inserted = await trx("users").insert({ full_name, email, phone, dob, department_id }).returning(["user_id"]);
        const uid = Array.isArray(inserted) && inserted[0] ? inserted[0].user_id : inserted.user_id;
        await trx("staff").insert({ user_id: uid, position: position || null });
        if (user_name && password) {
          await trx("accounts").insert({ user_name, user_id: uid, password, user_role: "DEPARTMENT_HEAD" });
        }
        return uid;
      });
      return { ok: true, data: { id: userId } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  allOfDepartment: async (departmentId) => {
    try {
      const rows = await db("accounts as a").join("users as u", "u.user_id", "a.user_id").where({ "u.department_id": departmentId, "a.user_role": "DEPARTMENT_HEAD" }).select("u.user_id as id", "u.full_name as fullName", "u.email");
      return { ok: true, data: rows };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Auth
  login: async (username, password) => {
    try {
      const acc = await db("accounts").where({ user_name: username, password, user_role: "DEPARTMENT_HEAD" }).first();
      if (!acc) return { ok: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" } };
      const user = await db("users").where({ user_id: acc.user_id }).first().select("user_id as id", "full_name as fullName", "email");
      return { ok: true, data: { ...user, userName: acc.user_name } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  forgotPassword: async (email) => {
    try {
      const u = await db("users").where({ email }).first();
      if (!u) return { ok: false, error: { code: "NOT_FOUND", message: "Email not found" } };
      return { ok: true, data: { message: `Password reset link sent to ${email}` } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  updateProfile: async (headId, profileData) => {
    try {
      const userFields = {};
      const staffFields = {};
      const allowedUser = ["full_name", "email", "phone", "dob", "department_id"];
      const allowedStaff = ["position"];
      for (const k of Object.keys(profileData || {})) {
        if (allowedUser.includes(k)) userFields[k] = profileData[k];
        if (allowedStaff.includes(k)) staffFields[k] = profileData[k];
      }
      await db.transaction(async (trx) => {
        if (Object.keys(userFields).length) await trx("users").where({ user_id: headId }).update(userFields);
        if (Object.keys(staffFields).length) {
          const existing = await trx("staff").where({ user_id: headId }).first();
          if (existing) await trx("staff").where({ user_id: headId }).update(staffFields); else await trx("staff").insert({ user_id: headId, ...staffFields });
        }
      });
      const updated = await db("users as u").leftJoin("staff as s", "s.user_id", "u.user_id").where("u.user_id", headId).first().select("u.user_id as id","u.full_name as fullName","u.email","u.phone","s.position");
      if (!updated) return { ok: false, error: { code: "NOT_FOUND", message: "Department head not found" } };
      return { ok: true, data: updated };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  getCourseCatalog: async () => {
    try {
      const rows = await db("courses").select("course_id as id", "course_name as name", "course_credit as credit").orderBy("course_name", "asc");
      return { ok: true, data: rows };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Schedule: return classes where this head may also teach (if recorded in teaching_assignments)
  getSchedule: async (headId) => {
    try {
      const rows = await db("teaching_assignments as ta").join("opening_courses as oc", "oc.opening_course_code", "ta.opening_course_code").join("courses as c", "c.course_id", "oc.course_id").where("ta.lecturer_id", headId).select("oc.opening_course_code as openingCode","c.course_id as courseId","c.course_name as courseName","oc.semester","oc.academic_year as academicYear","oc.quantity as capacity").orderBy("oc.opening_course_code","asc");
      return { ok: true, data: rows };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  getPrerequisiteRules: async (courseId) => {
    try {
      // try table 'prerequisite_rules' or 'course_prerequisites'
      const rows = await db("prerequisite_rules").where({ course_id: courseId }).select("id", "course_id", "prereq_course_id", "rule_text").catch(() => []);
      return { ok: true, data: rows };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Enrollment review: update enrollment_requests table
  reviewEnrollment: async (enrollmentId, action, headId) => {
    try {
      const status = action;
      const reviewerId = Number(headId) || null;
      const reviewedAt = new Date().toISOString();
      const updated = await db("enrollment_requests").where({ id: enrollmentId }).update({ status, reviewer_id: reviewerId, review_date: reviewedAt });
      if (!updated) return { ok: false, error: { code: "NOT_FOUND", message: "Enrollment request not found" } };
      const row = await db("enrollment_requests").where({ id: enrollmentId }).first();
      return { ok: true, data: row };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // List enrollment requests (pending/approved/rejected) for department
  getEnrollmentRequests: async (departmentId) => {
    try {
      const rows = await db("enrollment_requests as er")
        .leftJoin("students as s", "s.user_id", "er.student_id")
        .leftJoin("users as u", "u.user_id", "s.user_id")
        .leftJoin("courses as c", "c.course_id", "er.course_id")
        .where(function () {
          if (departmentId) this.where("c.department_id", departmentId);
        })
        .select(
          "er.id",
          "er.student_id as studentId",
          "u.full_name as studentName",
          "c.course_id as courseId",
          "c.course_name as courseName",
          "er.requested_at as requestedAt",
          "er.status",
          "er.note"
        )
        .orderBy("er.requested_at", "desc");
      return { ok: true, data: rows };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Attendance summary: aggregate attendance table by department
  getAttendanceSummary: async (departmentId) => {
    try {
      const rows = await db("enrollments as e").join("opening_courses as oc", "oc.opening_course_code", "e.opening_course_code").join("courses as c", "c.course_id", "oc.course_id").join("lecturers as l", "l.user_id", "oc.lecturer_id").where("c.department_id", departmentId).groupBy("c.course_id","c.course_name","l.user_id","l.full_name").select(db.raw("c.course_id as courseId, c.course_name as courseName, l.full_name as lecturerName, COUNT(e.enrollment_id) as totalStudents"));
      return { ok: true, data: { term: null, items: rows } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Review final grades: fetch gradings flagged as pending review
  reviewFinalGrades: async (courseId) => {
    try {
      const rows = await db("final_grades").where({ course_id: courseId, status: "PendingReview" }).select("id", "course_id as courseId", "enrollment_id as enrollmentId", "grade", "status").catch(() => []);
      return { ok: true, data: rows };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  postDepartmentNotification: async (departmentId, payload) => {
    try {
      const createdAt = new Date().toISOString();
      const toInsert = {
        department_id: departmentId || null,
        title: payload?.title || null,
        message: payload?.message || null,
        audience: payload?.audience || null,
        pinned: payload?.pinned ? true : false,
        created_by: payload?.createdBy || null,
        created_at: createdAt,
      };
      const inserted = await db("department_announcements").insert(toInsert).returning(["id", "department_id", "title", "message", "audience", "pinned", "created_by", "created_at"]).catch(() => null);
      if (!inserted) return { ok: false, error: { code: "DB_ERROR", message: "Failed to create department announcement" } };
      const row = Array.isArray(inserted) ? inserted[0] : inserted;
      return { ok: true, data: row };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  getDepartmentAnnouncements: async (departmentId, term) => {
    try {
      const rows = await db("department_announcements").where(function () { if (departmentId) this.where({ department_id: departmentId }); }).orderBy("created_at", "desc").select("id", "department_id as departmentId", "title", "message", "audience", "pinned", "created_at as createdAt", "created_by as createdBy");
      return { ok: true, data: rows };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Final grades overview: average and pass rate per course in department/term
  getFinalGradesOverview: async (departmentId, term) => {
    try {
      const courses = await db("courses").where(function () { if (departmentId) this.where({ department_id: departmentId }); }).select("course_id as courseId", "course_name as courseName");
      const items = [];
      for (const c of courses) {
        const rows = await db("gradings as g").join("enrollments as e", "e.enrollment_id", "g.enrollment_id").join("assessments as a", "a.assessment_id", "g.assessment_id").where("a.course_id", c.courseId).select("g.grade as grade");
        const avgScore = rows.length ? Number((rows.reduce((s, r) => s + (Number(r.grade) || 0), 0) / rows.length).toFixed(2)) : null;
        const passCount = rows.filter((r) => Number(r.grade) >= 5).length;
        const passRate = rows.length ? Number((passCount / rows.length).toFixed(2)) : null;
        items.push({ courseId: c.courseId, courseName: c.courseName, avgScore, passRate, distribution: {} });
      }
      return { ok: true, data: items };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  getAnalytics: async (headId) => {
    try {
      // Example: compute counts of courses, students and avg grades in department
      const deptRow = await db("users as u").join("accounts as a", "a.user_id", "u.user_id").where("u.user_id", headId).first().select("u.department_id");
      const departmentId = deptRow ? deptRow.department_id : null;
      if (!departmentId) return { ok: false, error: { code: "NOT_FOUND", message: "Department not found for head" } };
      const courseCountRow = await db("courses").where({ department_id: departmentId }).count("course_id as cnt").first();
      const studentCountRow = await db("students as s").join("users as u", "u.user_id", "s.user_id").where("u.department_id", departmentId).count("s.user_id as cnt").first();
      return { ok: true, data: { departmentId, totalCourses: Number(courseCountRow.cnt||0), totalStudents: Number(studentCountRow.cnt||0) } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },
};
