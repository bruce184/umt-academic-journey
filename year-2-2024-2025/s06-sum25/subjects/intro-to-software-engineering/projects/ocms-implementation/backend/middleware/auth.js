const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { getPool, sql } = require('../config/database');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const pool = getPool();
      const result = await pool.request()
        .input('userId', sql.VarChar(10), decoded.userId)
        .query(`
          SELECT u.user_id, u.username, u.full_name, u.role, u.email
          FROM users u
          WHERE u.user_id = @userId
        `);

      if (result.recordset.length === 0) {
        res.status(401);
        throw new Error('User not found');
      }

      req.user = result.recordset[0];
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no user');
    }

    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`User role ${req.user.role} is not authorized to access this route`);
    }
    next();
  };
};

module.exports = { protect, authorize }; 