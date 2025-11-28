const express = require('express');
const router = express.Router();
const Teacher = require('../models/teacher.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  All authenticated users
router.get('/', protect, async (req, res) => {
  try {
    const { search, department, designation, limit = 50 } = req.query;
    
    let query = { isActive: true };

    // Search by name or APAR ID
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { aparId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by department
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    // Filter by designation
    if (designation) {
      query.designation = designation;
    }

    const teachers = await Teacher.find(query)
      .populate('institutionId', 'name shortName')
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/teachers/stats
// @desc    Get teacher statistics
// @access  All authenticated users
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Teacher.countDocuments({ isActive: true });
    
    const avgRating = await Teacher.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    const avgPublications = await Teacher.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avg: { $avg: '$publications' } } }
    ]);

    const byDepartment = await Teacher.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        avgRating: avgRating[0]?.avg?.toFixed(2) || '0.00',
        avgPublications: Math.round(avgPublications[0]?.avg || 0),
        byDepartment: byDepartment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Get teacher stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/teachers/:id
// @desc    Get single teacher
// @access  All authenticated users
router.get('/:id', protect, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('institutionId', 'name shortName location');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({ success: true, data: teacher });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/teachers
// @desc    Create teacher
// @access  Admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher,
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Teacher with this email or APAR ID already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Admin only
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher (soft delete)
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;