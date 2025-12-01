const mongoose = require('mongoose');
const User = require('../models/User');
const Quest = require('../models/Quest');

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/solo-leveling', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const createStarterQuest = async () => {
  await connectDB();

  try {
    // Check if starter quest already exists
    const existingQuest = await Quest.findOne({ title: 'Strength Training I' });
    if (existingQuest) {
      console.log('Starter quest already exists:', existingQuest._id);
      process.exit(0);
    }

    // Create starter quest
    const quest = await Quest.create({
      title: 'Strength Training I',
      description: 'Complete your first strength training session to earn XP and level up!',
      category: 'physical',
      type: 'DAILY',
      difficulty: 'E', // E-rank (easiest)
      tasks: [
        {
          id: 'pushups',
          label: 'Pushups',
          target: 10,
          current: 0,
          unit: 'reps'
        },
        {
          id: 'squats',
          label: 'Squats',
          target: 10,
          current: 0,
          unit: 'reps'
        }
      ],
      rewards: {
        xp: 100,
        gold: 50
      },
      verificationType: 'MANUAL', // String, not object
      isActive: true,
      createdBy: 'system'
    });

    console.log('Starter quest created successfully!');
    console.log('Quest ID:', quest._id);
    console.log('Title:', quest.title);
    console.log('Rewards:', quest.rewards);

  } catch (error) {
    console.error('Failed to create starter quest:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createStarterQuest();
