const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiateAuth,
  handleCallback,
  getData,
  ingestData,
} = require('../controllers/integration.controller');

// All routes are protected
router.use(protect);

router.get('/auth/:provider', initiateAuth);
router.post('/auth/:provider/callback', handleCallback);
router.get('/:provider/data', getData);
router.post('/:provider/ingest', ingestData);

module.exports = router;
