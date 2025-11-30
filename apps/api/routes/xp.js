const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const LevelingService = require('../services/leveling');

// @route   POST /api/xp/events
// @desc    Record a generic XP event (Admin/System only)
// @access  Private (Admin)
router.post('/events', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { userId, amount, source, details } = req.body;
    
    const result = await LevelingService.addXp(userId, amount, source, details);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
