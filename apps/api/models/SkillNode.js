const mongoose = require('mongoose');

const SkillNodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['physical', 'mental', 'professional', 'creative', 'social', 'financial', 'spiritual'],
    required: true
  },
  cost: {
    type: Number,
    default: 1
  },
  prerequisites: [{
    type: String, // IDs of other SkillNodes
    ref: 'SkillNode'
  }],
  bonuses: {
    type: Map,
    of: Number, // e.g., { "xp_multiplier": 0.05, "strength": 2 }
    default: {}
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  icon: {
    type: String,
    default: 'default_skill'
  }
});

module.exports = mongoose.model('SkillNode', SkillNodeSchema);
