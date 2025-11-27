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

// Helper to generate personalized quests based on fitness level
const generateDailyQuest = (fitnessLevel, goals) => {
  const questTemplates = {
    beginner: {
      title: 'DAILY QUEST: FOUNDATION TRAINING',
      description: 'Build your foundation. Start small, grow strong.',
      difficulty: 'E',
      tasks: [
        { id: 't1', label: 'PUSH-UPS', current: 0, target: 10 },
        { id: 't2', label: 'SIT-UPS', current: 0, target: 15 },
        { id: 't3', label: 'SQUATS', current: 0, target: 20 },
        { id: 't4', label: 'WALKING', current: 0, target: 1, unit: 'KM' },
      ],
      rewards: { xp: 30, gold: 500 },
    },
    intermediate: {
      title: 'DAILY QUEST: STRENGTH BUILDING',
      description: 'Push your limits. Become stronger each day.',
      difficulty: 'D',
      tasks: [
        { id: 't1', label: 'PUSH-UPS', current: 0, target: 25 },
        { id: 't2', label: 'SIT-UPS', current: 0, target: 30 },
        { id: 't3', label: 'SQUATS', current: 0, target: 40 },
        { id: 't4', label: 'RUNNING', current: 0, target: 3, unit: 'KM' },
      ],
      rewards: { xp: 50, gold: 1000 },
    },
    advanced: {
      title: 'DAILY QUEST: ELITE TRAINING',
      description: 'Challenge accepted. Prove your strength.',
      difficulty: 'C',
      tasks: [
        { id: 't1', label: 'PUSH-UPS', current: 0, target: 50 },
        { id: 't2', label: 'SIT-UPS', current: 0, target: 50 },
        { id: 't3', label: 'SQUATS', current: 0, target: 100 },
        { id: 't4', label: 'RUNNING', current: 0, target: 5, unit: 'KM' },
      ],
      rewards: { xp: 100, gold: 2000 },
    },
  };

  return questTemplates[fitnessLevel] || questTemplates.beginner;
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

      const { username, email, password, playerName, fitnessLevel, goals } = req.body;

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

      // Determine starting stats based on fitness level
      const baseStats = {
        beginner: { strength: 8, agility: 8, sense: 8, vitality: 8, intelligence: 8 },
        intermediate: { strength: 12, agility: 12, sense: 10, vitality: 12, intelligence: 10 },
        advanced: { strength: 15, agility: 15, sense: 12, vitality: 15, intelligence: 12 },
      };

      const stats = baseStats[fitnessLevel] || baseStats.beginner;

      // Create player profile with personalized data
      const player = await Player.create({
        userId: user._id,
        name: playerName || 'HUNTER',
        stats,
      });

      // Create personalized daily quest
      const questData = generateDailyQuest(fitnessLevel, goals);
      await Quest.create({
        userId: user._id,
        questId: 1,
        ...questData,
      });

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
