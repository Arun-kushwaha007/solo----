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
// @desc    Allocate a stat point for a specific category
// @access  Private
router.post('/allocate-stat', protect, async (req, res) => {
  try {
    const { category, stat } = req.body;

    const validCategories = ['physical', 'mental', 'professional', 'creative', 'social', 'financial', 'spiritual'];
    const validStats = ['primary', 'secondary', 'tertiary'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    if (!validStats.includes(stat)) {
      return res.status(400).json({ message: 'Invalid stat name' });
    }

    const player = await Player.findOne({ userId: req.user._id });

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const categoryProgress = player.categories[category];
    if (!categoryProgress) {
      return res.status(400).json({ message: 'Category not found' });
    }

    if (categoryProgress.availablePoints <= 0) {
      return res.status(400).json({ message: 'No available stat points for this category' });
    }

    // Allocate the stat point
    player.categories[category].stats[stat] += 1;
    player.categories[category].availablePoints -= 1;
    
    // Mark the nested path as modified for Mongoose
    player.markModified('categories');
    
    await player.save();

    res.json({
      success: true,
      data: player,
    });
  } catch (error) {
    console.error('Error allocating stat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
