const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');

// @route   GET /api/player
// @desc    Get player data for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const player = await Player.findOne({ userId: req.user._id });

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.json({
      success: true,
      data: player,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/player/allocate-stat
// @desc    Allocate a stat point
// @access  Private
router.post('/allocate-stat', protect, async (req, res) => {
  try {
    const { stat } = req.body;

    const validStats = ['strength', 'agility', 'sense', 'vitality', 'intelligence'];
    if (!validStats.includes(stat)) {
      return res.status(400).json({ message: 'Invalid stat name' });
    }

    const player = await Player.findOne({ userId: req.user._id });

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (player.availablePoints <= 0) {
      return res.status(400).json({ message: 'No available stat points' });
    }

    // Allocate the stat point
    player.stats[stat] += 1;
    player.availablePoints -= 1;
    await player.save();

    res.json({
      success: true,
      data: player,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
