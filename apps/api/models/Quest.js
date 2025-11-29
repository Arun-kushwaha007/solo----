const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questId: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['physical', 'mental', 'professional', 'creative', 'social', 'financial', 'spiritual'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    default: 'E'
  },
  tasks: [{
    id: String,
    label: String,
    current: { type: Number, default: 0 },
    target: Number,
    unit: String
  }],
  completed: {
    type: Boolean,
    default: false
  },
  rewards: {
    xp: Number,
    gold: Number
  }
}, {
  timestamps: true
});

// Compound index for user and quest ID
questSchema.index({ userId: 1, questId: 1 }, { unique: true });

module.exports = mongoose.model('Quest', questSchema);
