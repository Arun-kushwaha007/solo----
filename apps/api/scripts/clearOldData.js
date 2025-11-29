// Run this script to clear all old user data and start fresh with the new multi-category system
// Usage: node scripts/clearOldData.js

const mongoose = require('mongoose');
require('dotenv').config();

const clearOldData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('players').deleteMany({});
    await mongoose.connection.db.collection('quests').deleteMany({});

    console.log('✅ All old data cleared!');
    console.log('You can now create a new account with the multi-category system.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearOldData();
