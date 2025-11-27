const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Player = require('../models/Player');
const Quest = require('../models/Quest');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

// Quest templates for all categories
const QUEST_TEMPLATES = {
  physical: {
    beginner: {
      title: 'DAILY QUEST: FOUNDATION TRAINING',
      description: 'Build your foundation. Start small, grow strong.',
      difficulty: 'E',
      tasks: [
        { id: 't1', label: 'PUSH-UPS', current: 0, target: 10 },
        { id: 't2', label: 'SIT-UPS', current: 0, target: 15 },
        { id: 't3', label: 'SQUATS', current: 0, target: 20 },
        { id: 't4', label: 'WALKING', current: 0, target: 1, unit: 'KM' }
      ],
      rewards: { xp: 30, gold: 500 }
    },
    intermediate: {
      title: 'DAILY QUEST: STRENGTH BUILDING',
      description: 'Push your limits. Become stronger each day.',
      difficulty: 'D',
      tasks: [
        { id: 't1', label: 'PUSH-UPS', current: 0, target: 25 },
        { id: 't2', label: 'SIT-UPS', current: 0, target: 30 },
        { id: 't3', label: 'SQUATS', current: 0, target: 40 },
        { id: 't4', label: 'RUNNING', current: 0, target: 3, unit: 'KM' }
      ],
      rewards: { xp: 50, gold: 1000 }
    },
    advanced: {
      title: 'DAILY QUEST: ELITE TRAINING',
      description: 'Challenge accepted. Prove your strength.',
      difficulty: 'C',
      tasks: [
        { id: 't1', label: 'PUSH-UPS', current: 0, target: 50 },
        { id: 't2', label: 'SIT-UPS', current: 0, target: 50 },
        { id: 't3', label: 'SQUATS', current: 0, target: 100 },
        { id: 't4', label: 'RUNNING', current: 0, target: 5, unit: 'KM' }
      ],
      rewards: { xp: 100, gold: 2000 }
    }
  },
  mental: {
    beginner: {
      title: 'DAILY QUEST: KNOWLEDGE SEEKER',
      description: 'Feed your mind. Knowledge is power.',
      difficulty: 'E',
      tasks: [
        { id: 't1', label: 'READ', current: 0, target: 20, unit: 'PAGES' },
        { id: 't2', label: 'LEARN NEW CONCEPT', current: 0, target: 1 },
        { id: 't3', label: 'PRACTICE SKILL', current: 0, target: 30, unit: 'MIN' }
      ],
      rewards: { xp: 30, gold: 500 }
    },
    intermediate: {
      title: 'DAILY QUEST: MIND EXPANSION',
      description: 'Sharpen your intellect. Master new skills.',
      difficulty: 'D',
      tasks: [
        { id: 't1', label: 'READ', current: 0, target: 40, unit: 'PAGES' },
        { id: 't2', label: 'COMPLETE COURSE MODULE', current: 0, target: 1 },
        { id: 't3', label: 'PRACTICE SKILL', current: 0, target: 60, unit: 'MIN' },
        { id: 't4', label: 'SOLVE PROBLEMS', current: 0, target: 3 }
      ],
      rewards: { xp: 50, gold: 1000 }
    },
    advanced: {
      title: 'DAILY QUEST: INTELLECTUAL MASTERY',
      description: 'Push the boundaries of your knowledge.',
      difficulty: 'C',
      tasks: [
        { id: 't1', label: 'READ', current: 0, target: 60, unit: 'PAGES' },
        { id: 't2', label: 'COMPLETE ADVANCED MODULE', current: 0, target: 1 },
        { id: 't3', label: 'DEEP PRACTICE', current: 0, target: 120, unit: 'MIN' },
        { id: 't4', label: 'SOLVE HARD PROBLEMS', current: 0, target: 5 }
      ],
      rewards: { xp: 100, gold: 2000 }
    }
  },
  professional: {
    beginner: {
      title: 'DAILY QUEST: CAREER FOUNDATION',
      description: 'Build your professional skills.',
      difficulty: 'E',
      tasks: [
        { id: 't1', label: 'WORK ON PROJECT', current: 0, target: 1, unit: 'HOUR' },
        { id: 't2', label: 'LEARN WORK SKILL', current: 0, target: 30, unit: 'MIN' },
        { id: 't3', label: 'ORGANIZE TASKS', current: 0, target: 1 }
      ],
      rewards: { xp: 30, gold: 500 }
    },
    intermediate: {
      title: 'DAILY QUEST: CAREER GROWTH',
      description: 'Advance your professional journey.',
      difficulty: 'D',
      tasks: [
        { id: 't1', label: 'WORK ON PROJECT', current: 0, target: 2, unit: 'HOURS' },
        { id: 't2', label: 'NETWORK', current: 0, target: 1, unit: 'PERSON' },
        { id: 't3', label: 'SKILL PRACTICE', current: 0, target: 1, unit: 'HOUR' }
      ],
      rewards: { xp: 50, gold: 1000 }
    },
    advanced: {
      title: 'DAILY QUEST: PROFESSIONAL EXCELLENCE',
      description: 'Lead and innovate in your field.',
      difficulty: 'C',
      tasks: [
        { id: 't1', label: 'WORK ON PROJECT', current: 0, target: 4, unit: 'HOURS' },
        { id: 't2', label: 'NETWORK', current: 0, target: 3, unit: 'PEOPLE' },
        { id: 't3', label: 'MENTOR/TEACH', current: 0, target: 1, unit: 'HOUR' },
        { id: 't4', label: 'INNOVATE', current: 0, target: 1, unit: 'IDEA' }
      ],
      rewards: { xp: 100, gold: 2000 }
    }
  },
  creative: {
    beginner: {
      title: 'DAILY QUEST: CREATIVE SPARK',
      description: 'Express yourself. Create something new.',
      difficulty: 'E',
      tasks: [
        { id: 't1', label: 'CREATE', current: 0, target: 30, unit: 'MIN' },
        { id: 't2', label: 'PRACTICE TECHNIQUE', current: 0, target: 15, unit: 'MIN' },
        { id: 't3', label: 'FIND INSPIRATION', current: 0, target: 1 }
      ],
      rewards: { xp: 30, gold: 500 }
    },
    intermediate: {
      title: 'DAILY QUEST: ARTISTIC GROWTH',
      description: 'Refine your craft. Build your portfolio.',
      difficulty: 'D',
      tasks: [
        { id: 't1', label: 'CREATE', current: 0, target: 60, unit: 'MIN' },
        { id: 't2', label: 'PRACTICE TECHNIQUE', current: 0, target: 30, unit: 'MIN' },
        { id: 't3', label: 'COMPLETE PIECE', current: 0, target: 1 }
      ],
      rewards: { xp: 50, gold: 1000 }
    },
    advanced: {
      title: 'DAILY QUEST: CREATIVE MASTERY',
      description: 'Push creative boundaries. Inspire others.',
      difficulty: 'C',
      tasks: [
        { id: 't1', label: 'CREATE', current: 0, target: 120, unit: 'MIN' },
        { id: 't2', label: 'MASTER TECHNIQUE', current: 0, target: 60, unit: 'MIN' },
        { id: 't3', label: 'COMPLETE MAJOR PIECE', current: 0, target: 1 },
        { id: 't4', label: 'SHARE WORK', current: 0, target: 1 }
      ],
      rewards: { xp: 100, gold: 2000 }
    }
  },
  social: {
    beginner: {
      title: 'DAILY QUEST: SOCIAL CONNECTION',
      description: 'Build meaningful relationships.',
      difficulty: 'E',
      tasks: [
        { id: 't1', label: 'QUALITY TIME', current: 0, target: 30, unit: 'MIN' },
        { id: 't2', label: 'REACH OUT', current: 0, target: 1, unit: 'PERSON' },
        { id: 't3', label: 'LISTEN ACTIVELY', current: 0, target: 1 }
      ],
      rewards: { xp: 30, gold: 500 }
    },
    intermediate: {
      title: 'DAILY QUEST: RELATIONSHIP BUILDING',
      description: 'Strengthen your social bonds.',
      difficulty: 'D',
      tasks: [
        { id: 't1', label: 'QUALITY TIME', current: 0, target: 60, unit: 'MIN' },
        { id: 't2', label: 'REACH OUT', current: 0, target: 2, unit: 'PEOPLE' },
        { id: 't3', label: 'HELP SOMEONE', current: 0, target: 1 }
      ],
      rewards: { xp: 50, gold: 1000 }
    },
    advanced: {
      title: 'DAILY QUEST: SOCIAL LEADERSHIP',
      description: 'Lead and inspire your community.',
      difficulty: 'C',
      tasks: [
        { id: 't1', label: 'QUALITY TIME', current: 0, target: 120, unit: 'MIN' },
        { id: 't2', label: 'NETWORK', current: 0, target: 5, unit: 'PEOPLE' },
        { id: 't3', label: 'ORGANIZE EVENT', current: 0, target: 1 },
        { id: 't4', label: 'MENTOR', current: 0, target: 1, unit: 'PERSON' }
      ],
      rewards: { xp: 100, gold: 2000 }
    }
  },
  financial: {
    beginner: {
      title: 'DAILY QUEST: FINANCIAL AWARENESS',
      description: 'Take control of your finances.',
      difficulty: 'E',
      tasks: [
        { id: 't1', label: 'TRACK EXPENSES', current: 0, target: 1 },
        { id: 't2', label: 'LEARN FINANCE CONCEPT', current: 0, target: 1 },
        { id: 't3', label: 'REVIEW BUDGET', current: 0, target: 15, unit: 'MIN' }
      ],
      rewards: { xp: 30, gold: 500 }
    },
    intermediate: {
      title: 'DAILY QUEST: WEALTH BUILDING',
      description: 'Grow your financial knowledge and assets.',
      difficulty: 'D',
      tasks: [
        { id: 't1', label: 'TRACK & ANALYZE', current: 0, target: 1 },
        { id: 't2', label: 'LEARN INVESTING', current: 0, target: 30, unit: 'MIN' },
        { id: 't3', label: 'SAVE/INVEST', current: 0, target: 1 },
        { id: 't4', label: 'SIDE INCOME WORK', current: 0, target: 1, unit: 'HOUR' }
      ],
      rewards: { xp: 50, gold: 1000 }
    },
    advanced: {
      title: 'DAILY QUEST: FINANCIAL MASTERY',
      description: 'Build wealth and financial freedom.',
      difficulty: 'C',
      tasks: [
        { id: 't1', label: 'PORTFOLIO REVIEW', current: 0, target: 1 },
        { id: 't2', label: 'INVESTMENT RESEARCH', current: 0, target: 60, unit: 'MIN' },
        { id: 't3', label: 'OPTIMIZE FINANCES', current: 0, target: 1 },
        { id: 't4', label: 'INCOME STREAM WORK', current: 0, target: 2, unit: 'HOURS' }
      ],
      rewards: { xp: 100, gold: 2000 }
    }
  },
  spiritual: {
    beginner: {
      title: 'DAILY QUEST: INNER PEACE',
      description: 'Find calm in the chaos.',
      difficulty: 'E',
      tasks: [
        { id: 't1', label: 'MEDITATE', current: 0, target: 10, unit: 'MIN' },
        { id: 't2', label: 'GRATITUDE PRACTICE', current: 0, target: 1 },
        { id: 't3', label: 'MINDFUL MOMENT', current: 0, target: 3 }
      ],
      rewards: { xp: 30, gold: 500 }
    },
    intermediate: {
      title: 'DAILY QUEST: SPIRITUAL GROWTH',
      description: 'Deepen your inner connection.',
      difficulty: 'D',
      tasks: [
        { id: 't1', label: 'MEDITATE', current: 0, target: 20, unit: 'MIN' },
        { id: 't2', label: 'JOURNAL', current: 0, target: 1 },
        { id: 't3', label: 'GRATITUDE PRACTICE', current: 0, target: 1 },
        { id: 't4', label: 'MINDFUL ACTIVITY', current: 0, target: 30, unit: 'MIN' }
      ],
      rewards: { xp: 50, gold: 1000 }
    },
    advanced: {
      title: 'DAILY QUEST: SPIRITUAL MASTERY',
      description: 'Achieve profound inner wisdom.',
      difficulty: 'C',
      tasks: [
        { id: 't1', label: 'DEEP MEDITATION', current: 0, target: 40, unit: 'MIN' },
        { id: 't2', label: 'REFLECTIVE JOURNAL', current: 0, target: 1 },
        { id: 't3', label: 'SPIRITUAL STUDY', current: 0, target: 30, unit: 'MIN' },
        { id: 't4', label: 'TEACH/SHARE WISDOM', current: 0, target: 1 }
      ],
      rewards: { xp: 100, gold: 2000 }
    }
  }
};

// Generate quests for selected categories
const generateDailyQuests = (selectedCategories, categoryLevels) => {
  const quests = [];
  let questId = 1;

  selectedCategories.forEach(category => {
    const level = categoryLevels[category] || 'beginner';
    const template = QUEST_TEMPLATES[category][level];
    
    quests.push({
      questId: questId++,
      category,
      ...template
    });
  });

  return quests;
};

// Initialize category progress based on level
const initializeCategoryProgress = (level) => {
  const baseStats = {
    beginner: { primary: 8, secondary: 8, tertiary: 8 },
    intermediate: { primary: 12, secondary: 12, tertiary: 10 },
    advanced: { primary: 15, secondary: 15, tertiary: 12 }
  };

  return {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    stats: baseStats[level] || baseStats.beginner,
    availablePoints: 0
  };
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3-20 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, playerName, selectedCategories, categoryLevels } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
      });

      // Initialize categories
      const categories = {};
      const allCategories = ['physical', 'mental', 'professional', 'creative', 'social', 'financial', 'spiritual'];
      
      allCategories.forEach(cat => {
        const level = categoryLevels && categoryLevels[cat] ? categoryLevels[cat] : 'beginner';
        categories[cat] = initializeCategoryProgress(level);
      });

      // Create player profile
      const player = await Player.create({
        userId: user._id,
        name: playerName || 'HUNTER',
        categories,
        selectedCategories: selectedCategories || ['physical']
      });

      // Generate quests for selected categories
      const questData = generateDailyQuests(
        selectedCategories || ['physical'],
        categoryLevels || { physical: 'beginner' }
      );

      // Create quests
      for (const quest of questData) {
        await Quest.create({
          userId: user._id,
          ...quest
        });
      }

      res.status(201).json({
        success: true,
        data: {
          token: generateToken(user._id),
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user and include password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save();

      res.json({
        success: true,
        data: {
          token: generateToken(user._id),
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
          },
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
