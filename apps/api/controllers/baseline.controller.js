const Baseline = require('../models/Baseline');
const CalibrationTest = require('../models/CalibrationTest');
const baselineCollector = require('../services/baselineCollector');

/**
 * @desc    Start baseline collection
 * @route   POST /api/baseline/start
 * @access  Private
 */
exports.startBaseline = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { duration = 7 } = req.body;

    const baseline = await baselineCollector.startBaseline(userId, duration);

    res.status(201).json({
      success: true,
      data: baseline,
      message: `Baseline collection started for ${duration} days`,
    });
  } catch (error) {
    if (error.message.includes('already has an active baseline')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Stop baseline collection
 * @route   POST /api/baseline/stop
 * @access  Private
 */
exports.stopBaseline = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const baseline = await baselineCollector.stopBaseline(userId);

    res.status(200).json({
      success: true,
      data: baseline,
      message: 'Baseline collection stopped and processed',
    });
  } catch (error) {
    if (error.message.includes('No active baseline') || 
        error.message.includes('does not meet minimum requirements')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Ingest baseline data points
 * @route   POST /api/baseline/data
 * @access  Private
 */
exports.ingestData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { dataPoints } = req.body;

    if (!dataPoints || !Array.isArray(dataPoints)) {
      return res.status(400).json({
        success: false,
        error: 'dataPoints array is required',
      });
    }

    // Validate data points
    for (const dp of dataPoints) {
      if (!dp.category || !dp.dataType || dp.value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Each data point must have category, dataType, and value',
        });
      }
    }

    const results = await baselineCollector.ingestDataPoints(userId, dataPoints);

    res.status(201).json({
      success: true,
      data: results,
      count: results.length,
      message: `${results.length} data points ingested`,
    });
  } catch (error) {
    if (error.message.includes('No active baseline')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
};

/**
 * @desc    Submit calibration test
 * @route   POST /api/baseline/test/:testType
 * @access  Private
 */
exports.submitTest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { testType } = req.params;
    const { results, metadata } = req.body;

    // Get active baseline
    const baseline = await Baseline.getActiveBaseline(userId);
    if (!baseline) {
      return res.status(400).json({
        success: false,
        error: 'No active baseline collection found',
      });
    }

    // Validate test type
    const validTestTypes = [
      'timed_walk',
      'cognitive_reaction',
      'cognitive_memory',
      'strength_pushups',
      'strength_plank',
      'flexibility',
    ];

    if (!validTestTypes.includes(testType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid test type',
      });
    }

    // Map test type to category
    const categoryMap = {
      'timed_walk': 'agility',
      'cognitive_reaction': 'intelligence',
      'cognitive_memory': 'intelligence',
      'strength_pushups': 'strength',
      'strength_plank': 'strength',
      'flexibility': 'agility',
    };

    // Create calibration test
    const test = await CalibrationTest.create({
      userId,
      baselineId: baseline._id,
      testType,
      category: categoryMap[testType],
      results,
      metadata: metadata || {},
    });

    // Calculate score
    test.calculateScore();
    await test.save();

    res.status(201).json({
      success: true,
      data: test,
      message: 'Test submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get baseline metrics
 * @route   GET /api/baseline/metrics
 * @access  Private
 */
exports.getMetrics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get most recent completed baseline
    const baseline = await Baseline.findOne({
      userId,
      status: 'COMPLETED',
    }).sort({ completedAt: -1 });

    if (!baseline) {
      return res.status(404).json({
        success: false,
        error: 'No completed baseline found',
      });
    }

    // Get calibration tests
    const tests = await CalibrationTest.getForBaseline(baseline._id);

    res.status(200).json({
      success: true,
      data: {
        baseline: {
          id: baseline._id,
          startDate: baseline.startDate,
          endDate: baseline.endDate,
          duration: baseline.actualDuration,
          dataPointCount: baseline.dataPointCount,
          metrics: baseline.metrics,
          confidenceIntervals: baseline.confidenceIntervals,
          noiseFloor: baseline.noiseFloor,
        },
        tests,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get baseline progress
 * @route   GET /api/baseline/progress
 * @access  Private
 */
exports.getProgress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const progress = await baselineCollector.getProgress(userId);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};
