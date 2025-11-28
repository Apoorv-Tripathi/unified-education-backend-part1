const express = require('express');
const router = express.Router();
const Student = require('../models/student.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// @route   GET /api/students
// @desc    Get all students
// @access  Admin, Institution
router.get('/', protect, authorize('admin', 'institution'), async (req, res) => {
  try {
    const { search, course, limit = 50 } = req.query;

    let query = { isActive: true };

    // Search by name or APAAR ID
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { apaarId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by course
    if (course) {
      query.course = course;
    }

    // If institution user, only show their students
    if (req.user.role === 'institution') {
      query.institution = req.user._id; // Changed from institutionId
    }

    const students = await Student.find(query)
      .populate('institution', 'name location') // Changed from institutionId
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/students/stats
// @desc    Get student statistics
// @access  Admin, Institution
router.get('/stats', protect, authorize('admin', 'institution'), async (req, res) => {
  try {
    const total = await Student.countDocuments({ isActive: true });

    const avgCGPA = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avg: { $avg: '$cgpa' } } }
    ]);

    const byCourse = await Student.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$course', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active: total,
        avgCGPA: avgCGPA[0]?.avg?.toFixed(2) || '0.00',
        byCourse: byCourse.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Admin, Institution
router.get('/:id', protect, authorize('admin', 'institution', 'student'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('institution', 'name shortName location'); // Changed from institutionId

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/students
// @desc    Create student
// @access  Admin, Institution
router.post('/', protect, authorize('admin', 'institution'), async (req, res) => {
  try {
    const studentData = { ...req.body };

    // If institution user, assign their ID
    if (req.user.role === 'institution') {
      studentData.institution = req.user._id; // Changed from institutionId
    }

    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    console.error('Create student error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Student with this email or APAAR ID already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Admin, Institution
router.put('/:id', protect, authorize('admin', 'institution'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student (soft delete)
// @access  Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/students/bulk-add
// @desc    Bulk add students from CSV
// @access  Private (Admin/Institution)
router.post('/bulk-add', protect, authorize('admin', 'institution'), async (req, res) => {
  try {
    const studentsData = req.body;

    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Expected an array of student records.'
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: studentsData.length
    };

    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];

      try {
        if (!studentData.name || !studentData.email || !studentData.course) {
          results.failed.push({
            row: i + 1,
            data: studentData,
            error: 'Missing required fields (name, email, or course)'
          });
          continue;
        }

        const existingStudent = await Student.findOne({ email: studentData.email });
        if (existingStudent) {
          results.failed.push({
            row: i + 1,
            data: studentData,
            error: `Student with email ${studentData.email} already exists`
          });
          continue;
        }

        const parsedData = {
          name: studentData.name.trim(),
          email: studentData.email.trim().toLowerCase(),
          course: studentData.course.trim(),
          semester: studentData.semester ? parseInt(studentData.semester) : undefined,
          cgpa: studentData.cgpa ? parseFloat(studentData.cgpa) : 0,
          attendance: studentData.attendance ? parseFloat(studentData.attendance) : 0,
          assignments: studentData.assignments ? parseFloat(studentData.assignments) : 0,
          phone: studentData.phone ? studentData.phone.trim() : undefined,
          gender: studentData.gender ? studentData.gender.trim() : undefined,
          dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : undefined,
          batch: studentData.batch ? studentData.batch.trim() : undefined,
          enrollmentNumber: studentData.enrollmentNumber ? studentData.enrollmentNumber.trim() : undefined
        };

        if (studentData.achievements) {
          parsedData.achievements = studentData.achievements
            .split(';')
            .map(a => a.trim())
            .filter(Boolean);
        }

        if (studentData.schemes) {
          parsedData.schemes = studentData.schemes
            .split(';')
            .map(s => s.trim())
            .filter(Boolean);
        }

        // Changed from institutionId to institution
        if (req.user.role === 'institution') {
          parsedData.institution = req.user._id;
        }

        const newStudent = await Student.create(parsedData);

        results.successful.push({
          row: i + 1,
          studentId: newStudent._id,
          name: newStudent.name,
          email: newStudent.email,
          apaarId: newStudent.apaarId
        });

      } catch (error) {
        results.failed.push({
          row: i + 1,
          data: studentData,
          error: error.message
        });
      }
    }

    res.status(results.failed.length === studentsData.length ? 400 : 200).json({
      success: results.successful.length > 0,
      message: `Bulk add completed: ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    console.error('Bulk add error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk add',
      error: error.message
    });
  }
});

// @route   POST /api/students/bulk-delete
// @desc    Bulk delete students
// @access  Private (Admin only)
router.post('/bulk-delete', protect, authorize('admin'), async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format. Expected an array of student IDs.'
      });
    }

    const results = {
      successful: [],
      failed: [],
      total: ids.length
    };

    for (const id of ids) {
      try {
        const student = await Student.findById(id);

        if (!student) {
          results.failed.push({
            id,
            error: 'Student not found'
          });
          continue;
        }

        await Student.findByIdAndDelete(id);

        results.successful.push({
          id,
          name: student.name,
          email: student.email
        });

      } catch (error) {
        results.failed.push({
          id,
          error: error.message
        });
      }
    }

    res.json({
      success: results.successful.length > 0,
      message: `Bulk delete completed: ${results.successful.length} deleted, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk delete',
      error: error.message
    });
  }
});

module.exports = router;