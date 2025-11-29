const OnboardingProgress = require('../models/OnboardingProgress');
const Profile = require('../models/Profile');
const baselineCollector = require('../services/baselineCollector');

/**
 * @desc    Start onboarding process
 * @route   POST /api/onboarding/start
 * @access  Private
 */
exports.startOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Check if onboarding already exists
    let progress = await OnboardingProgress.findOne({ userId });
    
    if (progress) {
      return res.status(200).json({
        success: true,
        data: progress,
        message: 'Onboarding already in progress',
      });
    }

    // Create new onboarding progress
    progress = await OnboardingProgress.create({ userId });

    res.status(201).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save step progress
 * @route   PUT /api/onboarding/step/:stepId
 * @access  Private
 */
exports.saveStepProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { stepId } = req.params;
    const stepData = req.body;

    const progress = await OnboardingProgress.findOne({ userId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding not started',
      });
    }

    // Map stepId to step name
    const stepMap = {
      '0': 'welcome',
      '1': 'persona',
      '2': 'goals',
      '3': 'constraints',
      '4': 'wearables',
      '5': 'baselineIntro',
    };

    const stepName = stepMap[stepId];
    if (!stepName) {
      return res.status(400).json({
        success: false,
        error: 'Invalid step ID',
      });
    }

    // Update step data
    progress.stepData[stepName] = {
      ...stepData,
      completed: true,
      timestamp: new Date(),
    };

    // Mark step as completed
    progress.completeStep(parseInt(stepId));
    await progress.save();

    // If persona step, update user and profile
    if (stepName === 'persona' && stepData.displayName) {
      await req.user.update({
        displayName: stepData.displayName,
        persona: stepData.persona,
        timezone: stepData.timezone,
      });
    }

    // If goals step, update profile
    if (stepName === 'goals' && stepData.goals) {
      await Profile.findOneAndUpdate(
        { user: userId },
        { goals: stepData.goals }
      );
    }

    // If constraints step, update profile
    if (stepName === 'constraints') {
      await Profile.findOneAndUpdate(
        { user: userId },
        {
          healthConstraints: stepData.healthConstraints,
          demographics: {
            ...stepData.timeAvailability,
            ...stepData.equipment,
          },
        }
      );
    }

    // If wearables step, update profile
    if (stepName === 'wearables' && stepData.permissions) {
      await Profile.findOneAndUpdate(
        { user: userId },
        { 'calibration.wearablePermissions': stepData.permissions }
      );
    }

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete onboarding
 * @route   POST /api/onboarding/complete
 * @access  Private
 */
exports.completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const progress = await OnboardingProgress.findOne({ userId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding not started',
      });
    }

    if (!progress.isComplete()) {
      return res.status(400).json({
        success: false,
        error: 'Not all steps completed',
        completionPercentage: progress.getCompletionPercentage(),
      });
    }

    // Mark onboarding as completed
    progress.completedAt = new Date();
    await progress.save();

    // Update profile
    await Profile.findOneAndUpdate(
      { user: userId },
      {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      }
    );

    // Auto-start baseline if agreed
    const baselineIntro = progress.stepData.baselineIntro;
    let baseline = null;
    
    if (baselineIntro && baselineIntro.agreedToBaseline) {
      const duration = baselineIntro.baselineDuration || 7;
      baseline = await baselineCollector.startBaseline(userId, duration);
    }

    res.status(200).json({
      success: true,
      data: {
        progress,
        baseline,
      },
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get onboarding progress
 * @route   GET /api/onboarding/progress
 * @access  Private
 */
exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const progress = await OnboardingProgress.findOne({ userId });
    
    if (!progress) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Onboarding not started',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...progress.toObject(),
        completionPercentage: progress.getCompletionPercentage(),
        isComplete: progress.isComplete(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resume onboarding
 * @route   POST /api/onboarding/resume
 * @access  Private
 */
exports.resumeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const progress = await OnboardingProgress.findOne({ userId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding not started',
      });
    }

    if (progress.isComplete()) {
      return res.status(400).json({
        success: false,
        error: 'Onboarding already completed',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...progress.toObject(),
        completionPercentage: progress.getCompletionPercentage(),
        nextStep: progress.currentStep,
      },
    });
  } catch (error) {
    next(error);
  }
};
