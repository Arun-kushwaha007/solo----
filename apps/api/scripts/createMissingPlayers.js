require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');

const createMissingPlayers = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/solo_leveling');
    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if player already exists
      const existingPlayer = await Player.findOne({ userId: user._id });
      
      if (existingPlayer) {
        console.log(`Player already exists for user: ${user.email}`);
        skipped++;
        continue;
      }

      // Create player document
      await Player.create({
        userId: user._id,
        name: user.displayName || user.name,
        selectedCategories: [],
      });

      console.log(`Created player for user: ${user.email}`);
      created++;
    }

    console.log(`\nMigration complete!`);
    console.log(`Created: ${created} players`);
    console.log(`Skipped: ${skipped} players (already existed)`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

createMissingPlayers();
