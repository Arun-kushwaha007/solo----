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
