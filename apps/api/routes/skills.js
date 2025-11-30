const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const SkillService = require('../services/skill.service');

// @route   GET /api/skills
// @desc    Get skill tree (optional category filter)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { category } = req.query;
    const skills = await SkillService.getSkillTree(category);
    
    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/skills/unlock
// @desc    Unlock a skill
// @access  Private
router.post('/unlock', protect, async (req, res, next) => {
  try {
    const { skillId } = req.body;
    const player = await SkillService.unlockSkill(req.user.id, skillId);
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Skill unlocked successfully',
        unlockedSkills: player.unlockedSkills,
        availablePoints: player.availablePoints
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
