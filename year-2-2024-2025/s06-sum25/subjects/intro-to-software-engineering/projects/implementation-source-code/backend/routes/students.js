const express = require('express');
const {
  getStudents,
  getStudent,
  getStudentEnrollments,
  getStudentAttendance,
  getStudentSchedule,
  getStudentAssignments,
  getStudentTuition
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin routes
router.get('/', authorize('admin'), getStudents);

// Student can access their own data, admin can access all
router.get('/:id', (req, res, next) => {
  // Allow if admin or if student is accessing their own data
  if (req.user.role === 'admin' || req.user.user_id === req.params.id) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized to access this student data');
  }
}, getStudent);

router.get('/:id/enrollments', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.user_id === req.params.id) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized to access this student data');
  }
}, getStudentEnrollments);

router.get('/:id/attendance', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.user_id === req.params.id) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized to access this student data');
  }
}, getStudentAttendance);

router.get('/:id/schedule', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.user_id === req.params.id) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized to access this student data');
  }
}, getStudentSchedule);

router.get('/:id/assignments', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.user_id === req.params.id) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized to access this student data');
  }
}, getStudentAssignments);

router.get('/:id/tuition', (req, res, next) => {
  if (req.user.role === 'admin' || req.user.user_id === req.params.id) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized to access this student data');
  }
}, getStudentTuition);

module.exports = router; 