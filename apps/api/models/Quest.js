const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MAIN', 'SUDDEN'],
    default: 'DAILY',
  },
  difficulty: {
    type: String,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    default: 'E',
  },
  
  // Enhanced fields for quest categorization
  tags: [{
    type: String,
    trim: true,
  }],
  category: {
    type: String,
    enum: ['physical', 'mental', 'professional', 'creative', 'social', 'financial', 'spiritual'],
  },
  
  // Verification configuration
  verificationType: {
    type: String,
    enum: ['MANUAL', 'AUTO_SENSOR', 'AUTO_PHOTO', 'AUTO_VIDEO', 'HYBRID'],
    default: 'MANUAL',
  },
  
  // Sensor-based verification
  sensorType: {
    type: String,
    enum: ['STEPS', 'DISTANCE', 'HEART_RATE', 'CALORIES', 'SLEEP', 'WORKOUT_DURATION', 'NONE'],
    default: 'NONE',
  },
  sensorThreshold: {
    type: Number,
    default: 0,
  },
  sensorUnit: {
    type: String, // 'steps', 'km', 'bpm', 'kcal', 'hours', 'minutes'
  },
  
  // Evidence requirements
  evidenceRequired: {
    type: Boolean,
    default: false,
  },
  evidenceTypes: [{
    type: String,
    enum: ['PHOTO', 'VIDEO', 'TEXT', 'SENSOR_DATA'],
  }],
  evidenceDescription: String, // Instructions for what evidence to provide
  
  // Scheduling
  schedule: {
    recurrence: {
      type: String,
      enum: ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'],
      default: 'ONCE',
    },
    daysOfWeek: [{ // For weekly quests
      type: Number,
      min: 0,
      max: 6, // 0 = Sunday, 6 = Saturday
    }],
    timeOfDay: String, // HH:MM format for when quest becomes available
    duration: Number, // How long quest is available (in hours)
  },
  
  // Rewards
  rewards: {
    xp: { type: Number, default: 100 },
    gold: { type: Number, default: 0 },
    items: [String],
  },
  
  // Requirements
  requirements: {
    type: Map,
    of: Number, // e.g., { "pushups": 100, "km_run": 10 }
  },
  
  // Quest ownership and status
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isTemplate: {
    type: Boolean,
    default: false, // True if this is a template for generating user quests
  },
  
  // Time limits
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
QuestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
QuestSchema.index({ type: 1, isActive: 1 });
QuestSchema.index({ tags: 1 });
QuestSchema.index({ category: 1 });

module.exports = mongoose.model('Quest', QuestSchema);
