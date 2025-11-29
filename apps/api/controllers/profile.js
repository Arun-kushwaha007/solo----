const Profile = require('../models/Profile');

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);

    if (!profile) {
      // Auto-create profile if not exists (lazy init)
      profile = await Profile.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile demographics
// @route   PUT /api/profile/demographics
// @access  Private
exports.updateDemographics = async (req, res, next) => {
  try {
    const { age, height, weight, gender } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await Profile.create({ user: req.user.id });
    }

    profile.demographics = { age, height, weight, gender };
    profile.onboardingStep = 1;
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Start calibration
// @route   POST /api/profile/calibration/start
// @access  Private
exports.startCalibration = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    
    profile.calibration.status = 'ACTIVE';
    profile.calibration.startDate = Date.now();
    // 3 days calibration
    profile.calibration.endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    profile.onboardingStep = 2;
    
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit calibration results (Manual override for MVP)
// @route   POST /api/profile/calibration/submit
// @access  Private
exports.submitCalibration = async (req, res, next) => {
  try {
    const { pushups, runTime, focusScore } = req.body;
    
    let profile = await Profile.findOne({ user: req.user.id });
    
    profile.calibration.baselineData = {
      initialPushups: pushups,
      initialRunTime: runTime,
      focusScore: focusScore
    };
    
    // Calculate initial stats based on baseline
    // Simple logic for MVP
    profile.stats.strength = 10 + Math.floor(pushups / 2);
    profile.stats.agility = 10 + (runTime < 15 ? 5 : 0); // Dummy logic
    profile.stats.intelligence = 10 + focusScore;
    
    profile.calibration.status = 'COMPLETED';
    profile.onboardingStep = 3;
    
    await profile.save();

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};
