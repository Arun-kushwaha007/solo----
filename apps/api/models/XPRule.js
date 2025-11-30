const mongoose = require('mongoose');

const XPRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  ruleType: {
    type: String,
    enum: [
      'BASE_QUEST',           // Base XP for quest completion
      'DIFFICULTY_MULTIPLIER', // Multiplier based on quest difficulty
      'STREAK_BONUS',         // Bonus for consecutive days
      'CATEGORY_BONUS',       // Bonus for specific categories
      'FIRST_TIME_BONUS',     // Bonus for first time completing quest type
      'PERFECT_COMPLETION',   // Bonus for 100% completion
      'SPEED_BONUS',          // Bonus for completing quickly
      'COMBO_BONUS',          // Bonus for completing multiple quests
      'LEVEL_SCALING',        // XP scales with user level
      'CUSTOM',               // Custom rule with custom logic
    ],
    required: true,
  },
  
  // Conditions for when this rule applies
  conditions: {
    questTypes: [{
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MAIN', 'SUDDEN'],
    }],
    questDifficulties: [{
      type: String,
      enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    }],
    categories: [{
      type: String,
      enum: ['physical', 'mental', 'professional', 'creative', 'social', 'financial', 'spiritual'],
    }],
    tags: [String],
    minLevel: Number,
    maxLevel: Number,
    requiresStreak: Number, // Minimum streak required
    timeWindow: Number, // Time window in hours for speed bonus
  },
  
  // Calculation parameters
  calculation: {
    type: {
      type: String,
      enum: ['FIXED', 'PERCENTAGE', 'MULTIPLIER', 'FORMULA'],
      required: true,
    },
    value: Number, // Fixed value or percentage
    multiplier: Number, // Multiplier value
    formula: String, // Custom formula (e.g., "baseXP * (1 + streak * 0.1)")
    cap: Number, // Maximum XP this rule can award
    floor: Number, // Minimum XP this rule can award
  },
  
  // Rule priority (higher priority rules apply first)
  priority: {
    type: Number,
    default: 0,
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // User-specific overrides
  overrides: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    calculation: {
      type: {
        type: String,
        enum: ['FIXED', 'PERCENTAGE', 'MULTIPLIER', 'FORMULA'],
      },
      value: Number,
      multiplier: Number,
      formula: String,
      cap: Number,
      floor: Number,
    },
    reason: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

// Update timestamp on save
XPRuleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
XPRuleSchema.index({ ruleType: 1, isActive: 1 });
XPRuleSchema.index({ priority: -1 });

module.exports = mongoose.model('XPRule', XPRuleSchema);
