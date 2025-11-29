const express = require('express');
const { getMe, updateDemographics, startCalibration, submitCalibration } = require('../controllers/profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

router.get('/me', getMe);
router.put('/demographics', updateDemographics);
router.post('/calibration/start', startCalibration);
router.post('/calibration/submit', submitCalibration);

module.exports = router;
