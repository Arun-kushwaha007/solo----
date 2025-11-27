const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: String,
  label: String,
  current: {
    type: Number,
    default: 0,
  },
  target: Number,
  unit: String,
});

const questSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    default: 'E',
  },
  tasks: [taskSchema],
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  rewards: {
    xp: {
      type: Number,
      default: 0,
    },
    gold: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for userId and questId
questSchema.index({ userId: 1, questId: 1 }, { unique: true });

module.exports = mongoose.model('Quest', questSchema);
