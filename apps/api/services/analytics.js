const UserQuest = require('../models/UserQuest');
const Profile = require('../models/Profile');

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
  // For MVP, we'll return mock data structure
  // In production, you'd track XP changes in a separate collection
  const profile = await Profile.findOne({ user: userId });
  
  if (!profile) {
    return [];
  }

  // Mock daily XP gain (in production, track this properly)
  const dailyXp = profile.xp / days;
  
  const trend = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    trend.push({
      date: date.toISOString().split('T')[0],
      xp: Math.floor(dailyXp * (days - i))
    });
  }
  
  return trend;
};

// @desc    Project trajectory (12-week forecast)
exports.projectTrajectory = async (userId) => {
  const profile = await Profile.findOne({ user: userId });
  
  if (!profile) {
    return [];
  }

  // Calculate average XP per week (mock for MVP)
  const weeklyXp = profile.xp / 4; // Assume 4 weeks of data
  
  const projection = [];
  let currentXp = profile.xp;
  
  for (let week = 1; week <= 12; week++) {
    currentXp += weeklyXp;
    const projectedLevel = Math.floor(0.1 * Math.sqrt(currentXp)) + 1;
    
    projection.push({
      week,
      xp: Math.floor(currentXp),
      level: projectedLevel
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
    { subject: 'Agility', A: profile.stats.agility || 0, fullMark: 100 }, // Mapping Agility to Endurance/Agility in profile
    { subject: 'Intelligence', A: profile.stats.focus || 0, fullMark: 100 }, // Mapping Intelligence to Focus
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
  // Mock calculation for now based on profile/activity
  return {
    momentum: 65, // Placeholder logic
    productivityScore: 78,
    streak: 3
  };
};

// @desc    Get AI Recommendation
exports.getRecommendation = async (userId) => {
  // Mock recommendation logic
  return {
    category: 'physical',
    level: 1,
    message: "Your vitality is low. Consider a 15-minute run to boost your baseline.",
    mood: 'NEUTRAL',
    entropy: {
      physical: { isDecaying: false },
      mental: { isDecaying: true },
      social: { isDecaying: false }
    }
  };
};
