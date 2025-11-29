const Profile = require('../models/Profile');
const User = require('../models/User');
const { encryptArray, decryptArray } = require('../utils/crypto');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      // Create default profile if it doesn't exist
      profile = await Profile.create({
        user: req.user.id,
        timezone: req.user.timezone || 'Asia/Kolkata',
      });
    }

    // Decrypt sensitive health data if it exists
    if (profile.healthConstraints) {
      if (profile.healthConstraints.injuries && profile.healthConstraints.injuries.length > 0) {
        try {
          profile.healthConstraints.injuries = decryptArray(profile.healthConstraints.injuries);
        } catch (error) {
          console.error('Error decrypting injuries:', error);
        }
      }
      if (profile.healthConstraints.medicalConditions && profile.healthConstraints.medicalConditions.length > 0) {
        try {
          profile.healthConstraints.medicalConditions = decryptArray(profile.healthConstraints.medicalConditions);
        } catch (error) {
          console.error('Error decrypting medical conditions:', error);
        }
      }
      if (profile.healthConstraints.limitations && profile.healthConstraints.limitations.length > 0) {
        try {
          profile.healthConstraints.limitations = decryptArray(profile.healthConstraints.limitations);
        } catch (error) {
          console.error('Error decrypting limitations:', error);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      demographics,
      persona,
      timezone,
      preferences,
      stats,
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    // Update fields if provided
    if (demographics) {
      profile.demographics = { ...profile.demographics, ...demographics };
    }
    if (persona !== undefined) {
      profile.persona = persona;
    }
    if (timezone) {
      profile.timezone = timezone;
      // Also update user's timezone
      await User.findByIdAndUpdate(req.user.id, { timezone });
    }
    if (preferences) {
      profile.preferences = { ...profile.preferences, ...preferences };
    }
    if (stats) {
      profile.stats = { ...profile.stats, ...stats };
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update health constraints (encrypted)
// @route   PUT /api/profile/health
// @access  Private
exports.updateHealthConstraints = async (req, res, next) => {
  try {
    const {
      injuries,
      medicalConditions,
      limitations,
      dietaryRestrictions,
      fitnessLevel,
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    // Encrypt sensitive health data
    if (injuries !== undefined) {
      profile.healthConstraints.injuries = encryptArray(injuries);
    }
    if (medicalConditions !== undefined) {
      profile.healthConstraints.medicalConditions = encryptArray(medicalConditions);
    }
    if (limitations !== undefined) {
      profile.healthConstraints.limitations = encryptArray(limitations);
    }
    if (dietaryRestrictions !== undefined) {
      profile.healthConstraints.dietaryRestrictions = dietaryRestrictions;
    }
    if (fitnessLevel) {
      profile.healthConstraints.fitnessLevel = fitnessLevel;
    }

    await profile.save();

    // Return decrypted data for display
    const responseProfile = profile.toObject();
    if (responseProfile.healthConstraints) {
      if (responseProfile.healthConstraints.injuries) {
        responseProfile.healthConstraints.injuries = decryptArray(responseProfile.healthConstraints.injuries);
      }
      if (responseProfile.healthConstraints.medicalConditions) {
        responseProfile.healthConstraints.medicalConditions = decryptArray(responseProfile.healthConstraints.medicalConditions);
      }
      if (responseProfile.healthConstraints.limitations) {
        responseProfile.healthConstraints.limitations = decryptArray(responseProfile.healthConstraints.limitations);
      }
    }

    res.status(200).json({
      success: true,
      data: responseProfile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update persona and goals
// @route   PUT /api/profile/persona
// @access  Private
exports.updatePersona = async (req, res, next) => {
  try {
    const { persona, goals } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    if (persona !== undefined) {
      profile.persona = persona;
    }

    if (goals !== undefined) {
      profile.goals = goals;
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a goal
// @route   POST /api/profile/goals
// @access  Private
exports.addGoal = async (req, res, next) => {
  try {
    const { title, description, category, targetDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Goal title is required',
      });
    }

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    profile.goals.push({
      title,
      description,
      category,
      targetDate,
    });

    await profile.save();

    res.status(201).json({
      success: true,
      data: profile.goals[profile.goals.length - 1],
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a goal
// @route   PUT /api/profile/goals/:goalId
// @access  Private
exports.updateGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { title, description, category, targetDate, completed } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    const goal = profile.goals.id(goalId);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (completed !== undefined) goal.completed = completed;

    await profile.save();

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/profile/goals/:goalId
// @access  Private
exports.deleteGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
      });
    }

    profile.goals.pull(goalId);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
