const ActivityMetric = require('../models/ActivityMetric');
const Integration = require('../models/Integration');

/**
 * Service to handle activity data ingestion from various sources
 */
class IngestionService {
  /**
   * Ingest a batch of activity data
   * @param {string} userId - The user ID
   * @param {string} provider - The source provider (e.g., 'google_fit')
   * @param {Array} dataPoints - Array of raw data points
   * @returns {Promise<Object>} - Result summary
   */
  async ingestBatch(userId, provider, dataPoints) {
    if (!dataPoints || dataPoints.length === 0) {
      return { success: true, count: 0, message: 'No data to ingest' };
    }

    const normalizedData = dataPoints.map(point => this.normalizeData(point, userId, provider));
    
    // Filter out invalid data
    const validData = normalizedData.filter(item => item !== null);

    if (validData.length === 0) {
      return { success: false, count: 0, message: 'No valid data points found' };
    }

    try {
      // For time-series collections, we should primarily use insert.
      // Updates are restricted. We assume new data is new readings.
      // If we need to handle duplicates, we might need a different strategy or rely on the fact
      // that time-series data is usually append-only.
      // However, to prevent exact duplicates if the same batch is sent twice, we can check existence
      // or just insert and let the application handle it (or use a secondary unique index if supported, 
      // but TS collections have limitations on unique indexes).
      
      // For now, we will just insert.
      const result = await ActivityMetric.insertMany(validData);
      
      // Update last sync time
      await Integration.findOneAndUpdate(
        { userId, provider },
        { lastSync: new Date() }
      );

      return {
        success: true,
        count: result.length,
        details: result
      };
    } catch (error) {
      console.error('Ingestion error:', error);
      throw new Error('Failed to ingest data batch');
    }
  }

  /**
   * Normalize raw data into ActivityMetric format
   * @param {Object} rawPoint - Raw data point
   * @param {string} userId - User ID
   * @param {string} provider - Provider name
   * @returns {Object|null} - Normalized object or null if invalid
   */
  normalizeData(rawPoint, userId, provider) {
    try {
      // Basic validation
      if (!rawPoint.type || !rawPoint.value || !rawPoint.timestamp) {
        return null;
      }

      return {
        userId,
        source: provider,
        type: rawPoint.type, // Assumes type matches enum or is mapped before calling this
        value: Number(rawPoint.value),
        unit: rawPoint.unit || 'count',
        timestamp: new Date(rawPoint.timestamp),
        metadata: {
          confidence: rawPoint.confidence || 100,
          deviceId: rawPoint.deviceId,
          originalSourceId: rawPoint.id,
          isManual: rawPoint.isManual || false,
        }
      };
    } catch (error) {
      console.warn('Normalization error for point:', rawPoint, error);
      return null;
    }
  }
}

module.exports = new IngestionService();
