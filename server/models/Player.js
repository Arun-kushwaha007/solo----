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
  hp: { type: Number, default: 100 },
  maxHp: { type: Number, default: 100 },
  mp: { type: Number, default: 100 },
  maxMp: { type: Number, default: 100 },
  fatigue: { type: Number, default: 0 },
  gold: { type: Number, default: 0 }
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
