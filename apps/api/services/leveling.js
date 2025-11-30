const Player = require('../models/Player');
const XPLedger = require('../models/XPLedger');

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

exports.addXp = async (userId, amount, source = 'SYSTEM', details = {}) => {
  const player = await Player.findOne({ userId });
  if (!player) throw new Error('Player not found');

  const oldLevel = player.overallLevel;
  const oldXp = player.categories.physical.xp; // TODO: Distribute XP across categories or use global XP? 
  // For now, let's assume global XP is tracked or we update specific category.
  // The current Player model has category-specific XP. 
  // Let's assume 'amount' is applied to the 'overall' flow or a specific category if provided in details.
  
  // For this implementation, we'll simplify and say we are updating a specific category if provided, 
  // or defaulting to 'physical' for now as a fallback, or we need to update the Player model to have global XP.
  // Looking at Player.js, it has 'overallLevel' but XP is inside categories.
  // Let's assume we are updating the category specified in details.category, or default to first selected.
  
  const category = details.category || player.selectedCategories[0] || 'physical';
  
  if (!player.categories[category]) {
      // Initialize if missing
      player.categories[category] = { level: 1, xp: 0, xpToNextLevel: 100, stats: { primary: 10, secondary: 10, tertiary: 10 }, availablePoints: 0 };
  }

  const catProgress = player.categories[category];
  const oldCatLevel = catProgress.level;
  
  catProgress.xp += amount;
  
  // Check for level up
  // Using a simple formula for category level up for now, or the global one?
  // Let's use the global formula for category levels too for consistency
  const newCatLevel = exports.calculateLevel(catProgress.xp);
  
  let leveledUp = false;
  let levelsGained = 0;

  if (newCatLevel > oldCatLevel) {
    leveledUp = true;
    levelsGained = newCatLevel - oldCatLevel;
    catProgress.level = newCatLevel;
    
    // Grant stats/skill points
    catProgress.stats.primary += levelsGained; 
    catProgress.stats.secondary += levelsGained;
    catProgress.stats.tertiary += levelsGained;
    
    // Grant global available points for skills
    player.availablePoints = (player.availablePoints || 0) + levelsGained;
  }
  
  // Update overall level
  // Recalculate overall level based on average of selected categories
  // The virtual 'calculatedOverallLevel' does this, but we might want to store it for queries
  // player.overallLevel is a stored field, let's update it.
  const selectedCats = player.selectedCategories.length > 0 ? player.selectedCategories : ['physical'];
  const totalLevel = selectedCats.reduce((sum, cat) => sum + (player.categories[cat]?.level || 1), 0);
  player.overallLevel = Math.floor(totalLevel / selectedCats.length);

  await player.save();

  // Record in Ledger
  await XPLedger.create({
    userId,
    source,
    amount,
    details: { ...details, category, levelsGained },
    balanceAfter: catProgress.xp // Tracking category XP in ledger for now
  });
  
  return {
    player,
    leveledUp,
    levelsGained,
    category
  };
};
