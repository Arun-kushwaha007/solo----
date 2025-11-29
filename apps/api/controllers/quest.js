const Quest = require('../models/Quest');
const UserQuest = require('../models/UserQuest');
const LevelingService = require('../services/leveling');

// @desc    Create a new quest (Admin/System)
// @route   POST /api/quests
// @access  Private (Admin)
exports.createQuest = async (req, res, next) => {
  try {
    const quest = await Quest.create(req.body);
    res.status(201).json({ success: true, data: quest });
  } catch (err) {
    next(err);
  }
};

// @desc    Get available quests (or active user quests)
// @route   GET /api/quests
// @access  Private
exports.getQuests = async (req, res, next) => {
  try {
    // For MVP, we'll just return all system quests and attach user status if exists
    const quests = await Quest.find();
    const userQuests = await UserQuest.find({ user: req.user.id });

    const result = quests.map(q => {
      const uq = userQuests.find(uq => uq.quest.toString() === q._id.toString());
      return {
        ...q.toObject(),
        userStatus: uq ? uq.status : 'AVAILABLE',
        userProgress: uq ? uq.progress : {},
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept a quest
// @route   POST /api/quests/:id/accept
// @access  Private
exports.acceptQuest = async (req, res, next) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ success: false, error: 'Quest not found' });

    let userQuest = await UserQuest.findOne({ user: req.user.id, quest: req.params.id });
    if (userQuest) return res.status(400).json({ success: false, error: 'Quest already accepted' });

    userQuest = await UserQuest.create({
      user: req.user.id,
      quest: req.params.id,
      status: 'ACTIVE',
      progress: {}, // Init progress
    });

    res.status(200).json({ success: true, data: userQuest });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete a quest
// @route   POST /api/quests/:id/complete
// @access  Private
exports.completeQuest = async (req, res, next) => {
  try {
    const userQuest = await UserQuest.findOne({ user: req.user.id, quest: req.params.id });
    if (!userQuest) return res.status(404).json({ success: false, error: 'Quest not active' });
    if (userQuest.status === 'COMPLETED') return res.status(400).json({ success: false, error: 'Already completed' });

    const quest = await Quest.findById(req.params.id);

    // Verify requirements (Skipped for MVP - assuming trusted client/mock)
    
    userQuest.status = 'COMPLETED';
    userQuest.completedAt = Date.now();
    await userQuest.save();

    // Award XP
    const levelingResult = await LevelingService.addXp(req.user.id, quest.rewards.xp);

    res.status(200).json({
      success: true,
      data: {
        userQuest,
        rewards: quest.rewards,
        leveling: levelingResult
      }
    });
  } catch (err) {
    next(err);
  }
};
