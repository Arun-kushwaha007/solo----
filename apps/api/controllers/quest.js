const Quest = require('../models/Quest');
const UserQuest = require('../models/UserQuest');
const LevelingService = require('../services/leveling');
const QuestVerificationService = require('../services/questVerification');
const XPRulesEngine = require('../services/xpRulesEngine');

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

    console.log('=== QUEST API DEBUG ===');
    console.log('User ID:', req.user.id);
    console.log('Total quests in DB:', quests.length);
    console.log('User quests:', userQuests.length);
    console.log('=======================');

    const result = quests.map(q => {
      const uq = userQuests.find(uq => uq.quest.toString() === q._id.toString());
      const questObj = q.toObject();
      
      // Add tasks array for frontend compatibility
      // If quest has requirements, convert to tasks, otherwise use default
      const tasks = [];
      if (questObj.requirements && questObj.requirements.size > 0) {
        for (const [key, value] of questObj.requirements) {
          tasks.push({
            id: key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            target: value,
            current: uq?.progress?.get(key) || 0
          });
        }
      } else {
        // Default tasks for quests without requirements
        tasks.push(
          { id: 'pushups', label: 'Pushups', target: 10, current: 0 },
          { id: 'squats', label: 'Squats', target: 10, current: 0 }
        );
      }
      
      return {
        ...questObj,
        id: questObj._id,
        tasks,
        completed: uq?.status === 'COMPLETED',
        userStatus: uq ? uq.status : 'AVAILABLE',
        userProgress: uq ? uq.progress : {},
      };
    });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('Quest API error:', err);
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
// @route   PATCH /api/quests/:id/complete
// @access  Private
exports.completeQuest = async (req, res, next) => {
  try {
    const { evidence, sensorData } = req.body;
    
    // Find active user quest
    const userQuest = await UserQuest.findOne({ user: req.user.id, quest: req.params.id });
    if (!userQuest) return res.status(404).json({ success: false, error: 'Quest not active' });
    if (userQuest.status === 'COMPLETED') return res.status(400).json({ success: false, error: 'Already completed' });

    const quest = await Quest.findById(req.params.id);

    // 1. Verify Quest Completion
    const verificationResult = await QuestVerificationService.verifyQuest(userQuest, evidence, sensorData);

    if (!verificationResult.verified) {
      if (verificationResult.requiresAdmin) {
        userQuest.verificationStatus = 'PENDING';
        if (evidence) userQuest.evidence = evidence;
        if (sensorData) userQuest.sensorData = sensorData;
        await userQuest.save();

        return res.status(200).json({
          success: true,
          data: {
            userQuest,
            message: 'Quest submitted for verification',
            verification: verificationResult
          }
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Verification failed',
        details: verificationResult
      });
    }

    // 2. Calculate XP Rewards
    const xpResult = await XPRulesEngine.calculateQuestXP(quest, userQuest, req.user.id);

    // 3. Update UserQuest Status & Rewards
    userQuest.status = 'COMPLETED';
    userQuest.completedAt = Date.now();
    userQuest.verificationStatus = 'VERIFIED';
    userQuest.verificationMethod = verificationResult.method;
    userQuest.xpAwarded = xpResult.totalXP;
    userQuest.xpBreakdown = xpResult.breakdown;
    
    if (evidence) {
        userQuest.evidence = evidence;
    }
    if (sensorData) {
        userQuest.sensorData = sensorData;
    }

    await userQuest.save();

    // 4. Apply XP to User Profile
    const levelingResult = await LevelingService.addXp(req.user.id, xpResult.totalXP);

    res.status(200).json({
      success: true,
      data: {
        userQuest,
        rewards: {
            xp: xpResult.totalXP,
            breakdown: xpResult.breakdown
        },
        leveling: levelingResult,
        verification: verificationResult
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get quest evidence
// @route   GET /api/quests/:id/evidence
// @access  Private
exports.getQuestEvidence = async (req, res, next) => {
  try {
    const userQuest = await UserQuest.findOne({ user: req.user.id, quest: req.params.id });
    if (!userQuest) return res.status(404).json({ success: false, error: 'Quest not found or not active' });

    res.status(200).json({
      success: true,
      data: userQuest.evidence || []
    });
  } catch (err) {
    next(err);
  }
};
