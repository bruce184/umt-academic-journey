const asyncHandler = require('express-async-handler');
const { getPool, sql } = require('../config/database');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = asyncHandler(async (req, res) => {
  const pool = getPool();
  
  const result = await pool.request()
    .query(`
      SELECT course_code, course_name, credit, course_type
      FROM courses
      ORDER BY course_code
    `);

  res.json({
    success: true,
    count: result.recordset.length,
    data: result.recordset
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = asyncHandler(async (req, res) => {
  const pool = getPool();
  
  const result = await pool.request()
    .input('courseCode', sql.VarChar(10), req.params.id)
    .query(`
      SELECT course_code, course_name, credit, course_type
      FROM courses
      WHERE course_code = @courseCode
    `);

  if (result.recordset.length === 0) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json({
    success: true,
    data: result.recordset[0]
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
  const { courseCode, courseName, credit, courseType } = req.body;

  if (!courseCode || !courseName || !credit || !courseType) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (!['L', 'P', 'T'].includes(courseType)) {
    res.status(400);
    throw new Error('Course type must be L, P, or T');
  }

  const pool = getPool();

  // Check if course already exists
  const existingCourse = await pool.request()
    .input('courseCode', sql.VarChar(10), courseCode)
    .query('SELECT course_code FROM courses WHERE course_code = @courseCode');

  if (existingCourse.recordset.length > 0) {
    res.status(400);
    throw new Error('Course already exists');
  }

  await pool.request()
    .input('courseCode', sql.VarChar(10), courseCode)
    .input('courseName', sql.VarChar(100), courseName)
    .input('credit', sql.Int, credit)
    .input('courseType', sql.Char(1), courseType)
    .query(`
      INSERT INTO courses (course_code, course_name, credit, course_type)
      VALUES (@courseCode, @courseName, @credit, @courseType)
    `);

  res.status(201).json({
    success: true,
    message: 'Course created successfully'
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
  const { courseName, credit, courseType } = req.body;
  const courseCode = req.params.id;

  const pool = getPool();

  // Check if course exists
  const existingCourse = await pool.request()
    .input('courseCode', sql.VarChar(10), courseCode)
    .query('SELECT course_code FROM courses WHERE course_code = @courseCode');

  if (existingCourse.recordset.length === 0) {
    res.status(404);
    throw new Error('Course not found');
  }

  await pool.request()
    .input('courseCode', sql.VarChar(10), courseCode)
    .input('courseName', sql.VarChar(100), courseName)
    .input('credit', sql.Int, credit)
    .input('courseType', sql.Char(1), courseType)
    .query(`
      UPDATE courses 
      SET course_name = @courseName, credit = @credit, course_type = @courseType
      WHERE course_code = @courseCode
    `);

  res.json({
    success: true,
    message: 'Course updated successfully'
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const courseCode = req.params.id;
  const pool = getPool();

  // Check if course exists
  const existingCourse = await pool.request()
    .input('courseCode', sql.VarChar(10), courseCode)
    .query('SELECT course_code FROM courses WHERE course_code = @courseCode');

  if (existingCourse.recordset.length === 0) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if course is used in classes
  const usedInClasses = await pool.request()
    .input('courseCode', sql.VarChar(10), courseCode)
    .query('SELECT class_id FROM classes WHERE course_code = @courseCode');

  if (usedInClasses.recordset.length > 0) {
    res.status(400);
    throw new Error('Cannot delete course that is used in classes');
  }

  await pool.request()
    .input('courseCode', sql.VarChar(10), courseCode)
    .query('DELETE FROM courses WHERE course_code = @courseCode');

  res.json({
    success: true,
    message: 'Course deleted successfully'
  });
});

// @desc    Get classes for a course
// @route   GET /api/courses/:id/classes
// @access  Private
const getCourseClasses = asyncHandler(async (req, res) => {
  const courseCode = req.params.id;
  const pool = getPool();

  const result = await pool.request()
    .input('courseCode', sql.VarChar(10), courseCode)
    .query(`
      SELECT c.class_id, c.capacity, c.current_enrollment,
             s.semester_code, s.year
      FROM classes c
      JOIN semesters s ON c.semester_code = s.semester_code AND c.year = s.year
      WHERE c.course_code = @courseCode
      ORDER BY s.year DESC, s.semester_code
    `);

  res.json({
    success: true,
    count: result.recordset.length,
    data: result.recordset
  });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseClasses
}; 