const XPRule = require('../models/XPRule');
const Player = require('../models/Player');
const Profile = require('../models/Profile');

/**
 * XP Rules Engine Service
 * Calculates XP based on configurable rules stored in the database
 */

/**
 * Calculate total XP for a quest completion
 * @param {Object} quest - The quest object
 * @param {Object} userQuest - The user quest object
 * @param {String} userId - User ID
 * @returns {Object} - { totalXP, breakdown: { baseXP, bonusXP, multiplier, rulesApplied } }
 */
exports.calculateQuestXP = async (quest, userQuest, userId) => {
  try {
    // Get active rules sorted by priority
    const rules = await XPRule.find({ isActive: true }).sort({ priority: -1 });
    
    // Get user data for context
    const profile = await Profile.findOne({ user: userId });
    const player = await Player.findOne({ userId });
    
    // Start with base XP from quest
    let baseXP = quest.rewards?.xp || 100;
    let bonusXP = 0;
    let totalMultiplier = 1.0;
    const rulesApplied = [];
    
    // Context object for rule evaluation
    const context = {
      quest,
      userQuest,
      profile,
      player,
      userId,
      baseXP,
    };
    
    // Apply each rule
    for (const rule of rules) {
      // Check if rule applies to this quest
      if (!doesRuleApply(rule, context)) {
        continue;
      }
      
      // Get calculation (check for user override first)
      const calculation = getUserOverride(rule, userId) || rule.calculation;
      
      // Apply the rule
      const result = applyRule(rule, calculation, context);
      
      if (result.applied) {
        rulesApplied.push(rule.name);
        
        switch (calculation.type) {
          case 'FIXED':
            bonusXP += result.value;
            break;
          case 'PERCENTAGE':
            bonusXP += baseXP * (result.value / 100);
            break;
          case 'MULTIPLIER':
            totalMultiplier *= result.value;
            break;
          case 'FORMULA':
            // Formula results are added to bonus
            bonusXP += result.value;
            break;
        }
      }
    }
    
    // Calculate final XP
    const totalXP = Math.floor((baseXP + bonusXP) * totalMultiplier);
    
    return {
      totalXP,
      breakdown: {
        baseXP,
        bonusXP: Math.floor(bonusXP),
        multiplier: totalMultiplier,
        rulesApplied,
      },
    };
  } catch (error) {
    console.error('Error calculating quest XP:', error);
    // Fallback to base XP if calculation fails
    return {
      totalXP: quest.rewards?.xp || 100,
      breakdown: {
        baseXP: quest.rewards?.xp || 100,
        bonusXP: 0,
        multiplier: 1.0,
        rulesApplied: [],
        error: error.message,
      },
    };
  }
};

/**
 * Check if a rule applies to the current context
 */
function doesRuleApply(rule, context) {
  const { quest, profile, player } = context;
  const conditions = rule.conditions || {};
  
  // Check quest type
  if (conditions.questTypes && conditions.questTypes.length > 0) {
    if (!conditions.questTypes.includes(quest.type)) {
      return false;
    }
  }
  
  // Check quest difficulty
  if (conditions.questDifficulties && conditions.questDifficulties.length > 0) {
    if (!conditions.questDifficulties.includes(quest.difficulty)) {
      return false;
    }
  }
  
  // Check category
  if (conditions.categories && conditions.categories.length > 0) {
    if (!quest.category || !conditions.categories.includes(quest.category)) {
      return false;
    }
  }
  
  // Check tags
  if (conditions.tags && conditions.tags.length > 0) {
    const questTags = quest.tags || [];
    const hasMatchingTag = conditions.tags.some(tag => questTags.includes(tag));
    if (!hasMatchingTag) {
      return false;
    }
  }
  
  // Check level range
  if (conditions.minLevel && profile && profile.level < conditions.minLevel) {
    return false;
  }
  if (conditions.maxLevel && profile && profile.level > conditions.maxLevel) {
    return false;
  }
  
  // Check streak requirement
  if (conditions.requiresStreak && player) {
    if ((player.loginStreak || 0) < conditions.requiresStreak) {
      return false;
    }
  }
  
  return true;
}

/**
 * Apply a single rule and return the result
 */
function applyRule(rule, calculation, context) {
  const { quest, userQuest, profile, player, baseXP } = context;
  
  try {
    switch (calculation.type) {
      case 'FIXED':
        return { applied: true, value: calculation.value || 0 };
        
      case 'PERCENTAGE':
        return { applied: true, value: calculation.value || 0 };
        
      case 'MULTIPLIER':
        return { applied: true, value: calculation.multiplier || 1.0 };
        
      case 'FORMULA':
        // Evaluate custom formula
        const value = evaluateFormula(calculation.formula, {
          baseXP,
          quest,
          userQuest,
          profile,
          player,
          streak: player?.loginStreak || 0,
          level: profile?.level || 1,
        });
        
        // Apply cap and floor
        let finalValue = value;
        if (calculation.cap && finalValue > calculation.cap) {
          finalValue = calculation.cap;
        }
        if (calculation.floor && finalValue < calculation.floor) {
          finalValue = calculation.floor;
        }
        
        return { applied: true, value: finalValue };
        
      default:
        return { applied: false, value: 0 };
    }
  } catch (error) {
    console.error(`Error applying rule ${rule.name}:`, error);
    return { applied: false, value: 0 };
  }
}

/**
 * Evaluate a formula string
 * Simple and safe formula evaluation
 */
function evaluateFormula(formula, variables) {
  if (!formula) return 0;
  
  try {
    // Replace variables in formula
    let expression = formula;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expression = expression.replace(regex, value);
    }
    
    // Safe evaluation (only allow numbers and basic math operators)
    const safeExpression = expression.replace(/[^0-9+\-*/.() ]/g, '');
    
    // Use Function constructor for evaluation (safer than eval)
    const result = new Function(`return ${safeExpression}`)();
    
    return isNaN(result) ? 0 : result;
  } catch (error) {
    console.error('Error evaluating formula:', error);
    return 0;
  }
}

/**
 * Get user-specific override for a rule
 */
function getUserOverride(rule, userId) {
  if (!rule.overrides || rule.overrides.length === 0) {
    return null;
  }
  
  const override = rule.overrides.find(
    o => o.userId.toString() === userId.toString()
  );
  
  return override ? override.calculation : null;
}

/**
 * Create a new XP rule (Admin only)
 */
exports.createRule = async (ruleData) => {
  const rule = await XPRule.create(ruleData);
  return rule;
};

/**
 * Update an XP rule (Admin only)
 */
exports.updateRule = async (ruleId, updates) => {
  const rule = await XPRule.findByIdAndUpdate(
    ruleId,
    { ...updates, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  return rule;
};

/**
 * Delete an XP rule (Admin only)
 */
exports.deleteRule = async (ruleId) => {
  const rule = await XPRule.findByIdAndDelete(ruleId);
  return rule;
};

/**
 * Add user-specific override (Admin only)
 */
exports.addUserOverride = async (ruleId, userId, overrideData, adminId) => {
  const rule = await XPRule.findById(ruleId);
  if (!rule) throw new Error('Rule not found');
  
  // Remove existing override for this user if any
  rule.overrides = rule.overrides.filter(
    o => o.userId.toString() !== userId.toString()
  );
  
  // Add new override
  rule.overrides.push({
    userId,
    ...overrideData,
    createdBy: adminId,
    createdAt: Date.now(),
  });
  
  await rule.save();
  return rule;
};

/**
 * Get all active rules
 */
exports.getActiveRules = async () => {
  return await XPRule.find({ isActive: true }).sort({ priority: -1 });
};

/**
 * Get all rules (Admin only)
 */
exports.getAllRules = async () => {
  return await XPRule.find().sort({ priority: -1 });
};

/**
 * Test a rule with sample data
 */
exports.testRule = async (ruleId, testContext) => {
  const rule = await XPRule.findById(ruleId);
  if (!rule) throw new Error('Rule not found');
  
  const applies = doesRuleApply(rule, testContext);
  
  if (!applies) {
    return {
      applies: false,
      reason: 'Rule conditions not met',
    };
  }
  
  const result = applyRule(rule, rule.calculation, testContext);
  
  return {
    applies: true,
    result,
    calculation: rule.calculation,
  };
};
