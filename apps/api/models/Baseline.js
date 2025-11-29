const mongoose = require('mongoose');

const BaselineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['COLLECTING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'COLLECTING',
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  targetDuration: {
    type: Number, // days
    default: 7,
  },
  actualDuration: {
    type: Number, // days
  },
  dataPointCount: {
    type: Number,
    default: 0,
  },
  metrics: {
    strength: {
      baseline: Number,
      mean: Number,
      median: Number,
      stdDev: Number,
      min: Number,
      max: Number,
    },
    agility: {
      baseline: Number,
      mean: Number,
      median: Number,
      stdDev: Number,
      min: Number,
      max: Number,
    },
    intelligence: {
      baseline: Number,
      mean: Number,
      median: Number,
      stdDev: Number,
      min: Number,
      max: Number,
    },
    vitality: {
      baseline: Number,
      mean: Number,
      median: Number,
      stdDev: Number,
      min: Number,
      max: Number,
    },
    perception: {
      baseline: Number,
      mean: Number,
      median: Number,
      stdDev: Number,
      min: Number,
      max: Number,
    },
  },
  confidenceIntervals: {
    strength: {
      lower: Number,
      upper: Number,
      confidence: { type: Number, default: 0.95 },
    },
    agility: {
      lower: Number,
      upper: Number,
      confidence: { type: Number, default: 0.95 },
    },
    intelligence: {
      lower: Number,
      upper: Number,
      confidence: { type: Number, default: 0.95 },
    },
    vitality: {
      lower: Number,
      upper: Number,
      confidence: { type: Number, default: 0.95 },
    },
    perception: {
      lower: Number,
      upper: Number,
      confidence: { type: Number, default: 0.95 },
    },
  },
  noiseFloor: {
    strength: Number,
    agility: Number,
    intelligence: Number,
    vitality: Number,
    perception: Number,
  },
  readinessScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  readinessCriteria: {
    minimumDays: { type: Boolean, default: false },
    minimumDataPoints: { type: Boolean, default: false },
    allCategoriesCovered: { type: Boolean, default: false },
    noLargeGaps: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Method to check if baseline is ready for processing
BaselineSchema.methods.isReady = function() {
  const criteria = this.readinessCriteria;
  return criteria.minimumDays && 
         criteria.minimumDataPoints && 
         criteria.allCategoriesCovered && 
         criteria.noLargeGaps;
};

// Method to calculate readiness score
BaselineSchema.methods.calculateReadinessScore = function() {
  let score = 0;
  const criteria = this.readinessCriteria;
  
  if (criteria.minimumDays) score += 25;
  if (criteria.minimumDataPoints) score += 25;
  if (criteria.allCategoriesCovered) score += 25;
  if (criteria.noLargeGaps) score += 25;
  
  this.readinessScore = score;
  return score;
};

// Static method to get active baseline for user
BaselineSchema.statics.getActiveBaseline = async function(userId) {
  return this.findOne({
    userId,
    status: { $in: ['COLLECTING', 'PROCESSING'] },
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Baseline', BaselineSchema);
