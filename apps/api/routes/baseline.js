const express = require('express');
const router = express.Router();
const {
  startBaseline,
  stopBaseline,
  ingestData,
  submitTest,
  getMetrics,
  getProgress,
} = require('../controllers/baseline.controller');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/start', startBaseline);
router.post('/stop', stopBaseline);
router.post('/data', ingestData);
router.post('/test/:testType', submitTest);
router.get('/metrics', getMetrics);
router.get('/progress', getProgress);

module.exports = router;
