const express = require('express');
const { logSafetyEvent, getCrisisResources } = require('../controllers/safety');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/log', protect, logSafetyEvent);
router.get('/resources', getCrisisResources);

module.exports = router;
