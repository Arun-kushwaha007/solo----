const express = require('express');
const { getDashboard } = require('../controllers/analytics');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);

module.exports = router;
