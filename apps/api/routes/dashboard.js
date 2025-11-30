const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDashboardSummary } = require('../controllers/dashboard');

router.get('/summary', protect, getDashboardSummary);

module.exports = router;
