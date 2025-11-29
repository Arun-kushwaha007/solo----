const mongoose = require('mongoose');

const OnboardingProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  currentStep: {
    type: Number,
    default: 0,
    min: 0,
    max: 6, // 0-6 for 7 steps
  },
  completedSteps: {
    type: [Number],
    default: [],
  },
  stepData: {
    welcome: {
      completed: { type: Boolean, default: false },
      timestamp: Date,
    },
    persona: {
      completed: { type: Boolean, default: false },
      displayName: String,
      persona: String,
      timezone: String,
      timestamp: Date,
    },
    goals: {
      completed: { type: Boolean, default: false },
      goals: [{
        title: String,
        description: String,
        category: String,
        targetDate: Date,
        priority: Number,
      }],
      timestamp: Date,
    },
    constraints: {
      completed: { type: Boolean, default: false },
      healthConstraints: {
        injuries: [String],
        medicalConditions: [String],
        limitations: [String],
        dietaryRestrictions: [String],
        fitnessLevel: String,
      },
      timeAvailability: {
        hoursPerWeek: Number,
        preferredTimes: [String], // morning, afternoon, evening, night
      },
      equipment: {
        gym: Boolean,
        homeEquipment: [String],
        outdoorAccess: Boolean,
      },
      timestamp: Date,
    },
    wearables: {
      completed: { type: Boolean, default: false },
      permissions: {
        manual: { type: Boolean, default: true },
        fitbit: { type: Boolean, default: false },
        appleHealth: { type: Boolean, default: false },
        googleFit: { type: Boolean, default: false },
      },
      timestamp: Date,
    },
    baselineIntro: {
      completed: { type: Boolean, default: false },
      agreedToBaseline: Boolean,
      baselineDuration: { type: Number, default: 7 },
      timestamp: Date,
    },
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Update lastUpdated on save
OnboardingProgressSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to mark step as completed
OnboardingProgressSchema.methods.completeStep = function(stepNumber) {
  if (!this.completedSteps.includes(stepNumber)) {
    this.completedSteps.push(stepNumber);
  }
  if (stepNumber < 6) {
    this.currentStep = stepNumber + 1;
  }
};

// Method to check if onboarding is complete
OnboardingProgressSchema.methods.isComplete = function() {
  return this.completedSteps.length === 7 && this.completedAt !== null;
};

// Method to get completion percentage
OnboardingProgressSchema.methods.getCompletionPercentage = function() {
  return Math.round((this.completedSteps.length / 7) * 100);
};

module.exports = mongoose.model('OnboardingProgress', OnboardingProgressSchema);
