const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider: {
    type: String,
    required: true,
    enum: ['google_fit', 'apple_health', 'fitbit'],
  },
  accessToken: {
    type: String,
    required: true,
    select: false, // Protect tokens
  },
  refreshToken: {
    type: String,
    select: false, // Protect tokens
  },
  expiresAt: {
    type: Date,
  },
  scope: {
    type: [String],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSync: {
    type: Date,
  },
  metadata: {
    type: Map,
    of: String,
  },
}, {
  timestamps: true,
});

// Compound index to ensure one provider per user
IntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Integration', IntegrationSchema);
