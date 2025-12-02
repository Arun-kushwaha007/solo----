const mongoose = require('mongoose');

const ActivityMetricSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  source: {
    type: String,
    required: true,
    enum: ['google_fit', 'apple_health', 'fitbit', 'manual', 'synthetic'],
  },
  type: {
    type: String,
    required: true,
    enum: ['steps', 'heart_rate', 'calories', 'distance', 'sleep'],
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  metadata: {
    confidence: Number, // 0-100
    deviceId: String,
    originalSourceId: String,
    isManual: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'userId',
    granularity: 'minutes',
  },
  timestamps: true,
});

// Indexes for efficient querying
ActivityMetricSchema.index({ userId: 1, timestamp: 1, type: 1 });
ActivityMetricSchema.index({ userId: 1, type: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityMetric', ActivityMetricSchema);
