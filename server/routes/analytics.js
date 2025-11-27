const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');
const Quest = require('../models/Quest');

// @route   GET /api/analytics
// @desc    Get aggregated player analytics
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const player = await Player.findOne({ userId: req.user._id });
    
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // 1. Radar Chart Data (Life Balance)
    const radarData = player.selectedCategories.map(cat => ({
      subject: cat.charAt(0).toUpperCase() + cat.slice(1),
      A: player.categories[cat].level,
      fullMark: 100
    }));

    // 2. System Awakening Logic (Entropy & Momentum)
    const now = new Date();
    const entropyData = {};
    let totalEntropy = 0;

    player.selectedCategories.forEach(cat => {
      const lastAction = player.lastCategoryAction?.get(cat) || player.createdAt;
      const daysSince = Math.floor((now - new Date(lastAction)) / (1000 * 60 * 60 * 24));
      
      // Entropy increases if neglected for more than 3 days
      const isDecaying = daysSince > 3;
      entropyData[cat] = {
        daysSince,
        isDecaying,
        decayLevel: isDecaying ? Math.min((daysSince - 3) * 10, 100) : 0
      };
      
      if (isDecaying) totalEntropy++;
    });

    // Calculate Momentum (Based on recent quest history)
    // Simple logic: Sum of quests in last 3 days
    const recentQuests = player.questHistory
      .filter(h => (now - new Date(h.date)) < (1000 * 60 * 60 * 24 * 3))
      .reduce((acc, curr) => acc + curr.questsCompleted, 0);
    
    // Momentum score 0-100 (capped at 10 quests in 3 days)
    const momentumScore = Math.min(recentQuests * 10, 100); 
    
    // Update player momentum if changed (optional, could be done on quest complete)
    if (player.momentum !== momentumScore) {
      player.momentum = momentumScore;
      await player.save();
    }

    // 3. The Architect (System AI)
    let architectMessage = "System operating within normal parameters.";
    let architectMood = "NEUTRAL"; // NEUTRAL, WARNING, DANGER, PRAISE

    if (totalEntropy > 2) {
      architectMessage = "CRITICAL WARNING: Multiple life sectors are collapsing. Entropy levels exceeding safety thresholds. Immediate action required.";
      architectMood = "DANGER";
    } else if (totalEntropy > 0) {
      architectMessage = "Decay detected. Neglect is a slow poison. Stabilize your stats before permanent regression occurs.";
      architectMood = "WARNING";
    } else if (momentumScore > 80) {
      architectMessage = "Momentum at peak efficiency. You are becoming a force of nature. Maintain velocity.";
      architectMood = "PRAISE";
    } else if (momentumScore < 20) {
      architectMessage = "Stagnation detected. An object at rest stays at rest. Force yourself to move.";
      architectMood = "WARNING";
    }

    const recommendation = {
      category: 'System',
      level: momentumScore,
      message: architectMessage,
      mood: architectMood,
      entropy: entropyData
    };

    // 4. Activity Data (Last 7 Days)
    const activityData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const xp = Math.floor(Math.random() * 150) + 50; // Mock data
      
      activityData.push({
        name: dayName,
        xp: xp,
        tasks: Math.floor(xp / 30) // Mock task count
      });
    }

    // 5. Recent Wins (Mock for now, would query Quest history)
    const recentWins = [
      { id: 1, title: 'Morning Workout', category: 'physical', time: '2 hours ago' },
      { id: 2, title: 'Read 10 Pages', category: 'mental', time: '5 hours ago' },
      { id: 3, title: 'Budget Review', category: 'financial', time: 'Yesterday' }
    ];

    // 6. Stats & Productivity
    const stats = {
      streak: player.loginStreak || 1,
      totalQuests: await Quest.countDocuments({ userId: req.user._id, completed: true }),
      completionRate: 85,
      productivityScore: 92, // Daily score
      rank: player.title,
      momentum: momentumScore
    };

    res.json({
      success: true,
      data: {
        radarData,
        activityData,
        recommendation, // Contains Architect data
        recentWins,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
