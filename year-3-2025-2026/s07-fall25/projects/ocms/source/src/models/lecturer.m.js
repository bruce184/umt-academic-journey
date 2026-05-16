 
import { db } from "./db.js";

export default {
  // Basic CRUD (DB-backed)
  all: async () => {
    try {
      const rows = await db("lecturers as l")
        .join("users as u", "u.user_id", "l.user_id")
        .leftJoin("accounts as a", "a.user_id", "u.user_id")
        .select(
          "l.user_id as id",
          "u.full_name as fullName",
          "u.email",
          "u.phone",
          "l.salary",
          "l.specialization",
          "l.employment_type as employmentType",
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
      const row = await db("lecturers as l")
        .join("users as u", "u.user_id", "l.user_id")
        .leftJoin("accounts as a", "a.user_id", "u.user_id")
        .where("l.user_id", id)
        .first()
        .select(
          "l.user_id as id",
          "u.full_name as fullName",
          "u.email",
          "u.phone",
          "u.dob",
          "l.salary",
          "l.specialization",
          "l.employment_type as employmentType",
          "a.user_name as userName"
        );
      if (!row) return { ok: false, error: { code: "NOT_FOUND", message: "Lecturer not found" } };
      return { ok: true, data: row };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  add: async (newLecturer) => {
    try {
      // Expect newLecturer to contain user fields and lecturer fields
      const { full_name, email, phone, dob, department_id, password, user_name, salary, specialization, employment_type } = newLecturer;
      const trxResult = await db.transaction(async (trx) => {
        const userRows = await trx("users").insert({ full_name, email, phone, dob, department_id }).returning(["user_id"]);
        const userId = Array.isArray(userRows) && userRows[0] ? userRows[0].user_id : userRows.user_id;
        await trx("lecturers").insert({ user_id: userId, salary: salary || null, specialization: specialization || null, employment_type: employment_type || null });
        if (user_name && password) {
          await trx("accounts").insert({ user_name, user_id: userId, password, user_role: "LECTURER" });
        }
        return userId;
      });
      return { ok: true, data: { id: trxResult } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  all0fDepartment: async (departmentId) => {
    try {
      const rows = await db("lecturers as l")
        .join("users as u", "u.user_id", "l.user_id")
        .where("u.department_id", departmentId)
        .select("l.user_id as id", "u.full_name as fullName", "u.email", "l.specialization");
      return { ok: true, data: rows };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Auth (DB-backed)
  login: async (username, password) => {
    try {
      const acc = await db("accounts").where({ user_name: username, password }).first();
      if (!acc) return { ok: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" } };
      const lecturer = await db("lecturers as l").join("users as u", "u.user_id", "l.user_id").where("l.user_id", acc.user_id).first().select("l.user_id as id","u.full_name as fullName","u.email");
      return { ok: true, data: { ...lecturer, userName: acc.user_name } };
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

  updateProfile: async (lectureId, profileData) => {
    try {
      // update users and lecturers as applicable
      const userFields = {};
      const lecturerFields = {};
      const allowedUser = ["full_name", "email", "phone", "dob", "department_id"];
      const allowedLecturer = ["salary", "specialization", "employment_type"];
      for (const k of Object.keys(profileData || {})) {
        if (allowedUser.includes(k)) userFields[k] = profileData[k];
        if (allowedLecturer.includes(k)) lecturerFields[k] = profileData[k];
      }
      await db.transaction(async (trx) => {
        if (Object.keys(userFields).length) await trx("users").where({ user_id: lectureId }).update(userFields);
        if (Object.keys(lecturerFields).length) await trx("lecturers").where({ user_id: lectureId }).update(lecturerFields);
      });
      const updated = await db("lecturers as l").join("users as u", "u.user_id", "l.user_id").where("l.user_id", lectureId).first().select("l.user_id as id","u.full_name as fullName","u.email","u.phone","l.salary","l.specialization","l.employment_type as employmentType");
      if (!updated) return { ok: false, error: { code: "NOT_FOUND", message: "Lecturer not found" } };
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

  // Schedule: teaching_assignments -> opening_courses -> courses
  getSchedule: async (lectureId) => {
    try {
      const rows = await db("teaching_assignments as ta")
        .join("opening_courses as oc", "oc.opening_course_code", "ta.opening_course_code")
        .join("courses as c", "c.course_id", "oc.course_id")
        .where("ta.lecturer_id", lectureId)
        .select("oc.opening_course_code as openingCode", "c.course_id as courseId", "c.course_name as courseName", "oc.semester", "oc.academic_year as academicYear", "oc.quantity as capacity")
        .orderBy("oc.opening_course_code", "asc");
      return { ok: true, data: { lecturerId: Number(lectureId), classes: rows } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  uploadMaterial: async (courseId, materialData) => {
    try {
      const createdAt = new Date().toISOString();
      const insert = await db("materials").insert({ course_id: courseId || null, lecturer_id: materialData.lecturerId || null, title: materialData.title || materialData.name || null, url: materialData.url || null, metadata: materialData.metadata || null, created_at: createdAt }).returning(["id", "course_id", "lecturer_id", "title", "url", "metadata", "created_at"]);
      const row = Array.isArray(insert) && insert[0] ? insert[0] : insert;
      return { ok: true, data: { id: row.id, courseId: row.course_id, lecturerId: row.lecturer_id, title: row.title, url: row.url, metadata: row.metadata, createdAt: row.created_at } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Announcements: DB-only
  createAnnouncement: async (courseId, lecturerId, title, content, type = "ANNOUNCEMENT", courseName = null) => {
    if (!title || !content) return { ok: false, error: { code: "BAD_REQUEST", message: "Missing title or content" } };
    try {
      const createdAt = new Date().toISOString();
      const inserted = await db("announcements").insert({ course_id: (typeof courseId === 'number' ? courseId : null), opening_course_code: (typeof courseId === 'string' ? courseId : null), lecturer_id: lecturerId || null, title, content, type, course_name: courseName || null, created_at: createdAt }).returning(["id", "course_id", "opening_course_code", "lecturer_id", "title", "content", "type", "course_name", "created_at"]);
      const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
      return { ok: true, data: { id: row.id, lecturerId: row.lecturer_id, courseId: row.course_id, openingCourseCode: row.opening_course_code, courseName: row.course_name, title: row.title, content: row.content, type: row.type, createdAt: row.created_at } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  getAnnouncements: async (lecturerId) => {
    try {
      const rows = await db("announcements").where({ lecturer_id: lecturerId }).orderBy("created_at", "desc").select("id", "course_id", "opening_course_code", "lecturer_id", "title", "content", "type", "course_name", "created_at");
      return { ok: true, data: rows.map((r) => ({ id: r.id, lecturerId: r.lecturer_id, courseId: r.course_id, openingCourseCode: r.opening_course_code, courseName: r.course_name, title: r.title, content: r.content, createdAt: r.created_at })) };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Attendance template: use enrollments -> students -> users (DB-only)
  getAttendanceTemplate: async (classId, dateParam) => {
    if (!classId) return { ok: false, error: { code: "BAD_REQUEST", message: "Missing classId" } };
    try {
      const date = dateParam || new Date().toISOString().slice(0, 10);
      const rows = await db("enrollments as e").join("students as s", "s.user_id", "e.student_id").join("users as u", "u.user_id", "s.user_id").leftJoin("accounts as a", "a.user_id", "u.user_id").where("e.opening_course_code", classId).andWhere("e.status", "ENROLLED").select("u.user_id as id", "a.user_name as studentCode", "u.full_name as fullName", "e.enrollment_id as enrollmentId").orderBy("u.full_name", "asc");
      const students = rows.map((r) => ({ id: r.id, studentId: r.studentCode || String(r.id), fullName: r.fullName, present: false, enrollmentId: r.enrollmentId }));
      return { ok: true, data: { classId, date, students } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Record attendance: DB-only
  recordAttendance: async (classId, studentAttendanceList, date) => {
    if (!classId) return { ok: false, error: { code: "BAD_REQUEST", message: "Missing classId" } };
    if (!Array.isArray(studentAttendanceList) || studentAttendanceList.length === 0) return { ok: false, error: { code: "BAD_REQUEST", message: "Missing studentAttendanceList" } };
    const attendanceDate = date || new Date().toISOString().slice(0, 10);
    try {
      const toInsert = studentAttendanceList.map((s) => ({ opening_course_code: classId, enrollment_id: s.enrollmentId || null, student_user_id: Number(s.studentId) || null, present: Boolean(s.present), date: attendanceDate, created_at: new Date().toISOString() }));
      await db.transaction(async (trx) => {
        await trx("attendance_records").where({ opening_course_code: classId, date: attendanceDate }).del();
        if (toInsert.length) await trx("attendance_records").insert(toInsert);
      });
      const summary = { classId, date: attendanceDate, total: toInsert.length, presentCount: toInsert.filter((r) => r.present).length, absentCount: toInsert.filter((r) => !r.present).length };
      return { ok: true, data: summary };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Submit grades: write to `gradings` table (upsert)
  submitGrades: async (courseId, assignmentId, studentGrades) => {
    if (!assignmentId) return { ok: false, error: { code: "BAD_REQUEST", message: "Missing assignmentId" } };
    if (!Array.isArray(studentGrades) || studentGrades.length === 0) return { ok: false, error: { code: "BAD_REQUEST", message: "Missing studentGrades" } };
    try {
      const toUpsert = studentGrades.map((g) => ({ assessment_id: Number(assignmentId), enrollment_id: g.enrollmentId || g.enrollment_id || null, grade: g.score != null ? Number(g.score) : null }));
      await db.transaction(async (trx) => {
        for (const row of toUpsert) {
          if (!row.enrollment_id) continue;
          await trx("gradings").insert(row).onConflict(["assessment_id", "enrollment_id"]).merge({ grade: row.grade });
        }
      });
      return { ok: true, data: { message: `Submitted ${toUpsert.length} grade records for assignment ${assignmentId}` } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Tests retrieval -> assessments
  getTestsForCourse: async (lecturerId, courseId) => {
    try {
      let resolvedCourseId = courseId;
      if (isNaN(Number(courseId))) {
        const oc = await db("opening_courses").where({ opening_course_code: courseId }).first();
        if (oc) resolvedCourseId = oc.course_id;
      }
      const rows = await db("assessments").where({ course_id: resolvedCourseId }).select("assessment_id as id", "title", "due_at as dueDate", "ratio as weight").orderBy("due_at", "asc");
      return { ok: true, data: { lecturerId: Number(lecturerId), courseId: resolvedCourseId, tests: rows } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Grades summary for a course: use assessments + gradings + enrollments
  getGradesForCourse: async (lecturerId, courseId) => {
    try {
      let resolvedCourseId = courseId;
      if (isNaN(Number(courseId))) {
        const oc = await db("opening_courses").where({ opening_course_code: courseId }).first();
        if (oc) resolvedCourseId = oc.course_id;
      }
      const tests = await db("assessments").where({ course_id: resolvedCourseId }).select("assessment_id as assessmentId", "title", "ratio");
      const rows = await db("gradings as g").join("enrollments as e", "e.enrollment_id", "g.enrollment_id").join("students as s", "s.user_id", "e.student_id").join("users as u", "u.user_id", "s.user_id").where("e.opening_course_code", courseId).select("u.user_id as studentUserId", "u.full_name as fullName", "g.assessment_id as assessmentId", "g.grade as score").orderBy("u.full_name", "asc");
      const studentsMap = new Map();
      for (const r of rows) {
        const sid = String(r.studentUserId);
        if (!studentsMap.has(sid)) studentsMap.set(sid, { studentId: sid, fullName: r.fullName, grades: [] });
        studentsMap.get(sid).grades.push({ assessmentId: r.assessmentId, score: r.score });
      }
      const students = Array.from(studentsMap.values()).map((s) => {
        let finalScore = 0;
        if (tests && tests.length) {
          const totalRatio = tests.reduce((acc, t) => acc + (Number(t.ratio) || 0), 0) || tests.length;
          let accScore = 0;
          for (const t of tests) {
            const g = s.grades.find((gg) => Number(gg.assessmentId) === Number(t.assessmentId));
            const score = g && g.score != null ? Number(g.score) : 0;
            const ratio = Number(t.ratio) || 0;
            accScore += score * (ratio / (totalRatio || tests.length));
          }
          finalScore = accScore;
        }
        return { ...s, finalScore: Number(finalScore.toFixed(2)) };
      });
      return { ok: true, data: { lecturerId: Number(lecturerId), courseId: resolvedCourseId, tests, students } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Notifications -> write to DB notifications table (no fallback)
  postNotification: async (courseId, message, type = "Announcement") => {
    try {
      let resolvedCourseId = courseId;
      if (isNaN(Number(courseId))) {
        const oc = await db("opening_courses").where({ opening_course_code: courseId }).first();
        if (oc) resolvedCourseId = oc.course_id;
      }
      const createdAt = new Date().toISOString();
      const payload = typeof message === 'object' ? (message.payload || null) : null;
      const text = typeof message === 'object' ? (message.content || '') : (message || '');
      const inserted = await db("notifications").insert({ course_id: resolvedCourseId || null, opening_course_code: (typeof courseId === 'string' ? courseId : null), lecturer_id: message?.lectureId || null, message: text, type: type, payload: payload, created_at: createdAt }).returning(["id", "course_id", "opening_course_code", "lecturer_id", "message", "type", "payload", "created_at"]);
      const row = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
      return { ok: true, data: { notificationId: row.id, courseId: row.course_id, openingCourseCode: row.opening_course_code, lecturerId: row.lecturer_id, message: row.message, type: row.type, createdAt: row.created_at } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },

  // Analytics: DB-only
  getAnalytics: async (lectureId) => {
    try {
      const classes = await db("teaching_assignments as ta").join("opening_courses as oc", "oc.opening_course_code", "ta.opening_course_code").join("courses as c", "c.course_id", "oc.course_id").where("ta.lecturer_id", lectureId).select("oc.opening_course_code as openingCode", "c.course_id as courseId", "c.course_name as courseName");
      if (!classes || classes.length === 0) return { ok: false, error: { code: "NOT_FOUND", message: "No classes found for this lecturer" } };
      const metrics = await Promise.all(classes.map(async (cls) => {
        const countRow = await db("enrollments").where({ opening_course_code: cls.openingCode }).count("enrollment_id as cnt").first();
        return { openingCode: cls.openingCode, courseId: cls.courseId, courseName: cls.courseName, totalStudents: Number(countRow.cnt || 0) };
      }));
      return { ok: true, data: { lectureId: Number(lectureId), summary: { classes: metrics.length }, courseMetrics: metrics } };
    } catch (err) {
      return { ok: false, error: { code: "DB_ERROR", message: String(err) } };
    }
  },
};
