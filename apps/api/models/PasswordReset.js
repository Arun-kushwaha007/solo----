const mongoose = require('mongoose');
const crypto = require('crypto');

const PasswordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for automatic cleanup of expired tokens (after 24 hours)
PasswordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Method to check if token is valid
PasswordResetSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

// Static method to generate a secure reset token
PasswordResetSchema.statics.generateToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Static method to create a password reset request
PasswordResetSchema.statics.createResetToken = async function(userId) {
  // Invalidate any existing reset tokens for this user
  await this.updateMany(
    { userId, used: false },
    { used: true }
  );

  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  const resetToken = await this.create({
    userId,
    token,
    expiresAt,
  });

  return resetToken;
};

// Static method to verify and mark token as used
PasswordResetSchema.statics.verifyAndUseToken = async function(token) {
  const resetToken = await this.findOne({ token });

  if (!resetToken) {
    throw new Error('Invalid reset token');
  }

  if (!resetToken.isValid()) {
    throw new Error('Reset token has expired or already been used');
  }

  // Mark as used
  resetToken.used = true;
  await resetToken.save();

  return resetToken;
};

module.exports = mongoose.model('PasswordReset', PasswordResetSchema);
