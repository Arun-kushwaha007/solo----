const Baseline = require('../models/Baseline');
const BaselineDataPoint = require('../models/BaselineDataPoint');
const Profile = require('../models/Profile');
const { computeBaseline, calculateAllDifficulties } = require('../utils/baselineNormalizer');

/**
 * Baseline Collector Service
 * Orchestrates passive data collection and baseline processing
 */

class BaselineCollector {
  /**
   * Start baseline collection for a user
   * @param {String} userId - User ID
   * @param {Number} duration - Duration in days (default: 7)
   * @returns {Object} Created baseline document
   */
  async startBaseline(userId, duration = 7) {
    // Check if user already has an active baseline
    const existingBaseline = await Baseline.getActiveBaseline(userId);
    if (existingBaseline) {
      throw new Error('User already has an active baseline collection');
    }

    // Create new baseline
    const baseline = await Baseline.create({
      userId,
      targetDuration: duration,
      status: 'COLLECTING',
      startDate: new Date(),
    });

    // Update profile calibration status
    await Profile.findOneAndUpdate(
      { user: userId },
      {
        'calibration.status': 'ACTIVE',
        'calibration.startDate': new Date(),
        'calibration.baselineId': baseline._id,
      }
    );

    return baseline;
  }

  /**
   * Ingest a single data point
   * @param {String} userId - User ID
   * @param {Object} dataPoint - Data point object
   * @returns {Object} Created data point document
   */
  async ingestDataPoint(userId, dataPoint) {
    // Get active baseline
    const baseline = await Baseline.getActiveBaseline(userId);
    if (!baseline) {
      throw new Error('No active baseline collection found for user');
    }

    // Create data point
    const dp = await BaselineDataPoint.create({
      userId,
      baselineId: baseline._id,
      timestamp: dataPoint.timestamp || new Date(),
      source: dataPoint.source || 'manual',
      category: dataPoint.category,
      dataType: dataPoint.dataType,
      value: dataPoint.value,
      unit: dataPoint.unit,
      metadata: dataPoint.metadata || {},
    });

    // Update baseline data point count
    baseline.dataPointCount += 1;
    await baseline.save();

    // Check readiness
    await this.updateReadiness(baseline._id);

    return dp;
  }

  /**
   * Ingest multiple data points
   * @param {String} userId - User ID
   * @param {Array} dataPoints - Array of data point objects
   * @returns {Array} Created data point documents
   */
  async ingestDataPoints(userId, dataPoints) {
    const results = [];
    for (const dp of dataPoints) {
      try {
        const result = await this.ingestDataPoint(userId, dp);
        results.push(result);
      } catch (error) {
        console.error('Error ingesting data point:', error);
      }
    }
    return results;
  }

  /**
   * Update baseline readiness status
   * @param {String} baselineId - Baseline ID
   */
  async updateReadiness(baselineId) {
    const baseline = await Baseline.findById(baselineId);
    if (!baseline) return;

    const now = new Date();
    const daysElapsed = Math.floor((now - baseline.startDate) / (1000 * 60 * 60 * 24));

    // Check criteria
    const criteria = {
      minimumDays: daysElapsed >= 3,
      minimumDataPoints: baseline.dataPointCount >= 50,
      allCategoriesCovered: false,
      noLargeGaps: false,
    };

    // Check if all categories have data
    const categoryCounts = await BaselineDataPoint.countByCategory(baselineId);
    const categoryMap = {};
    categoryCounts.forEach(c => {
      categoryMap[c._id] = c.count;
    });

    const requiredCategories = ['strength', 'agility', 'intelligence', 'vitality', 'perception'];
    criteria.allCategoriesCovered = requiredCategories.every(cat => 
      categoryMap[cat] && categoryMap[cat] >= 10
    );

    // Check for gaps (simplified - check if we have data in last 24 hours)
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const recentDataPoints = await BaselineDataPoint.find({
      baselineId,
      timestamp: { $gte: oneDayAgo },
    });
    criteria.noLargeGaps = recentDataPoints.length > 0 || daysElapsed < 1;

    // Update baseline
    baseline.readinessCriteria = criteria;
    baseline.calculateReadinessScore();
    await baseline.save();
  }

  /**
   * Get baseline progress
   * @param {String} userId - User ID
   * @returns {Object} Progress information
   */
  async getProgress(userId) {
    const baseline = await Baseline.getActiveBaseline(userId);
    if (!baseline) {
      return {
        active: false,
        message: 'No active baseline collection',
      };
    }

    const now = new Date();
    const daysElapsed = Math.floor((now - baseline.startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, baseline.targetDuration - daysElapsed);

    // Get data point counts by category
    const categoryCounts = await BaselineDataPoint.countByCategory(baseline._id);
    const categoryProgress = {};
    categoryCounts.forEach(c => {
      categoryProgress[c._id] = {
        count: c.count,
        target: 50,
        percentage: Math.min(100, Math.round((c.count / 50) * 100)),
      };
    });

    return {
      active: true,
      baselineId: baseline._id,
      status: baseline.status,
      daysElapsed,
      daysRemaining,
      targetDuration: baseline.targetDuration,
      dataPointCount: baseline.dataPointCount,
      readinessScore: baseline.readinessScore,
      readinessCriteria: baseline.readinessCriteria,
      isReady: baseline.isReady(),
      categoryProgress,
    };
  }

  /**
   * Process baseline and compute metrics
   * @param {String} baselineId - Baseline ID
   * @returns {Object} Processed baseline with metrics
   */
  async processBaseline(baselineId) {
    const baseline = await Baseline.findById(baselineId);
    if (!baseline) {
      throw new Error('Baseline not found');
    }

    if (baseline.status !== 'COLLECTING') {
      throw new Error('Baseline is not in COLLECTING status');
    }

    // Update status
    baseline.status = 'PROCESSING';
    await baseline.save();

    try {
      // Get all data points
      const dataPoints = await BaselineDataPoint.getForBaseline(baselineId);

      if (dataPoints.length < 50) {
        throw new Error('Insufficient data points for baseline computation');
      }

      // Compute baseline metrics
      const { metrics, confidenceIntervals, noiseFloor } = computeBaseline(dataPoints);

      // Calculate adaptive difficulties
      const difficulties = calculateAllDifficulties(metrics);

      // Update baseline
      baseline.metrics = metrics;
      baseline.confidenceIntervals = confidenceIntervals;
      baseline.noiseFloor = noiseFloor;
      baseline.status = 'COMPLETED';
      baseline.endDate = new Date();
      baseline.actualDuration = Math.floor((baseline.endDate - baseline.startDate) / (1000 * 60 * 60 * 24));
      baseline.completedAt = new Date();
      await baseline.save();

      // Update profile with adaptive difficulty
      await Profile.findOneAndUpdate(
        { user: baseline.userId },
        {
          'calibration.status': 'COMPLETED',
          'calibration.endDate': new Date(),
          'calibration.adaptiveDifficulty': difficulties,
        }
      );

      return baseline;
    } catch (error) {
      baseline.status = 'FAILED';
      await baseline.save();
      throw error;
    }
  }

  /**
   * Stop baseline collection early
   * @param {String} userId - User ID
   * @returns {Object} Processed baseline
   */
  async stopBaseline(userId) {
    const baseline = await Baseline.getActiveBaseline(userId);
    if (!baseline) {
      throw new Error('No active baseline collection found');
    }

    // Check if ready
    if (!baseline.isReady()) {
      throw new Error('Baseline does not meet minimum requirements for processing');
    }

    // Process baseline
    return await this.processBaseline(baseline._id);
  }
}

module.exports = new BaselineCollector();
