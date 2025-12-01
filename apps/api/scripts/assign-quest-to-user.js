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

const assignQuestToUser = async () => {
  await connectDB();

  try {
    // Get the most recent user
    const user = await User.findOne().sort({ createdAt: -1 });
    if (!user) {
      console.log('No users found');
      process.exit(1);
    }

    console.log(`Found user: ${user.email} (${user.name})`);

    // Get the Strength Training quest
    const quest = await Quest.findOne({ title: 'Strength Training I' });
    if (!quest) {
      console.log('Quest not found');
      process.exit(1);
    }

    console.log(`Found quest: ${quest.title}`);

    // Check if user already has this quest
    const existingUserQuest = await UserQuest.findOne({
      user: user._id,
      quest: quest._id
    });

    if (existingUserQuest) {
      console.log('User already has this quest assigned');
      console.log('Status:', existingUserQuest.status);
      process.exit(0);
    }

    // Create UserQuest with basic structure
    const userQuest = await UserQuest.create({
      user: user._id,
      quest: quest._id,
      status: 'ACTIVE'
    });

    console.log('Quest assigned successfully!');
    console.log('UserQuest ID:', userQuest._id);
    console.log('Status:', userQuest.status);
    console.log('\nNow refresh your browser and check the DASHBOARD or QUESTS tab!');

  } catch (error) {
    console.error('Failed to assign quest:', error);
  } finally {
    await mongoose.disconnect();
  }
};

assignQuestToUser();
