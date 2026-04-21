const asyncHandler = require('express-async-handler');
const { getPool, sql } = require('../config/database');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
  const pool = getPool();
  
  const result = await pool.request()
    .query(`
      SELECT u.user_id, u.username, u.full_name, u.email, u.phone_number,
             u.date_of_birth, u.address, u.created_at
      FROM users u
      JOIN students s ON u.user_id = s.student_id
      ORDER BY u.full_name
    `);

  res.json({
    success: true,
    count: result.recordset.length,
    data: result.recordset
  });
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = asyncHandler(async (req, res) => {
  const pool = getPool();
  
  const result = await pool.request()
    .input('studentId', sql.VarChar(10), req.params.id)
    .query(`
      SELECT u.user_id, u.username, u.full_name, u.email, u.phone_number,
             u.date_of_birth, u.address, u.created_at
      FROM users u
      JOIN students s ON u.user_id = s.student_id
      WHERE u.user_id = @studentId
    `);

  if (result.recordset.length === 0) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.json({
    success: true,
    data: result.recordset[0]
  });
});

// @desc    Get student enrollments
// @route   GET /api/students/:id/enrollments
// @access  Private
const getStudentEnrollments = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  const pool = getPool();

  const result = await pool.request()
    .input('studentId', sql.VarChar(10), studentId)
    .query(`
      SELECT e.class_id, e.enrolled_at, e.grade, e.status,
             c.course_code, co.course_name, co.credit,
             s.semester_code, s.year
      FROM enrollments e
      JOIN classes c ON e.class_id = c.class_id
      JOIN courses co ON c.course_code = co.course_code
      JOIN semesters s ON c.semester_code = s.semester_code AND c.year = s.year
      WHERE e.student_id = @studentId
      ORDER BY s.year DESC, s.semester_code
    `);

  res.json({
    success: true,
    count: result.recordset.length,
    data: result.recordset
  });
});

// @desc    Get student attendance
// @route   GET /api/students/:id/attendance
// @access  Private
const getStudentAttendance = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  const pool = getPool();

  const result = await pool.request()
    .input('studentId', sql.VarChar(10), studentId)
    .query(`
      SELECT ar.attendance_date, ar.status, ar.recorded_at,
             s.room, s.time_slot,
             c.class_id, co.course_name
      FROM attendance_records ar
      JOIN schedules s ON ar.schedule_id = s.schedule_id
      JOIN classes c ON s.class_id = c.class_id
      JOIN courses co ON c.course_code = co.course_code
      WHERE ar.student_id = @studentId
      ORDER BY ar.attendance_date DESC
    `);

  res.json({
    success: true,
    count: result.recordset.length,
    data: result.recordset
  });
});

// @desc    Get student schedule
// @route   GET /api/students/:id/schedule
// @access  Private
const getStudentSchedule = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  const pool = getPool();

  const result = await pool.request()
    .input('studentId', sql.VarChar(10), studentId)
    .query(`
      SELECT s.schedule_id, s.room, s.time_slot,
             c.class_id, co.course_name, co.course_code,
             sem.semester_code, sem.year
      FROM enrollments e
      JOIN classes c ON e.class_id = c.class_id
      JOIN courses co ON c.course_code = co.course_code
      JOIN schedules s ON c.class_id = s.class_id
      JOIN semesters sem ON c.semester_code = sem.semester_code AND c.year = sem.year
      WHERE e.student_id = @studentId AND e.status = 'enrolled'
      ORDER BY s.time_slot
    `);

  res.json({
    success: true,
    count: result.recordset.length,
    data: result.recordset
  });
});

// @desc    Get student assignments
// @route   GET /api/students/:id/assignments
// @access  Private
const getStudentAssignments = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  const pool = getPool();

  const result = await pool.request()
    .input('studentId', sql.VarChar(10), studentId)
    .query(`
      SELECT a.assignment_id, a.title, a.description, a.due_date, a.max_score,
             c.class_id, co.course_name,
             sub.submitted_at, sub.score, sub.content
      FROM enrollments e
      JOIN classes c ON e.class_id = c.class_id
      JOIN courses co ON c.course_code = co.course_code
      JOIN assignments a ON c.class_id = a.class_id
      LEFT JOIN submissions sub ON a.assignment_id = sub.assignment_id AND e.student_id = sub.student_id
      WHERE e.student_id = @studentId AND e.status = 'enrolled'
      ORDER BY a.due_date DESC
    `);

  res.json({
    success: true,
    count: result.recordset.length,
    data: result.recordset
  });
});

// @desc    Get student tuition payments
// @route   GET /api/students/:id/tuition
// @access  Private
const getStudentTuition = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  const pool = getPool();

  const result = await pool.request()
    .input('studentId', sql.VarChar(10), studentId)
    .query(`
      SELECT payment_id, semester_code, year, amount, 
             payment_date, payment_method, status, receipt_number
      FROM tuition_payments
      WHERE student_id = @studentId
      ORDER BY payment_date DESC
    `);

  res.json({
    success: true,
    count: result.recordset.length,
    data: result.recordset
  });
});

module.exports = {
  getStudents,
  getStudent,
  getStudentEnrollments,
  getStudentAttendance,
  getStudentSchedule,
  getStudentAssignments,
  getStudentTuition
}; 