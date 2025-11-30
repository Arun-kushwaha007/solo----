const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PHOTO', 'VIDEO', 'TEXT', 'SENSOR_DATA'],
    required: true,
  },
  data: {
    type: String, // Base64 encoded for images/videos, plain text for TEXT, JSON string for SENSOR_DATA
    required: true,
  },
  mimeType: String, // e.g., 'image/jpeg', 'video/mp4'
  fileName: String,
  fileSize: Number, // in bytes
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // Additional metadata like GPS coordinates, timestamp, etc.
  },
});

const UserQuestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED'],
    default: 'ACTIVE',
  },
  progress: {
    type: Map,
    of: Number, // e.g., { "pushups": 50 } (Current progress)
  },
  
  // Evidence and verification
  evidence: [EvidenceSchema],
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED', 'AUTO_VERIFIED'],
    default: 'PENDING',
  },
  verificationMethod: {
    type: String,
    enum: ['MANUAL', 'AUTO_SENSOR', 'AUTO_PHOTO', 'AUTO_VIDEO', 'ADMIN_OVERRIDE', 'NONE'],
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who verified
  },
  verifiedAt: Date,
  rejectionReason: String,
  
  // Sensor data for auto-verification
  sensorData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed, // e.g., { "steps": 10500, "timestamp": "...", "source": "fitbit" }
  },
  
  // XP and rewards
  xpAwarded: {
    type: Number,
    default: 0,
  },
  xpBreakdown: {
    baseXP: Number,
    bonusXP: Number,
    multiplier: Number,
    rulesApplied: [String], // Names of XP rules that were applied
  },
  rewardsAwarded: {
    gold: Number,
    items: [String],
  },
  
  // Timestamps
  acceptedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  failedAt: Date,
  expiresAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
UserQuestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
UserQuestSchema.index({ user: 1, status: 1 });
UserQuestSchema.index({ quest: 1 });
UserQuestSchema.index({ user: 1, quest: 1 }, { unique: false }); // Allow multiple attempts
UserQuestSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('UserQuest', UserQuestSchema);
