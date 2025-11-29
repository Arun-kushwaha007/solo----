const mongoose = require('mongoose');

const UserQuestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest',
    required: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'FAILED'],
    default: 'ACTIVE',
  },
  progress: {
    type: Map,
    of: Number, // e.g., { "pushups": 50 } (Current progress)
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserQuest', UserQuestSchema);
