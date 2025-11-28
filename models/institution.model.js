const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  shortName: {
    type: String,
    trim: true,
  },
  aisheCode: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Government', 'Private', 'Deemed', 'Autonomous'],
    default: 'Private',
  },
  accreditation: {
    type: String,
    default: 'NAAC A',
  },
  nirfScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  ranking: {
    type: Number,
    default: 0,
  },
  compliance: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  students: {
    type: Number,
    default: 0,
  },
  faculty: {
    type: Number,
    default: 0,
  },
  departments: {
    type: Number,
    default: 0,
  },
  projects: {
    type: Number,
    default: 0,
  },
  established: {
    type: Number,
  },
  placement: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  website: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Institution', institutionSchema);