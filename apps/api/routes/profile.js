const express = require('express');
const {
  getProfile,
  updateProfile,
  updateHealthConstraints,
  updatePersona,
  addGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/profile.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/health', updateHealthConstraints);
router.put('/persona', updatePersona);
router.post('/goals', addGoal);
router.put('/goals/:goalId', updateGoal);
router.delete('/goals/:goalId', deleteGoal);

module.exports = router;
