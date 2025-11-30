const mongoose = require('mongoose');

const categoryProgressSchema = new mongoose.Schema({
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNextLevel: { type: Number, default: 100 },
  stats: {
    primary: { type: Number, default: 10 },
    secondary: { type: Number, default: 10 },
    tertiary: { type: Number, default: 10 }
  },
  availablePoints: { type: Number, default: 0 }
});

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    default: 'HUNTER'
  },
  job: {
    type: String,
    default: 'HUNTER'
  },
  title: {
    type: String,
    default: 'E-RANK HUNTER'
  },
  overallLevel: {
    type: Number,
    default: 1
  },
  categories: {
    physical: { type: categoryProgressSchema, default: () => ({}) },
    mental: { type: categoryProgressSchema, default: () => ({}) },
    professional: { type: categoryProgressSchema, default: () => ({}) },
    creative: { type: categoryProgressSchema, default: () => ({}) },
    social: { type: categoryProgressSchema, default: () => ({}) },
    financial: { type: categoryProgressSchema, default: () => ({}) },
    spiritual: { type: categoryProgressSchema, default: () => ({}) }
  },
  selectedCategories: {
    type: [String],
    enum: ['physical', 'mental', 'professional', 'creative', 'social', 'financial', 'spiritual'],
    default: []
  },
  unlockedSkills: [{
    type: String, // SkillNode IDs
    default: []
  }],
  availablePoints: { type: Number, default: 0 },
  hp: { type: Number, default: 100 },
  maxHp: { type: Number, default: 100 },
  mp: { type: Number, default: 100 },
  maxMp: { type: Number, default: 100 },
  fatigue: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  inventory: [{
    itemId: String,
    name: String,
    type: { type: String, enum: ['WEAPON', 'ARMOR', 'CONSUMABLE', 'KEY', 'MATERIAL'] },
    rarity: { type: String, enum: ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'] },
    description: String,
    quantity: { type: Number, default: 1 },
    effects: Object
  }],
  achievements: [{
    id: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  loginStreak: { type: Number, default: 1 },
  lastLoginDate: { type: Date, default: Date.now },
  questHistory: [{
    date: { type: Date, default: Date.now },
    questsCompleted: Number,
    xpEarned: Number
  }],
  // System Awakening Fields
  momentum: { type: Number, default: 0 }, // 0 to 100
  lastCategoryAction: {
    type: Map,
    of: Date,
    default: {}
  }
}, {
  timestamps: true
});

// Calculate overall level from category levels
playerSchema.virtual('calculatedOverallLevel').get(function() {
  const selectedCats = this.selectedCategories || [];
  if (selectedCats.length === 0) return 1;
  
  const totalLevel = selectedCats.reduce((sum, cat) => {
    return sum + (this.categories[cat]?.level || 1);
  }, 0);
  
  return Math.floor(totalLevel / selectedCats.length);
});

module.exports = mongoose.model('Player', playerSchema);
