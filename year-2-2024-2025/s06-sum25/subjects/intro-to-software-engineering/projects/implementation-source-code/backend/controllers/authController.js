const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { getPool, sql } = require('../config/database');

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    res.status(400);
    throw new Error('Please provide username and password');
  }

  const pool = getPool();

  // Check for user
  const result = await pool.request()
    .input('username', sql.VarChar(50), username)
    .query(`
      SELECT u.user_id, u.username, u.password_hash, u.full_name, u.role, u.email
      FROM users u
      WHERE u.username = @username
    `);

  if (result.recordset.length === 0) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const user = result.recordset[0];

  // Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Create token
  const token = jwt.sign(
    { userId: user.user_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({
    success: true,
    token,
    user: {
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      email: user.email
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const pool = getPool();
  
  const result = await pool.request()
    .input('userId', sql.VarChar(10), req.user.user_id)
    .query(`
      SELECT u.user_id, u.username, u.full_name, u.role, u.email, 
             u.date_of_birth, u.address, u.phone_number, u.created_at
      FROM users u
      WHERE u.user_id = @userId
    `);

  if (result.recordset.length === 0) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: result.recordset[0]
  });
});

// @desc    Register new user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
const register = asyncHandler(async (req, res) => {
  const { 
    userId, username, password, fullName, role, 
    email, dateOfBirth, address, phoneNumber 
  } = req.body;

  // Validate required fields
  if (!userId || !username || !password || !fullName || !role) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Validate role
  if (!['student', 'lecturer', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const pool = getPool();

  // Check if user already exists
  const existingUser = await pool.request()
    .input('userId', sql.VarChar(10), userId)
    .input('username', sql.VarChar(50), username)
    .query(`
      SELECT user_id FROM users 
      WHERE user_id = @userId OR username = @username
    `);

  if (existingUser.recordset.length > 0) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user
  await pool.request()
    .input('userId', sql.VarChar(10), userId)
    .input('username', sql.VarChar(50), username)
    .input('passwordHash', sql.VarChar(255), hashedPassword)
    .input('fullName', sql.VarChar(100), fullName)
    .input('role', sql.VarChar(20), role)
    .input('email', sql.VarChar(255), email || null)
    .input('dateOfBirth', sql.Date, dateOfBirth || null)
    .input('address', sql.VarChar(255), address || null)
    .input('phoneNumber', sql.VarChar(15), phoneNumber || null)
    .query(`
      INSERT INTO users (user_id, username, password_hash, full_name, role, 
                        email, date_of_birth, address, phone_number)
      VALUES (@userId, @username, @passwordHash, @fullName, @role, 
              @email, @dateOfBirth, @address, @phoneNumber)
    `);

  // Insert into role-specific table
  switch (role) {
    case 'student':
      await pool.request()
        .input('studentId', sql.VarChar(10), userId)
        .query('INSERT INTO students (student_id) VALUES (@studentId)');
      break;
    case 'lecturer':
      await pool.request()
        .input('lecturerId', sql.VarChar(10), userId)
        .query('INSERT INTO lecturers (lecturer_id) VALUES (@lecturerId)');
      break;
    case 'admin':
      await pool.request()
        .input('adminId', sql.VarChar(10), userId)
        .query('INSERT INTO admins (admin_id) VALUES (@adminId)');
      break;
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully'
  });
});

module.exports = {
  login,
  getMe,
  register
}; 