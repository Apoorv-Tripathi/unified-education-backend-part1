const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  aparId: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  department: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'],
    default: 'Assistant Professor',
  },
  publications: {
    type: Number,
    default: 0,
  },
  projects: {
    type: Number,
    default: 0,
  },
  hIndex: {
    type: Number,
    default: 0,
  },
  experience: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  specializations: [{
    type: String,
  }],
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
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

// Generate initials from name
teacherSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
});

// Include virtuals in JSON
teacherSchema.set('toJSON', { virtuals: true });
teacherSchema.set('toObject', { virtuals: true });

// Generate APAR ID before saving
teacherSchema.pre('save', async function (next) {
  if (!this.aparId) {
    const count = await mongoose.model('Teacher').countDocuments();
    this.aparId = `APAR${new Date().getFullYear()}${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Teacher', teacherSchema);