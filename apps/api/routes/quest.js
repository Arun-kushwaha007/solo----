const express = require('express');
const { createQuest, getQuests, acceptQuest, completeQuest, getQuestEvidence } = require('../controllers/quest');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createQuest); // Should be admin only, but open for MVP setup
router.get('/', getQuests);
router.post('/:id/accept', acceptQuest);
router.patch('/:id/complete', completeQuest);
router.get('/:id/evidence', getQuestEvidence);

module.exports = router;
