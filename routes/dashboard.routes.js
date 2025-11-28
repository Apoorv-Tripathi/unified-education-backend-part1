const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Admin only route
router.get('/admin/dashboard', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Admin Dashboard!',
    data: {
      role: 'admin',
      user: req.user.name,
      email: req.user.email,
    },
  });
});

// Institution only route
router.get('/institution/dashboard', protect, authorize('institution'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Institution Dashboard!',
    data: {
      role: 'institution',
      user: req.user.name,
      email: req.user.email,
    },
  });
});

// Student only route
router.get('/student/dashboard', protect, authorize('student'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Student Dashboard!',
    data: {
      role: 'student',
      user: req.user.name,
      email: req.user.email,
    },
  });
});

// Get current user info (any authenticated user)
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;