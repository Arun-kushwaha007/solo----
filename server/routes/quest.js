const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Quest = require('../models/Quest');
const Player = require('../models/Player');

// @route   GET /api/quests
// @desc    Get all quests for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const quests = await Quest.find({ userId: req.user._id });

    res.json({
      success: true,
      data: quests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/quests/:questId/task/:taskId
// @desc    Update task progress
// @access  Private
router.put('/:questId/task/:taskId', protect, async (req, res) => {
  try {
    const { questId, taskId } = req.params;
    const { amount = 1 } = req.body;

    const quest = await Quest.findOne({
      userId: req.user._id,
      questId: parseInt(questId),
    });

    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    if (quest.completed) {
      return res.status(400).json({ message: 'Quest already completed' });
    }

    // Find and update task
    const task = quest.tasks.find((t) => t.id === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.current = Math.min(task.current + amount, task.target);
    await quest.save();

    res.json({
      success: true,
      data: quest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quests/:questId/complete
// @desc    Complete a quest and give rewards
// @access  Private
router.post('/:questId/complete', protect, async (req, res) => {
  try {
    const { questId } = req.params;

    const quest = await Quest.findOne({
      userId: req.user._id,
      questId: parseInt(questId),
    });

    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    if (quest.completed) {
      return res.status(400).json({ message: 'Quest already completed' });
    }

    // Check if all tasks are done
    const allTasksComplete = quest.tasks.every((t) => t.current >= t.target);
    if (!allTasksComplete) {
      return res.status(400).json({ message: 'Not all tasks completed' });
    }

    // Mark quest as completed
    quest.completed = true;
    quest.completedAt = Date.now();
    await quest.save();

    // Give rewards to player
    const player = await Player.findOne({ userId: req.user._id });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Add XP and check for level up
    let newXp = player.xp + quest.rewards.xp;
    let newLevel = player.level;
    let newXpToNext = player.xpToNextLevel;
    let newPoints = player.availablePoints;

    // Level up logic
    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = Math.floor(newXpToNext * 1.5);
      newPoints += 3;
      // Heal on level up
      player.hp = player.maxHp;
      player.mp = player.maxMp;
      player.fatigue = 0;
    }

    player.level = newLevel;
    player.xp = newXp;
    player.xpToNextLevel = newXpToNext;
    player.availablePoints = newPoints;
    player.gold += quest.rewards.gold;

    await player.save();

    res.json({
      success: true,
      data: {
        quest,
        player,
        leveledUp: newLevel > player.level,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
