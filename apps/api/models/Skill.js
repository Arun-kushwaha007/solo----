const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  cost: {
    type: Number,
    default: 1, // Skill Points
  },
  requiredLevel: {
    type: Number,
    default: 1,
  },
  prerequisites: [String], // Array of Skill IDs
  effects: {
    type: Map,
    of: Number, // e.g., { "strength": 5 }
  },
  icon: String,
});

module.exports = mongoose.model('Skill', SkillSchema);
