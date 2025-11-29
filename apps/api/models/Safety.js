const mongoose = require('mongoose');

const SafetySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['CONSENT', 'MOOD_CHECK', 'CRISIS_RESOURCE_ACCESS'],
    required: true,
  },
  data: {
    // For CONSENT: { version: '1.0', agreed: true }
    // For MOOD_CHECK: { score: 2, note: 'Feeling okay' }
    // For CRISIS: { resourceId: 'suicide_hotline' }
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Safety', SafetySchema);
