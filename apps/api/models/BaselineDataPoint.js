const mongoose = require('mongoose');

const BaselineDataPointSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  baselineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baseline',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  source: {
    type: String,
    enum: ['manual', 'fitbit', 'apple_health', 'google_fit', 'garmin', 'whoop', 'oura', 'system'],
    default: 'manual',
  },
  category: {
    type: String,
    enum: ['strength', 'agility', 'intelligence', 'vitality', 'perception'],
    required: true,
    index: true,
  },
  dataType: {
    type: String,
    required: true,
    // Examples: 'steps', 'heart_rate', 'sleep_hours', 'workout_duration', 
    // 'meditation_minutes', 'reading_pages', 'mood_score', etc.
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    // Examples: 'steps', 'bpm', 'hours', 'minutes', 'pages', 'score', etc.
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    // Additional context: workout type, book title, activity details, etc.
  },
  validated: {
    type: Boolean,
    default: true,
  },
  outlier: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient querying
BaselineDataPointSchema.index({ userId: 1, baselineId: 1, timestamp: -1 });
BaselineDataPointSchema.index({ userId: 1, category: 1, timestamp: -1 });

// Static method to get data points for a baseline
BaselineDataPointSchema.statics.getForBaseline = async function(baselineId, category = null) {
  const query = { baselineId, validated: true, outlier: false };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ timestamp: 1 });
};

// Static method to get data points by date range
BaselineDataPointSchema.statics.getByDateRange = async function(userId, startDate, endDate, category = null) {
  const query = {
    userId,
    timestamp: { $gte: startDate, $lte: endDate },
    validated: true,
    outlier: false,
  };
  if (category) {
    query.category = category;
  }
  return this.find(query).sort({ timestamp: 1 });
};

// Static method to count data points per category
BaselineDataPointSchema.statics.countByCategory = async function(baselineId) {
  return this.aggregate([
    { $match: { baselineId: mongoose.Types.ObjectId(baselineId), validated: true, outlier: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
};

module.exports = mongoose.model('BaselineDataPoint', BaselineDataPointSchema);
