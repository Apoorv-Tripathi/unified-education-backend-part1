const mongoose = require('mongoose');

const eligibilityCriteriaSchema = new mongoose.Schema({
  minCGPA: { type: Number, default: 0 },
  maxCGPA: { type: Number, default: 10 },
  minAttendance: { type: Number, default: 0 },
  courses: [String], // Specific courses eligible
  semesters: [Number], // Specific semesters eligible
  categories: [String], // SC/ST/OBC/General
  familyIncome: { 
    min: Number, 
    max: Number 
  },
  specialCriteria: String // Any additional criteria
}, { _id: false });

const schemeSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      unique: true
    },
    shortName: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    
    // Scheme Type
    type: {
      type: String,
      enum: ['Scholarship', 'Fellowship', 'Loan', 'Grant', 'Award', 'Subsidy', 'Other'],
      required: true
    },
    
    // Financial Details
    amount: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      type: { type: String, enum: ['Fixed', 'Variable', 'Range'], default: 'Fixed' }
    },
    
    // Government Department
    department: {
      type: String,
      required: true,
      trim: true
    },
    ministry: {
      type: String,
      trim: true
    },
    level: {
      type: String,
      enum: ['Central', 'State', 'District', 'University', 'Institution'],
      default: 'Central'
    },
    
    // Eligibility
    eligibilityCriteria: eligibilityCriteriaSchema,
    
    // Application Details
    applicationStartDate: {
      type: Date
    },
    applicationEndDate: {
      type: Date
    },
    applicationProcess: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
      default: 'Online'
    },
    applicationUrl: {
      type: String,
      trim: true
    },
    
    // Documents Required
    documentsRequired: [{
      name: String,
      mandatory: { type: Boolean, default: true },
      format: String // PDF, JPG, etc.
    }],
    
    // Benefits
    benefits: {
      type: [String],
      default: []
    },
    
    // Terms and Conditions
    termsAndConditions: {
      type: String
    },
    
    // Contact Information
    contactEmail: {
      type: String,
      trim: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    helplineNumber: {
      type: String,
      trim: true
    },
    websiteUrl: {
      type: String,
      trim: true
    },
    
    // Statistics
    totalApplicants: {
      type: Number,
      default: 0
    },
    totalBeneficiaries: {
      type: Number,
      default: 0
    },
    currentYearBudget: {
      type: Number,
      default: 0
    },
    
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    
    // Metadata
    tags: [String],
    category: {
      type: String,
      enum: ['Merit Based', 'Need Based', 'Reserved Category', 'Sports', 'Cultural', 'Research', 'General'],
      default: 'General'
    }
  },
  {
    timestamps: true,
  }
);

// Method to check eligibility
schemeSchema.methods.checkEligibility = function(student) {
  const criteria = this.eligibilityCriteria;
  
  // Check CGPA
  if (student.cgpa < criteria.minCGPA || student.cgpa > criteria.maxCGPA) {
    return { eligible: false, reason: 'CGPA not in range' };
  }
  
  // Check Attendance
  if (student.attendance < criteria.minAttendance) {
    return { eligible: false, reason: 'Insufficient attendance' };
  }
  
  // Check Course
  if (criteria.courses && criteria.courses.length > 0) {
    if (!criteria.courses.includes(student.course)) {
      return { eligible: false, reason: 'Course not eligible' };
    }
  }
  
  // Check Semester
  if (criteria.semesters && criteria.semesters.length > 0) {
    if (!criteria.semesters.includes(student.semester)) {
      return { eligible: false, reason: 'Semester not eligible' };
    }
  }
  
  return { eligible: true, reason: 'All criteria met' };
};

// Static method to get active schemes
schemeSchema.statics.getActiveSchemes = function() {
  return this.find({ 
    isActive: true,
    applicationEndDate: { $gte: new Date() }
  }).sort({ applicationEndDate: 1 });
};

// Static method to get schemes by type
schemeSchema.statics.getByType = function(type) {
  return this.find({ 
    type, 
    isActive: true 
  }).sort({ applicationEndDate: 1 });
};

// Static method to get recommended schemes for a student
schemeSchema.statics.getRecommendedSchemes = async function(student) {
  const allSchemes = await this.find({ 
    isActive: true,
    applicationEndDate: { $gte: new Date() }
  });
  
  const eligible = [];
  
  for (const scheme of allSchemes) {
    const result = scheme.checkEligibility(student);
    if (result.eligible) {
      eligible.push({
        scheme,
        matchScore: this.calculateMatchScore(scheme, student)
      });
    }
  }
  
  // Sort by match score
  eligible.sort((a, b) => b.matchScore - a.matchScore);
  
  return eligible.map(e => e.scheme);
};

// Calculate match score (0-100)
schemeSchema.statics.calculateMatchScore = function(scheme, student) {
  let score = 0;
  
  // CGPA match (30 points)
  const cgpaRange = scheme.eligibilityCriteria.maxCGPA - scheme.eligibilityCriteria.minCGPA;
  const cgpaPosition = (student.cgpa - scheme.eligibilityCriteria.minCGPA) / cgpaRange;
  score += cgpaPosition * 30;
  
  // Attendance match (20 points)
  const attendanceBonus = Math.min((student.attendance - scheme.eligibilityCriteria.minAttendance) / 25, 1);
  score += attendanceBonus * 20;
  
  // Course match (25 points)
  if (!scheme.eligibilityCriteria.courses || scheme.eligibilityCriteria.courses.length === 0) {
    score += 25; // All courses eligible
  } else if (scheme.eligibilityCriteria.courses.includes(student.course)) {
    score += 25;
  }
  
  // Semester match (25 points)
  if (!scheme.eligibilityCriteria.semesters || scheme.eligibilityCriteria.semesters.length === 0) {
    score += 25; // All semesters eligible
  } else if (scheme.eligibilityCriteria.semesters.includes(student.semester)) {
    score += 25;
  }
  
  return Math.min(Math.round(score), 100);
};

// Index for faster searches
schemeSchema.index({ name: 'text', description: 'text', tags: 'text' });
schemeSchema.index({ type: 1, isActive: 1 });
schemeSchema.index({ applicationEndDate: 1 });

const Scheme = mongoose.model('Scheme', schemeSchema);

module.exports = Scheme;