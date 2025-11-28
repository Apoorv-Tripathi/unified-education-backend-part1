const express = require('express');
const router = express.Router();
const Institution = require('../models/institution.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   GET /api/institutions
// @desc    Get all institutions
// @access  All authenticated users
router.get('/', protect, async (req, res) => {
  try {
    const { search, type, limit = 50 } = req.query;
    
    let query = { isActive: true };

    // Search by name or AISHE code
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { aisheCode: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    const institutions = await Institution.find(query)
      .limit(parseInt(limit))
      .sort({ nirfScore: -1 });

    res.json({
      success: true,
      count: institutions.length,
      data: institutions,
    });
  } catch (error) {
    console.error('Get institutions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/institutions/stats
// @desc    Get institution statistics
// @access  All authenticated users
router.get('/stats', protect, async (req, res) => {
  try {
    const total = await Institution.countDocuments({ isActive: true });
    
    const avgNIRF = await Institution.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avg: { $avg: '$nirfScore' } } }
    ]);

    const avgCompliance = await Institution.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avg: { $avg: '$compliance' } } }
    ]);

    const topRanked = await Institution.find({ isActive: true })
      .sort({ nirfScore: -1 })
      .limit(5)
      .select('name shortName nirfScore ranking');

    res.json({
      success: true,
      data: {
        total,
        avgNIRF: avgNIRF[0]?.avg?.toFixed(2) || '0.00',
        avgCompliance: avgCompliance[0]?.avg?.toFixed(2) || '0.00',
        topRanked,
      },
    });
  } catch (error) {
    console.error('Get institution stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/institutions/:id
// @desc    Get single institution
// @access  All authenticated users
router.get('/:id', protect, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }

    res.json({ success: true, data: institution });
  } catch (error) {
    console.error('Get institution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/institutions
// @desc    Create institution
// @access  Admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const institution = await Institution.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Institution created successfully',
      data: institution,
    });
  } catch (error) {
    console.error('Create institution error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Institution with this AISHE code already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/institutions/:id
// @desc    Update institution
// @access  Admin only
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }

    res.json({
      success: true,
      message: 'Institution updated successfully',
      data: institution,
    });
  } catch (error) {
    console.error('Update institution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/institutions/:id
// @desc    Delete institution (soft delete)
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }

    res.json({
      success: true,
      message: 'Institution deleted successfully',
    });
  } catch (error) {
    console.error('Delete institution error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;