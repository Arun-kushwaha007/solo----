const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  stats: {
    strength: { type: Number, default: 10 },
    agility: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    vitality: { type: Number, default: 10 },
    perception: { type: Number, default: 10 },
  },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  rank: { type: String, default: 'E-Rank' },
  title: { type: String, default: 'None' },
  
  calibration: {
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'COMPLETED'],
      default: 'PENDING',
    },
    startDate: Date,
    endDate: Date,
    baselineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Baseline',
    },
    baselineData: {
      initialPushups: Number,
      initialRunTime: Number,
      focusScore: Number,
    },
    adaptiveDifficulty: {
      overall: { type: Number, default: 1.0, min: 0.5, max: 2.0 },
      strength: { type: Number, default: 1.0, min: 0.5, max: 2.0 },
      agility: { type: Number, default: 1.0, min: 0.5, max: 2.0 },
      intelligence: { type: Number, default: 1.0, min: 0.5, max: 2.0 },
      vitality: { type: Number, default: 1.0, min: 0.5, max: 2.0 },
      perception: { type: Number, default: 1.0, min: 0.5, max: 2.0 },
    },
    wearablePermissions: {
      manual: { type: Boolean, default: true },
      fitbit: { type: Boolean, default: false },
      appleHealth: { type: Boolean, default: false },
      googleFit: { type: Boolean, default: false },
      garmin: { type: Boolean, default: false },
    },
  },
  
  onboardingStep: {
    type: Number,
    default: 0, // 0: Intro, 1: Demographics, 2: Calibration, 3: Done
  },
  
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  
  onboardingCompletedAt: {
    type: Date,
  },
  
  demographics: {
    age: Number,
    height: Number, // cm
    weight: Number, // kg
    gender: String,
  },
  
  // New fields for enhanced profile
  healthConstraints: {
    injuries: [String], // Encrypted array
    medicalConditions: [String], // Encrypted array
    limitations: [String], // Encrypted array
    dietaryRestrictions: [String],
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
  },
  
  persona: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  
  goals: [{
    title: String,
    description: String,
    category: String,
    targetDate: Date,
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      questReminders: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
    language: {
      type: String,
      default: 'en',
    },
    questDifficulty: {
      type: String,
      enum: ['easy', 'normal', 'hard', 'extreme'],
      default: 'normal',
    },
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
ProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Profile', ProfileSchema);
