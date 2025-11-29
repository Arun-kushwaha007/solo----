/**
 * Baseline Normalization Module
 * 
 * Statistical analysis and normalization of baseline data points
 * to compute per-stat baselines, confidence intervals, and noise floors.
 */

/**
 * Calculate mean of an array of numbers
 */
function mean(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate median of an array of numbers
 */
function median(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate standard deviation
 */
function stdDev(values) {
  if (!values || values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Detect and remove outliers using IQR method
 * Returns array of values with outliers removed
 */
function removeOutliers(values) {
  if (!values || values.length < 4) return values;
  
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - (1.5 * iqr);
  const upperBound = q3 + (1.5 * iqr);
  
  return values.filter(val => val >= lowerBound && val <= upperBound);
}

/**
 * Calculate 95% confidence interval
 * Returns { lower, upper, confidence: 0.95 }
 */
function calculateConfidenceInterval(values, confidence = 0.95) {
  if (!values || values.length < 2) {
    return { lower: 0, upper: 0, confidence };
  }
  
  const avg = mean(values);
  const sd = stdDev(values);
  const n = values.length;
  
  // Z-score for 95% confidence
  const zScore = confidence === 0.95 ? 1.96 : 2.576; // 95% or 99%
  const marginOfError = zScore * (sd / Math.sqrt(n));
  
  return {
    lower: avg - marginOfError,
    upper: avg + marginOfError,
    confidence,
  };
}

/**
 * Calculate noise floor (minimum detectable change)
 * Using 2 * standard deviation as threshold
 */
function calculateNoiseFloor(values) {
  if (!values || values.length < 2) return 0;
  return 2 * stdDev(values);
}

/**
 * Normalize data points to a category
 * Maps different data types to stat categories
 */
function categorizeDataPoint(dataType) {
  const categoryMap = {
    // Strength
    'pushups': 'strength',
    'pullups': 'strength',
    'squats': 'strength',
    'plank_duration': 'strength',
    'weight_lifted': 'strength',
    'strength_score': 'strength',
    
    // Agility
    'steps': 'agility',
    'running_distance': 'agility',
    'running_duration': 'agility',
    'walking_distance': 'agility',
    'cycling_distance': 'agility',
    'agility_score': 'agility',
    
    // Intelligence
    'reading_pages': 'intelligence',
    'reading_minutes': 'intelligence',
    'learning_minutes': 'intelligence',
    'problem_solving_score': 'intelligence',
    'cognitive_score': 'intelligence',
    'focus_minutes': 'intelligence',
    
    // Vitality
    'sleep_hours': 'vitality',
    'sleep_quality': 'vitality',
    'heart_rate_resting': 'vitality',
    'recovery_score': 'vitality',
    'energy_level': 'vitality',
    'vitality_score': 'vitality',
    
    // Perception
    'meditation_minutes': 'perception',
    'mindfulness_score': 'perception',
    'mood_score': 'perception',
    'stress_level': 'perception',
    'perception_score': 'perception',
  };
  
  return categoryMap[dataType] || null;
}

/**
 * Normalize value to 0-100 scale based on data type
 */
function normalizeValue(dataType, value) {
  const normalizationRules = {
    // Direct scores (already 0-100 or 1-10)
    'strength_score': (v) => v,
    'agility_score': (v) => v,
    'intelligence_score': (v) => v,
    'vitality_score': (v) => v,
    'perception_score': (v) => v,
    'mood_score': (v) => v * 10, // 1-10 to 0-100
    'energy_level': (v) => v * 10,
    'stress_level': (v) => (10 - v) * 10, // Inverted
    
    // Steps (0-20000)
    'steps': (v) => Math.min(100, (v / 15000) * 100),
    
    // Exercise duration (0-120 minutes)
    'running_duration': (v) => Math.min(100, (v / 60) * 100),
    'cycling_duration': (v) => Math.min(100, (v / 60) * 100),
    
    // Strength exercises (reps)
    'pushups': (v) => Math.min(100, (v / 30) * 100),
    'pullups': (v) => Math.min(100, (v / 15) * 100),
    'squats': (v) => Math.min(100, (v / 50) * 100),
    'plank_duration': (v) => Math.min(100, (v / 120) * 100), // seconds
    
    // Sleep (4-10 hours)
    'sleep_hours': (v) => Math.max(0, Math.min(100, ((v - 4) / 6) * 100)),
    'sleep_quality': (v) => v * 10, // 1-10 scale
    
    // Reading/Learning (0-120 minutes)
    'reading_minutes': (v) => Math.min(100, (v / 60) * 100),
    'learning_minutes': (v) => Math.min(100, (v / 60) * 100),
    'focus_minutes': (v) => Math.min(100, (v / 90) * 100),
    
    // Meditation (0-60 minutes)
    'meditation_minutes': (v) => Math.min(100, (v / 30) * 100),
    
    // Heart rate (40-100 bpm resting)
    'heart_rate_resting': (v) => Math.max(0, Math.min(100, ((80 - v) / 40) * 100)),
  };
  
  const normalizer = normalizationRules[dataType];
  return normalizer ? normalizer(value) : value;
}

/**
 * Compute baseline metrics for a category
 * @param {Array} dataPoints - Array of BaselineDataPoint documents
 * @returns {Object} Baseline metrics
 */
function computeCategoryBaseline(dataPoints) {
  if (!dataPoints || dataPoints.length === 0) {
    return null;
  }
  
  // Extract and normalize values
  let values = dataPoints.map(dp => normalizeValue(dp.dataType, dp.value));
  
  // Remove outliers
  const cleanValues = removeOutliers(values);
  
  if (cleanValues.length < 2) {
    return null;
  }
  
  // Calculate statistics
  const avg = mean(cleanValues);
  const med = median(cleanValues);
  const sd = stdDev(cleanValues);
  const minVal = Math.min(...cleanValues);
  const maxVal = Math.max(...cleanValues);
  
  return {
    baseline: Math.round(avg * 10) / 10,
    mean: Math.round(avg * 10) / 10,
    median: Math.round(med * 10) / 10,
    stdDev: Math.round(sd * 10) / 10,
    min: Math.round(minVal * 10) / 10,
    max: Math.round(maxVal * 10) / 10,
  };
}

/**
 * Compute baseline for all categories
 * @param {Array} allDataPoints - All baseline data points
 * @returns {Object} Metrics for all categories
 */
function computeBaseline(allDataPoints) {
  const categories = ['strength', 'agility', 'intelligence', 'vitality', 'perception'];
  const metrics = {};
  const confidenceIntervals = {};
  const noiseFloor = {};
  
  categories.forEach(category => {
    const categoryPoints = allDataPoints.filter(dp => dp.category === category);
    
    if (categoryPoints.length > 0) {
      // Compute metrics
      metrics[category] = computeCategoryBaseline(categoryPoints);
      
      // Compute confidence interval
      const values = categoryPoints.map(dp => normalizeValue(dp.dataType, dp.value));
      const cleanValues = removeOutliers(values);
      confidenceIntervals[category] = calculateConfidenceInterval(cleanValues);
      
      // Compute noise floor
      noiseFloor[category] = Math.round(calculateNoiseFloor(cleanValues) * 10) / 10;
    }
  });
  
  return {
    metrics,
    confidenceIntervals,
    noiseFloor,
  };
}

/**
 * Calculate adaptive difficulty multiplier based on baseline
 * @param {Object} metrics - Baseline metrics for a category
 * @returns {Number} Difficulty multiplier (0.5 - 2.0)
 */
function calculateAdaptiveDifficulty(categoryMetrics) {
  if (!categoryMetrics || !categoryMetrics.baseline) {
    return 1.0; // Default difficulty
  }
  
  const baseline = categoryMetrics.baseline;
  
  // Map baseline (0-100) to difficulty (0.5-2.0)
  // Lower baseline = easier difficulty (0.5-1.0)
  // Higher baseline = harder difficulty (1.0-2.0)
  
  if (baseline < 30) {
    // Beginner: 0.5-0.7
    return 0.5 + (baseline / 30) * 0.2;
  } else if (baseline < 60) {
    // Intermediate: 0.7-1.0
    return 0.7 + ((baseline - 30) / 30) * 0.3;
  } else if (baseline < 80) {
    // Advanced: 1.0-1.5
    return 1.0 + ((baseline - 60) / 20) * 0.5;
  } else {
    // Expert: 1.5-2.0
    return 1.5 + ((baseline - 80) / 20) * 0.5;
  }
}

/**
 * Calculate overall adaptive difficulty
 * @param {Object} allMetrics - Metrics for all categories
 * @returns {Object} Difficulty multipliers for all categories
 */
function calculateAllDifficulties(allMetrics) {
  const difficulties = {
    overall: 1.0,
    strength: 1.0,
    agility: 1.0,
    intelligence: 1.0,
    vitality: 1.0,
    perception: 1.0,
  };
  
  const categories = ['strength', 'agility', 'intelligence', 'vitality', 'perception'];
  let totalDifficulty = 0;
  let count = 0;
  
  categories.forEach(category => {
    if (allMetrics[category]) {
      difficulties[category] = calculateAdaptiveDifficulty(allMetrics[category]);
      totalDifficulty += difficulties[category];
      count++;
    }
  });
  
  // Calculate overall difficulty as average
  if (count > 0) {
    difficulties.overall = Math.round((totalDifficulty / count) * 100) / 100;
  }
  
  return difficulties;
}

module.exports = {
  mean,
  median,
  stdDev,
  removeOutliers,
  calculateConfidenceInterval,
  calculateNoiseFloor,
  categorizeDataPoint,
  normalizeValue,
  computeCategoryBaseline,
  computeBaseline,
  calculateAdaptiveDifficulty,
  calculateAllDifficulties,
};
