const UserQuest = require('../models/UserQuest');
const Quest = require('../models/Quest');

/**
 * Quest Verification Service
 * Handles verification of quest completion through various methods
 */

/**
 * Verify quest completion
 * @param {Object} userQuest - UserQuest document
 * @param {Object} evidence - Evidence data (optional)
 * @param {Object} sensorData - Sensor data (optional)
 * @returns {Object} - Verification result
 */
exports.verifyQuest = async (userQuest, evidence = null, sensorData = null) => {
  const quest = await Quest.findById(userQuest.quest);
  if (!quest) {
    throw new Error('Quest not found');
  }
  
  // Check verification type
  switch (quest.verificationType) {
    case 'MANUAL':
      return verifyManual(userQuest, quest, evidence);
      
    case 'AUTO_SENSOR':
      return await verifyAutoSensor(userQuest, quest, sensorData);
      
    case 'AUTO_PHOTO':
      return verifyAutoPhoto(userQuest, quest, evidence);
      
    case 'AUTO_VIDEO':
      return verifyAutoVideo(userQuest, quest, evidence);
      
    case 'HYBRID':
      // Requires both evidence and sensor data
      const sensorResult = await verifyAutoSensor(userQuest, quest, sensorData);
      const evidenceResult = verifyEvidence(evidence, quest);
      
      return {
        verified: sensorResult.verified && evidenceResult.valid,
        method: 'HYBRID',
        sensorResult,
        evidenceResult,
      };
      
    default:
      return {
        verified: true,
        method: 'NONE',
        message: 'No verification required',
      };
  }
};

/**
 * Manual verification - requires admin approval
 */
function verifyManual(userQuest, quest, evidence) {
  // Check if evidence is required
  if (quest.evidenceRequired && (!evidence || evidence.length === 0)) {
    return {
      verified: false,
      method: 'MANUAL',
      message: 'Evidence required for manual verification',
      requiresAdmin: true,
    };
  }
  
  // Evidence provided, but still needs admin review
  return {
    verified: false,
    method: 'MANUAL',
    message: 'Pending admin verification',
    requiresAdmin: true,
  };
}

/**
 * Auto-verify using sensor data
 */
async function verifyAutoSensor(userQuest, quest, sensorData) {
  if (!sensorData || Object.keys(sensorData).length === 0) {
    return {
      verified: false,
      method: 'AUTO_SENSOR',
      message: 'Sensor data required',
    };
  }
  
  // Check sensor type and threshold
  const sensorType = quest.sensorType;
  const threshold = quest.sensorThreshold;
  
  if (!sensorType || sensorType === 'NONE') {
    return {
      verified: false,
      method: 'AUTO_SENSOR',
      message: 'No sensor type configured for this quest',
    };
  }
  
  // Get sensor value based on type
  let sensorValue = 0;
  
  switch (sensorType) {
    case 'STEPS':
      sensorValue = sensorData.steps || 0;
      break;
    case 'DISTANCE':
      sensorValue = sensorData.distance || 0;
      break;
    case 'HEART_RATE':
      sensorValue = sensorData.heartRate || 0;
      break;
    case 'CALORIES':
      sensorValue = sensorData.calories || 0;
      break;
    case 'SLEEP':
      sensorValue = sensorData.sleepHours || 0;
      break;
    case 'WORKOUT_DURATION':
      sensorValue = sensorData.workoutMinutes || 0;
      break;
    default:
      return {
        verified: false,
        method: 'AUTO_SENSOR',
        message: `Unknown sensor type: ${sensorType}`,
      };
  }
  
  // Verify threshold
  const verified = sensorValue >= threshold;
  
  return {
    verified,
    method: 'AUTO_SENSOR',
    sensorType,
    threshold,
    actualValue: sensorValue,
    message: verified 
      ? `Quest verified: ${sensorValue} ${quest.sensorUnit || ''} (required: ${threshold})`
      : `Insufficient progress: ${sensorValue} ${quest.sensorUnit || ''} (required: ${threshold})`,
  };
}

/**
 * Auto-verify photo evidence
 * For now, just validates that photo evidence is provided
 * In future, could use image recognition AI
 */
function verifyAutoPhoto(userQuest, quest, evidence) {
  const photoEvidence = evidence?.filter(e => e.type === 'PHOTO') || [];
  
  if (photoEvidence.length === 0) {
    return {
      verified: false,
      method: 'AUTO_PHOTO',
      message: 'Photo evidence required',
    };
  }
  
  // Basic validation passed
  // In production, you might want to:
  // - Use AI to verify photo content
  // - Check for photo manipulation
  // - Verify timestamp/GPS data
  
  return {
    verified: true,
    method: 'AUTO_PHOTO',
    message: 'Photo evidence accepted',
    photoCount: photoEvidence.length,
  };
}

/**
 * Auto-verify video evidence
 */
function verifyAutoVideo(userQuest, quest, evidence) {
  const videoEvidence = evidence?.filter(e => e.type === 'VIDEO') || [];
  
  if (videoEvidence.length === 0) {
    return {
      verified: false,
      method: 'AUTO_VIDEO',
      message: 'Video evidence required',
    };
  }
  
  // Basic validation passed
  // In production, you might want to:
  // - Use AI to verify video content
  // - Check video duration
  // - Verify timestamp/GPS data
  
  return {
    verified: true,
    method: 'AUTO_VIDEO',
    message: 'Video evidence accepted',
    videoCount: videoEvidence.length,
  };
}

/**
 * Validate evidence format and type
 */
exports.verifyEvidence = function(evidence, quest) {
  if (!evidence || evidence.length === 0) {
    return {
      valid: !quest.evidenceRequired,
      message: quest.evidenceRequired ? 'Evidence required' : 'No evidence required',
    };
  }
  
  // Check if evidence types are allowed
  const allowedTypes = quest.evidenceTypes || [];
  
  for (const item of evidence) {
    if (allowedTypes.length > 0 && !allowedTypes.includes(item.type)) {
      return {
        valid: false,
        message: `Evidence type ${item.type} not allowed for this quest`,
      };
    }
    
    // Validate file size (max 10MB for images, 50MB for videos)
    if (item.type === 'PHOTO' && item.fileSize > 10 * 1024 * 1024) {
      return {
        valid: false,
        message: 'Photo file size exceeds 10MB limit',
      };
    }
    
    if (item.type === 'VIDEO' && item.fileSize > 50 * 1024 * 1024) {
      return {
        valid: false,
        message: 'Video file size exceeds 50MB limit',
      };
    }
  }
  
  return {
    valid: true,
    message: 'Evidence validation passed',
  };
};

/**
 * Validate evidence file
 */
exports.validateEvidenceFile = function(file, type) {
  const maxSizes = {
    PHOTO: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
    TEXT: 1 * 1024 * 1024,   // 1MB
  };
  
  const allowedMimeTypes = {
    PHOTO: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    VIDEO: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    TEXT: ['text/plain', 'application/json'],
  };
  
  // Check file size
  if (file.size > maxSizes[type]) {
    return {
      valid: false,
      message: `File size exceeds ${maxSizes[type] / (1024 * 1024)}MB limit`,
    };
  }
  
  // Check mime type
  if (allowedMimeTypes[type] && !allowedMimeTypes[type].includes(file.mimeType)) {
    return {
      valid: false,
      message: `Invalid file type. Allowed types: ${allowedMimeTypes[type].join(', ')}`,
    };
  }
  
  return {
    valid: true,
    message: 'File validation passed',
  };
};

/**
 * Fetch sensor data from wearable APIs
 * This is a placeholder - implement actual API integrations
 */
exports.fetchSensorData = async (userId, sensorType, timeRange) => {
  // TODO: Implement actual wearable API integrations
  // - Fitbit API
  // - Google Fit API
  // - Apple Health API
  // - Garmin API
  
  // For now, return mock data
  console.log(`Fetching ${sensorType} data for user ${userId} in range ${timeRange}`);
  
  return {
    source: 'manual', // or 'fitbit', 'googlefit', 'applehealth', 'garmin'
    sensorType,
    data: {},
    timestamp: new Date(),
    message: 'Wearable API integration not yet implemented. Please provide manual sensor data.',
  };
};

/**
 * Admin manual verification
 */
exports.adminVerifyQuest = async (userQuestId, adminId, approved, reason = '') => {
  const userQuest = await UserQuest.findById(userQuestId);
  if (!userQuest) {
    throw new Error('UserQuest not found');
  }
  
  userQuest.verificationStatus = approved ? 'VERIFIED' : 'REJECTED';
  userQuest.verificationMethod = 'ADMIN_OVERRIDE';
  userQuest.verifiedBy = adminId;
  userQuest.verifiedAt = Date.now();
  
  if (!approved && reason) {
    userQuest.rejectionReason = reason;
  }
  
  await userQuest.save();
  
  return {
    verified: approved,
    method: 'ADMIN_OVERRIDE',
    message: approved ? 'Quest verified by admin' : 'Quest rejected by admin',
    reason,
  };
};
