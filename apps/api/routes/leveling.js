const express = require('express');
const { addXp, getSkills, unlockSkill } = require('../controllers/leveling');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/xp', addXp);
router.get('/skills', getSkills);
router.post('/skills/unlock', unlockSkill);

module.exports = router;
