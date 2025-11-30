const Profile = require('../models/Profile');
const UserQuest = require('../models/UserQuest');
const AnalyticsService = require('../services/analytics');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch Profile (Stats, XP, Rank)
    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // 2. Fetch Analytics (Adherence, XP Trend)
    const adherence = await AnalyticsService.calculateAdherence(userId, 7);
    const xpTrend = await AnalyticsService.getXpTrend(userId, 7);

    // 3. Fetch Recent Quests (Last 5)
    const recentQuests = await UserQuest.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('quest');

    // 4. Calculate Next Rank ETA
    // Simple calculation: (Next Level XP - Current XP) / Average Daily XP
    // For MVP, assume average daily XP = 100 if no history
    const averageDailyXp = 100; // This should be calculated from history in a real app
    const CONSTANT = 0.1;
    const nextLevel = profile.level + 1;
    const nextLevelXp = Math.pow(nextLevel / CONSTANT, 2);
    const xpNeeded = nextLevelXp - profile.xp;
    const daysToNextLevel = Math.ceil(xpNeeded / averageDailyXp);

    res.status(200).json({
      success: true,
      data: {
        stats: profile.stats,
        level: profile.level,
        xp: profile.xp,
        rank: profile.rank,
        title: profile.title,
        nextLevelXp,
        daysToNextLevel,
        adherence: Math.round(adherence),
        xpTrend,
        recentQuests
      }
    });
  } catch (err) {
    next(err);
  }
};
