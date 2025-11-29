const express = require('express');
const router = express.Router();
const {
  startOnboarding,
  saveStepProgress,
  completeOnboarding,
  getProgress,
  resumeOnboarding,
} = require('../controllers/onboarding.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/start', startOnboarding);
router.put('/step/:stepId', saveStepProgress);
router.post('/complete', completeOnboarding);
router.get('/progress', getProgress);
router.post('/resume', resumeOnboarding);

module.exports = router;
