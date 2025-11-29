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
    baselineData: {
      initialPushups: Number,
      initialRunTime: Number,
      focusScore: Number,
    },
  },
  
  onboardingStep: {
    type: Number,
    default: 0, // 0: Intro, 1: Demographics, 2: Calibration, 3: Done
  },
  
  demographics: {
    age: Number,
    height: Number, // cm
    weight: Number, // kg
    gender: String,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Profile', ProfileSchema);
