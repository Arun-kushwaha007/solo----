const Profile = require('../models/Profile');

// XP Curve Constant
const CONSTANT = 0.1; // Adjust for difficulty

exports.calculateLevel = (xp) => {
  // XP = (Level / Constant) ^ 2
  // Level = Constant * Sqrt(XP)
  return Math.floor(CONSTANT * Math.sqrt(xp)) + 1;
};

exports.getXpForLevel = (level) => {
  // XP = (Level / Constant) ^ 2
  return Math.pow(level / CONSTANT, 2);
};

exports.addXp = async (userId, amount) => {
  const profile = await Profile.findOne({ user: userId });
  if (!profile) throw new Error('Profile not found');

  const oldLevel = profile.level;
  profile.xp += amount;
  
  const newLevel = exports.calculateLevel(profile.xp);
  
  let leveledUp = false;
  if (newLevel > oldLevel) {
    leveledUp = true;
    const levelsGained = newLevel - oldLevel;
    profile.level = newLevel;
    // Grant stats/skill points
    profile.stats.strength += levelsGained; // Auto-increment for now
    profile.stats.agility += levelsGained;
    profile.stats.intelligence += levelsGained;
    profile.stats.vitality += levelsGained;
    profile.stats.perception += levelsGained;
    
    // Add logic for Skill Points if schema supports it (assuming it does or will)
    // profile.skillPoints += levelsGained; 
  }

  await profile.save();
  
  return {
    profile,
    leveledUp,
    levelsGained: newLevel - oldLevel
  };
};
