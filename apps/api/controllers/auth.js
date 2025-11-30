const User = require('../models/User');
const Player = require('../models/Player');
const RefreshToken = require('../models/RefreshToken');
const PasswordReset = require('../models/PasswordReset');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/email.service');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, displayName, timezone } = req.body;

    // Validate request
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email and password' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      displayName: displayName || name,
      timezone: timezone || 'Asia/Kolkata',
    });

    // Create player document for the new user
    await Player.create({
      userId: user._id,
      name: displayName || name,
      selectedCategories: [], // Will be set during onboarding
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(email, displayName || name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    await sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    await sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'Refresh token required' });
    }

    // Find the refresh token in database
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDoc || !tokenDoc.isValid()) {
      return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      
      // Get user
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found' });
      }

      // Revoke old refresh token and create new one (token rotation)
      const newRefreshToken = jwt.sign(
        { id: user._id, roles: user.roles },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
      );

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create new refresh token document
      await RefreshToken.create({
        userId: user._id,
        token: newRefreshToken,
        expiresAt,
      });

      // Mark old token as replaced
      tokenDoc.isRevoked = true;
      tokenDoc.replacedBy = newRefreshToken;
      await tokenDoc.save();

      // Create new access token
      const accessToken = jwt.sign(
        { id: user._id, roles: user.roles },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
      );

      res.status(200).json({
        success: true,
        token: accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          name: user.name,
          displayName: user.displayName,
          email: user.email,
          roles: user.roles,
        },
      });
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Create password reset token
    const resetToken = await PasswordReset.createResetToken(user._id);

    // Send email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken.token, user.displayName || user.name);
      
      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return res.status(500).json({
        success: false,
        error: 'Error sending password reset email. Please try again later.',
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide token and new password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // Verify and use the reset token
    let resetToken;
    try {
      resetToken = await PasswordReset.verifyAndUseToken(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Get user and update password
    const user = await User.findById(resetToken.userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.password = password;
    await user.save();

    // Revoke all existing refresh tokens for security
    await RefreshToken.revokeAllUserTokens(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke the specific refresh token
      await RefreshToken.revokeToken(refreshToken);
    }

    // Optionally revoke all user tokens
    if (req.query.all === 'true') {
      await RefreshToken.revokeAllUserTokens(req.user.id);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  // Create access token
  const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });

  // Create refresh token
  const refreshToken = jwt.sign(
    { id: user._id, roles: user.roles },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  // Store refresh token in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    expiresAt,
  });

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        roles: user.roles,
        timezone: user.timezone,
      },
    });
};
