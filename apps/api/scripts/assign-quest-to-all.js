const mongoose = require('mongoose');
const User = require('../models/User');
const Quest = require('../models/Quest');
const UserQuest = require('../models/UserQuest');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/solo-leveling');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const assignQuestToAllUsers = async () => {
  await connectDB();

  try {
    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);

    // Get the Strength Training quest
    const quest = await Quest.findOne({ title: 'Strength Training I' });
    if (!quest) {
      console.log('Quest not found');
      process.exit(1);
    }

    console.log(`Quest: ${quest.title}\n`);

    let assigned = 0;
    let skipped = 0;

    for (const user of users) {
      // Check if user already has this quest
      const existingUserQuest = await UserQuest.findOne({
        user: user._id,
        quest: quest._id
      });

      if (existingUserQuest) {
        console.log(`✓ ${user.email || user.name} - already has quest`);
        skipped++;
        continue;
      }

      // Create UserQuest
      await UserQuest.create({
        user: user._id,
        quest: quest._id,
        status: 'ACTIVE'
      });

      console.log(`✓ ${user.email || user.name} - quest assigned`);
      assigned++;
    }

    console.log(`\n=== Summary ===`);
    console.log(`Assigned: ${assigned}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${users.length}`);
    console.log(`\nRefresh your browser to see the quest!`);

  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

assignQuestToAllUsers();
