const SkillNode = require('../models/SkillNode');
const Player = require('../models/Player');

exports.getSkillTree = async (category) => {
  const query = category ? { category } : {};
  return await SkillNode.find(query);
};

exports.unlockSkill = async (userId, skillId) => {
  const player = await Player.findOne({ userId });
  if (!player) throw new Error('Player not found');

  const skill = await SkillNode.findOne({ id: skillId });
  if (!skill) throw new Error('Skill not found');

  // Check if already unlocked
  if (player.unlockedSkills.includes(skillId)) {
    throw new Error('Skill already unlocked');
  }

  // Check cost
  if (player.availablePoints < skill.cost) {
    throw new Error('Insufficient skill points');
  }

  // Check prerequisites
  if (skill.prerequisites && skill.prerequisites.length > 0) {
    const hasPrereqs = skill.prerequisites.every(prereqId => player.unlockedSkills.includes(prereqId));
    if (!hasPrereqs) {
      throw new Error('Prerequisites not met');
    }
  }

  // Deduct points and unlock
  player.availablePoints -= skill.cost;
  player.unlockedSkills.push(skillId);
  
  // Apply bonuses (immediate stats)
  if (skill.bonuses) {
      // Logic to apply immediate stat bonuses if any
      // For passive bonuses like "xp_multiplier", they are calculated at runtime during XP award
      // For stat bonuses like "strength", apply now
      for (const [key, value] of skill.bonuses.entries()) {
          // Check if it's a base stat
          // This logic depends on where stats are stored. 
          // Assuming we apply to the category of the skill
          if (player.categories[skill.category] && player.categories[skill.category].stats[key]) {
             player.categories[skill.category].stats[key] += value;
          }
      }
  }

  await player.save();

  return player;
};
