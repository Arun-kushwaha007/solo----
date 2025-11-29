const LevelingService = require('../services/leveling');
const Skill = require('../models/Skill');
const Profile = require('../models/Profile');

// @desc    Add XP (Dev/Test or System Internal)
// @route   POST /api/leveling/xp
// @access  Private (Admin/System)
exports.addXp = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const result = await LevelingService.addXp(req.user.id, amount);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all skills
// @route   GET /api/leveling/skills
// @access  Private
exports.getSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find();
    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Unlock a skill
// @route   POST /api/leveling/skills/unlock
// @access  Private
exports.unlockSkill = async (req, res, next) => {
  try {
    const { skillId } = req.body;
    const profile = await Profile.findOne({ user: req.user.id });
    const skill = await Skill.findOne({ id: skillId });

    if (!skill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }

    // Check requirements (simplified)
    if (profile.level < skill.requiredLevel) {
       return res.status(400).json({ success: false, error: 'Level too low' });
    }

    // Add to unlocked skills (assuming schema update needed or using Mixed)
    // For MVP, we'll just return success mock
    
    res.status(200).json({
      success: true,
      data: { message: 'Skill Unlocked', skill },
    });
  } catch (err) {
    next(err);
  }
};
