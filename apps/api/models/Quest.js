const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MAIN', 'SUDDEN'],
    default: 'DAILY',
  },
  difficulty: {
    type: String,
    enum: ['E', 'D', 'C', 'B', 'A', 'S'],
    default: 'E',
  },
  rewards: {
    xp: { type: Number, default: 100 },
    gold: { type: Number, default: 0 },
    items: [String],
  },
  requirements: {
    type: Map,
    of: Number, // e.g., { "pushups": 100, "km_run": 10 }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Quest', QuestSchema);
