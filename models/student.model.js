const mongoose = require('mongoose');
const crypto = require('crypto');

const lifecycleStageSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: ['Enrollment', 'Academic Progress', 'Internship', 'Placement', 'Higher Studies', 'Alumni'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'In Progress', 'Pending'],
    default: 'In Progress'
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Flexible for different stage requirements
  },
  documents: [{
    name: String,
    url: String,
    uploadDate: { type: Date, default: Date.now },
    verified: { type: Boolean, default: false }
  }],
  notes: String,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const studentSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    
    // Aadhaar Information
    aadhaarNumber: {
      type: String,
      unique: true,
      sparse: true, // Allows null values
      select: false, // Don't return in queries by default
    },
    aadhaarVerified: {
      type: Boolean,
      default: false,
    },
    aadhaarVerificationDate: {
      type: Date,
    },
    aadhaarVerificationOTP: {
      code: String,
      expiresAt: Date,
      attempts: { type: Number, default: 0 }
    },
    
    // APAAR ID (Academic Performance Assessment and Advancement Report)
    apaarId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    
    // Academic Information
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [10, 'Semester cannot exceed 10'],
    },
    batch: {
      type: String, // e.g., "2020-2024"
    },
    enrollmentNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    
    // Performance Metrics
    cgpa: {
      type: Number,
      default: 0,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10'],
    },
    attendance: {
      type: Number,
      default: 0,
      min: [0, 'Attendance cannot be negative'],
      max: [100, 'Attendance cannot exceed 100'],
    },
    assignments: {
      type: Number,
      default: 0,
      min: [0, 'Assignment completion cannot be negative'],
      max: [100, 'Assignment completion cannot exceed 100'],
    },
    
    // Achievements
    achievements: {
      type: [String],
      default: [],
    },
    
    // Schemes and Benefits
    schemes: {
      type: [String],
      default: [],
    },
    enrolledSchemes: [{
      schemeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scheme'
      },
      schemeName: String,
      applicationDate: Date,
      approvalDate: Date,
      status: {
        type: String,
        enum: ['Applied', 'Approved', 'Rejected', 'Benefited', 'Completed'],
        default: 'Applied'
      },
      amount: Number,
      documents: [{
        name: String,
        url: String,
        uploadDate: Date
      }]
    }],
    
    // Institution Reference
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
    },
    
    // Student Lifecycle
    currentStage: {
      type: String,
      enum: ['Enrollment', 'Academic Progress', 'Internship', 'Placement', 'Higher Studies', 'Alumni'],
      default: 'Enrollment'
    },
    lifecycle: [lifecycleStageSchema],
    
    // Placement/Career Information
    placementStatus: {
      type: String,
      enum: ['Not Placed', 'In Process', 'Placed', 'Higher Studies', 'Entrepreneur'],
      default: 'Not Placed'
    },
    placementDetails: {
      company: String,
      package: Number,
      role: String,
      joiningDate: Date,
      offerLetter: String // URL to document
    },
    
    // Alumni Information
    alumniStatus: {
      type: Boolean,
      default: false
    },
    alumniDetails: {
      graduationDate: Date,
      currentPosition: String,
      currentOrganization: String,
      linkedInProfile: String,
      achievements: [String]
    },
    
    // Documents
    documents: [{
      type: {
        type: String,
        enum: ['Photo', 'ID Proof', 'Address Proof', 'Marksheet', 'Certificate', 'Other']
      },
      name: String,
      url: String,
      uploadDate: { type: Date, default: Date.now },
      verified: { type: Boolean, default: false },
      expiryDate: Date
    }],
    
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Metadata
    lastLoginDate: Date,
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true,
  }
);

// Encrypt Aadhaar before saving
studentSchema.pre('save', function (next) {
  if (this.isModified('aadhaarNumber') && this.aadhaarNumber) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.AADHAAR_ENCRYPTION_KEY || 'your-32-character-secret-key-here!!', 'utf-8');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(this.aadhaarNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    this.aadhaarNumber = iv.toString('hex') + ':' + encrypted;
  }
  next();
});

// Generate APAAR ID if not provided
studentSchema.pre('save', async function (next) {
  if (!this.apaarId) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.apaarId = `APAAR-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate profile completeness
studentSchema.pre('save', function (next) {
  let completeness = 0;
  const fields = [
    'name', 'email', 'phone', 'dateOfBirth', 'gender', 'aadhaarVerified',
    'course', 'semester', 'batch', 'enrollmentNumber', 'institution'
  ];
  
  fields.forEach(field => {
    if (this[field]) completeness += (100 / fields.length);
  });
  
  this.profileCompleteness = Math.round(completeness);
  next();
});

// Method to decrypt Aadhaar
studentSchema.methods.decryptAadhaar = function() {
  if (!this.aadhaarNumber) return null;
  
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.AADHAAR_ENCRYPTION_KEY || 'your-32-character-secret-key-here!!', 'utf-8');
    const parts = this.aadhaarNumber.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return null;
  }
};

// Method to add lifecycle stage
studentSchema.methods.addLifecycleStage = function(stageData) {
  this.lifecycle.push(stageData);
  this.currentStage = stageData.stage;
  return this.save();
};

// Method to update lifecycle stage
studentSchema.methods.updateLifecycleStage = function(stageId, updateData) {
  const stage = this.lifecycle.id(stageId);
  if (stage) {
    Object.assign(stage, updateData);
    return this.save();
  }
  return Promise.reject(new Error('Stage not found'));
};

// Static method to get students by lifecycle stage
studentSchema.statics.getByLifecycleStage = function(stage) {
  return this.find({ currentStage: stage, isActive: true })
    .populate('institution', 'name location')
    .select('name email apaarId course semester cgpa currentStage');
};

// Static method to get dropout risk students
studentSchema.statics.getDropoutRisk = function() {
  return this.find({
    isActive: true,
    $or: [
      { attendance: { $lt: 75 } },
      { cgpa: { $lt: 6.0 } },
      { assignments: { $lt: 60 } }
    ]
  }).select('name email apaarId attendance cgpa assignments');
};

// Index for faster searches
studentSchema.index({ name: 'text', email: 'text', apaarId: 'text' });
studentSchema.index({ aadhaarVerified: 1, isActive: 1 });
studentSchema.index({ currentStage: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;