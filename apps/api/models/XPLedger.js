const mongoose = require('mongoose');

const XPLedgerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  source: {
    type: String,
    enum: ['QUEST', 'MANUAL', 'DECAY', 'SYSTEM', 'ACHIEVEMENT'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('XPLedger', XPLedgerSchema);
