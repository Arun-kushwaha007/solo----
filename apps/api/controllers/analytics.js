const AnalyticsService = require('../services/analytics');

// @desc    Get user analytics dashboard
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const adherence = await AnalyticsService.calculateAdherence(req.user.id, 7);
    const xpTrend = await AnalyticsService.getXpTrend(req.user.id, 7);
    const trajectory = await AnalyticsService.projectTrajectory(req.user.id);
    const radarData = await AnalyticsService.getRadarData(req.user.id);
    const recentWins = await AnalyticsService.getRecentWins(req.user.id);
    const stats = await AnalyticsService.getStats(req.user.id);
    const recommendation = await AnalyticsService.getRecommendation(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        adherence: Math.round(adherence),
        xpTrend,
        trajectory,
        radarData,
        activityData: xpTrend, // Reuse xpTrend for activityData
        recentWins,
        stats,
        recommendation
      }
    });
  } catch (err) {
    next(err);
  }
};
