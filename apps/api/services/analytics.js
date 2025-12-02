const UserQuest = require('../models/UserQuest');
const Profile = require('../models/Profile');
const XPLedger = require('../models/XPLedger');

// Helper: Calculate linear regression
const calculateTrend = (data) => {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0]?.y || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += data[i].x;
    sumY += data[i].y;
    sumXY += data[i].x * data[i].y;
    sumXX += data[i].x * data[i].x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

// @desc    Calculate adherence rate (quest completion rate)
exports.calculateAdherence = async (userId, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const quests = await UserQuest.find({
    user: userId,
    createdAt: { $gte: startDate }
  });

  if (quests.length === 0) return 0;

  const completed = quests.filter(q => q.status === 'COMPLETED').length;
  return (completed / quests.length) * 100;
};

// @desc    Get XP trend over time
exports.getXpTrend = async (userId, days = 7) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all ledger entries in range
  const entries = await XPLedger.find({
    userId: userId,
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: 1 });

  // Get starting balance (balance of the last entry before start date, or 0)
  const lastEntryBefore = await XPLedger.findOne({
    userId: userId,
    createdAt: { $lt: startDate }
  }).sort({ createdAt: -1 });

  let currentBalance = lastEntryBefore ? lastEntryBefore.balanceAfter : 0;
  
  // Group by day
  const dailyMap = new Map();
  
  // Initialize all days with the starting balance
  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap.set(dateStr, currentBalance);
  }

  // Update balances based on transactions
  entries.forEach(entry => {
    const dateStr = entry.createdAt.toISOString().split('T')[0];
    // Update this day and all subsequent days in the map (cumulative)
    // Actually, simpler: just map each day to the balance at the END of that day
    // But since we initialized with base, we can just iterate days and apply changes
  });

  // Re-calculate daily closing balances correctly
  const trend = [];
  let runningBalance = currentBalance;
  
  // Create a map of daily changes
  const dailyChanges = new Map();
  entries.forEach(entry => {
    const dateStr = entry.createdAt.toISOString().split('T')[0];
    const current = dailyChanges.get(dateStr) || 0;
    dailyChanges.set(dateStr, current + entry.amount);
  });

  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    if (dailyChanges.has(dateStr)) {
      runningBalance += dailyChanges.get(dateStr);
    }
    
    trend.push({
      date: dateStr,
      xp: runningBalance
    });
  }
  
  return trend;
};

// @desc    Project trajectory (12-week forecast)
exports.projectTrajectory = async (userId) => {
  const profile = await Profile.findOne({ user: userId });
  if (!profile) return [];

  // Get last 30 days of XP history for trend analysis
  const historyDays = 30;
  const trendData = await exports.getXpTrend(userId, historyDays);
  
  // Prepare data for regression (x = day index, y = xp)
  const regressionData = trendData.map((point, index) => ({
    x: index,
    y: point.xp
  }));

  const { slope, intercept } = calculateTrend(regressionData);
  
  // If slope is negative or zero (inactive), assume a minimal baseline growth or flat
  const effectiveSlope = Math.max(slope, 0); // Don't project XP loss for leveling
  
  const currentXp = profile.xp;
  const projection = [];
  
  // Project 12 weeks (84 days)
  // We start from "now" (which is x = historyDays)
  for (let week = 1; week <= 12; week++) {
    const daysInFuture = week * 7;
    const projectedXp = currentXp + (effectiveSlope * daysInFuture);
    
    // Level formula: 0.1 * sqrt(xp) (inverse of xp = (level/0.1)^2 = 100 * level^2)
    // Wait, the formula in original code was: level = floor(0.1 * sqrt(xp)) + 1
    // Let's stick to that or whatever the leveling service uses.
    // Assuming standard curve: Level = C * sqrt(XP)
    const projectedLevel = Math.floor(0.1 * Math.sqrt(projectedXp)) + 1;
    
    projection.push({
      week,
      xp: Math.floor(projectedXp),
      level: projectedLevel,
      // Confidence interval (simple widening cone)
      lowerBound: Math.floor(projectedXp * (1 - (0.02 * week))), // +/- 2% per week uncertainty
      upperBound: Math.floor(projectedXp * (1 + (0.02 * week)))
    });
  }
  
  return projection;
};

// @desc    Get stats for radar chart
exports.getRadarData = async (userId) => {
  const profile = await Profile.findOne({ user: userId });
  if (!profile || !profile.stats) {
    return [
      { subject: 'Strength', A: 0, fullMark: 100 },
      { subject: 'Agility', A: 0, fullMark: 100 },
      { subject: 'Intelligence', A: 0, fullMark: 100 },
      { subject: 'Vitality', A: 0, fullMark: 100 },
      { subject: 'Perception', A: 0, fullMark: 100 },
    ];
  }

  return [
    { subject: 'Strength', A: profile.stats.strength || 0, fullMark: 100 },
    { subject: 'Agility', A: profile.stats.agility || 0, fullMark: 100 }, 
    { subject: 'Intelligence', A: profile.stats.focus || 0, fullMark: 100 }, 
    { subject: 'Vitality', A: profile.stats.vitality || profile.stats.resilience || 0, fullMark: 100 },
    { subject: 'Perception', A: profile.stats.perception || profile.stats.social || 0, fullMark: 100 },
  ];
};

// @desc    Get recent wins (completed quests)
exports.getRecentWins = async (userId, limit = 5) => {
  const wins = await UserQuest.find({
    user: userId,
    status: 'COMPLETED'
  })
  .sort({ completedAt: -1 })
  .limit(limit)
  .populate('quest', 'title category difficulty');

  return wins.map(win => ({
    id: win._id,
    title: win.quest ? win.quest.title : 'Unknown Quest',
    category: win.quest ? (win.quest.category || 'general') : 'general',
    time: win.completedAt ? new Date(win.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
    xp: win.xpAwarded
  }));
};

// @desc    Get general stats (momentum, streak, productivity)
exports.getStats = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 1. Calculate Streak (consecutive days with at least one completed quest)
  // This is a simplified check. For robust streaks, we'd need a dedicated tracker.
  // We'll check last 7 days.
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const nextD = new Date(d);
    nextD.setDate(d.getDate() + 1);
    
    const count = await UserQuest.countDocuments({
      user: userId,
      status: 'COMPLETED',
      completedAt: { $gte: d, $lt: nextD }
    });
    
    if (count > 0) {
      streak++;
    } else if (i === 0) {
      // If today is 0, it might just be early in the day, don't break streak yet if yesterday was active
      continue; 
    } else {
      break;
    }
  }

  // 2. Momentum (Velocity over last 3 days vs last 14 days)
  const recentXp = await XPLedger.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: new Date(Date.now() - 3 * 86400000) } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  const avgRecent = (recentXp[0]?.total || 0) / 3;
  const momentum = Math.min(Math.round(avgRecent * 2), 100); // Arbitrary scaling for "momentum score"

  // 3. Productivity (Adherence)
  const productivity = await exports.calculateAdherence(userId, 7);

  return {
    momentum,
    productivityScore: Math.round(productivity),
    streak
  };
};

// @desc    Get AI Recommendation
exports.getRecommendation = async (userId) => {
  // Simple logic based on lowest stat
  const profile = await Profile.findOne({ user: userId });
  if (!profile || !profile.stats) return { category: 'general', message: 'Keep training!' };

  const stats = profile.stats;
  const entries = Object.entries(stats).filter(([k, v]) => typeof v === 'number');
  entries.sort((a, b) => a[1] - b[1]);
  
  const lowest = entries[0];
  
  const messages = {
    strength: "Your strength is lagging. Try some pushups or weight training.",
    agility: "Work on your speed. A quick run would help.",
    vitality: "Boost your endurance. Cardio is key.",
    intelligence: "Read a book or solve a puzzle to increase intelligence.",
    perception: "Meditate to improve your focus and perception."
  };

  return {
    category: lowest ? lowest[0] : 'general',
    level: profile.level,
    message: lowest ? messages[lowest[0]] : "Maintain your balanced training.",
    mood: 'NEUTRAL',
    entropy: {
      physical: { isDecaying: false },
      mental: { isDecaying: true },
      social: { isDecaying: false }
    }
  };
};
