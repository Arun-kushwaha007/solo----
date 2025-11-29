const mongoose = require('mongoose');

const CalibrationTestSchema = new mongoose.Schema({
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
  testType: {
    type: String,
    enum: ['timed_walk', 'cognitive_reaction', 'cognitive_memory', 'strength_pushups', 'strength_plank', 'flexibility'],
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  results: {
    // Timed Walk Test
    distance: Number, // meters
    duration: Number, // seconds
    heartRateAvg: Number,
    heartRateMax: Number,
    
    // Cognitive Tests
    reactionTime: Number, // milliseconds
    accuracy: Number, // percentage
    correctAnswers: Number,
    totalQuestions: Number,
    
    // Strength Tests
    repetitions: Number,
    holdDuration: Number, // seconds for plank
    formScore: Number, // 1-10
    
    // Flexibility
    reachDistance: Number, // cm
    
    // General
    perceivedExertion: Number, // 1-10 RPE scale
    notes: String,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  category: {
    type: String,
    enum: ['strength', 'agility', 'intelligence', 'vitality', 'perception'],
    required: true,
  },
  metadata: {
    environment: String, // indoor, outdoor, gym
    temperature: Number,
    timeOfDay: String,
    priorActivity: String,
    equipment: [String],
  },
  validated: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying
CalibrationTestSchema.index({ userId: 1, testType: 1, timestamp: -1 });

// Method to calculate score based on test type
CalibrationTestSchema.methods.calculateScore = function() {
  let score = 0;
  
  switch (this.testType) {
    case 'timed_walk':
      // 6-minute walk test: distance in meters
      // Average: 400-700m, Good: >700m
      if (this.results.distance) {
        score = Math.min(100, (this.results.distance / 800) * 100);
      }
      break;
      
    case 'cognitive_reaction':
      // Reaction time: lower is better
      // Average: 200-300ms, Good: <200ms
      if (this.results.reactionTime) {
        score = Math.max(0, 100 - ((this.results.reactionTime - 150) / 3));
      }
      break;
      
    case 'cognitive_memory':
      // Accuracy percentage
      if (this.results.accuracy !== undefined) {
        score = this.results.accuracy;
      }
      break;
      
    case 'strength_pushups':
      // Pushups: varies by age/gender, use relative scale
      if (this.results.repetitions) {
        score = Math.min(100, (this.results.repetitions / 30) * 100);
      }
      break;
      
    case 'strength_plank':
      // Plank hold duration in seconds
      // Average: 60s, Good: >120s
      if (this.results.holdDuration) {
        score = Math.min(100, (this.results.holdDuration / 180) * 100);
      }
      break;
      
    case 'flexibility':
      // Sit and reach test in cm
      if (this.results.reachDistance) {
        score = Math.min(100, ((this.results.reachDistance + 10) / 40) * 100);
      }
      break;
  }
  
  this.score = Math.round(score);
  return this.score;
};

// Static method to get tests for baseline
CalibrationTestSchema.statics.getForBaseline = async function(baselineId) {
  return this.find({ baselineId, validated: true }).sort({ timestamp: -1 });
};

// Static method to get latest test by type
CalibrationTestSchema.statics.getLatestByType = async function(userId, testType) {
  return this.findOne({ userId, testType, validated: true }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('CalibrationTest', CalibrationTestSchema);
