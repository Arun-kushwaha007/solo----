const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    default: 'SUNG JIN-WOO',
  },
  job: {
    type: String,
    default: 'NONE',
  },
  title: {
    type: String,
    default: 'NONE',
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  xp: {
    type: Number,
    default: 0,
    min: 0,
  },
  xpToNextLevel: {
    type: Number,
    default: 100,
  },
  hp: {
    type: Number,
    default: 100,
  },
  maxHp: {
    type: Number,
    default: 100,
  },
  mp: {
    type: Number,
    default: 10,
  },
  maxMp: {
    type: Number,
    default: 10,
  },
  fatigue: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  stats: {
    strength: {
      type: Number,
      default: 10,
    },
    agility: {
      type: Number,
      default: 10,
    },
    sense: {
      type: Number,
      default: 10,
    },
    vitality: {
      type: Number,
      default: 10,
    },
    intelligence: {
      type: Number,
      default: 10,
    },
  },
  availablePoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  gold: {
    type: Number,
    default: 0,
    min: 0,
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
playerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Player', playerSchema);
