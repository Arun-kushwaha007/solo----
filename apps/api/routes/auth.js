const express = require('express');
const { 
  register, 
  login, 
  refreshToken,
  forgotPassword,
  resetPassword,
  logout,
  getMe 
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const {
  loginLimiter,
  registerLimiter,
  refreshTokenLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require('../middleware/rateLimitAuth');

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshTokenLimiter, refreshToken);
router.post('/forgot', forgotPasswordLimiter, forgotPassword);
router.post('/reset', resetPasswordLimiter, resetPassword);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
