const Safety = require('../models/Safety');

// @desc    Log a safety event (Consent, Mood, Crisis)
// @route   POST /api/safety/log
// @access  Private
exports.logSafetyEvent = async (req, res, next) => {
  try {
    const { type, data } = req.body;

    const safetyLog = await Safety.create({
      user: req.user.id,
      type,
      data,
    });

    // Check for crisis triggers in Mood Check
    let crisisTriggered = false;
    if (type === 'MOOD_CHECK' && data.score <= 1) { // PHQ-2 low score logic
       crisisTriggered = true;
    }

    res.status(201).json({
      success: true,
      data: safetyLog,
      crisisTriggered
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get crisis resources
// @route   GET /api/safety/resources
// @access  Public
exports.getCrisisResources = (req, res, next) => {
  const resources = [
    {
      id: 'suicide_hotline',
      name: 'National Suicide Prevention Lifeline',
      contact: '988',
      url: 'https://suicidepreventionlifeline.org/',
      description: '24/7, free and confidential support.'
    },
    {
      id: 'crisis_text_line',
      name: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
      url: 'https://www.crisistextline.org/',
      description: 'Free, 24/7 support via text.'
    }
  ];

  res.status(200).json({
    success: true,
    data: resources
  });
};
