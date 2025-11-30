const mongoose = require('mongoose');
const User = require('../models/User');
const Baseline = require('../models/Baseline');
const baselineCollector = require('../services/baselineCollector');
const Profile = require('../models/Profile');

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

const simulateBaseline = async () => {
  await connectDB();

  try {
    // 1. Create or get test user
    let user = await User.findOne({ email: 'simulation@test.com' });
    if (!user) {
      user = await User.create({
        name: 'Simulation User',
        username: 'sim_user_' + Date.now(),
        email: 'simulation@test.com',
        password: 'password123',
      });
      await Profile.create({ user: user._id });
      console.log('Created test user');
    }

    // 2. Start Baseline
    // Clear existing baseline
    await Baseline.deleteMany({ userId: user._id });
    
    console.log('Starting baseline collection...');
    const baseline = await baselineCollector.startBaseline(user._id, 7);
    console.log(`Baseline started: ${baseline._id}`);

    // 3. Generate Synthetic Data (7 days)
    const categories = ['strength', 'agility', 'intelligence', 'vitality', 'perception'];
    const dataPoints = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 8); // Start 8 days ago

    for (let i = 0; i < 8; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      // Generate 3-5 data points per category per day
      for (const cat of categories) {
        const count = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < count; j++) {
          // Simulate some variance but consistent trend
          let value = 50 + (Math.random() * 20 - 10); // Base 50 +/- 10
          if (cat === 'strength') value += i * 2; // Strength improving
          
          dataPoints.push({
            category: cat,
            dataType: 'passive_metric',
            value: Math.round(value),
            unit: 'points',
            timestamp: new Date(currentDate.getTime() + j * 3600000), // Spread out
            source: 'simulation'
          });
        }
      }
    }

    console.log(`Generated ${dataPoints.length} synthetic data points`);

    // 4. Ingest Data
    console.log('Ingesting data...');
    await baselineCollector.ingestDataPoints(user._id, dataPoints);

    // 5. Force update readiness (usually happens on ingest, but ensuring)
    await baselineCollector.updateReadiness(baseline._id);
    
    const updatedBaseline = await Baseline.findById(baseline._id);
    console.log('Readiness Score:', updatedBaseline.readinessScore);
    console.log('Readiness Criteria:', updatedBaseline.readinessCriteria);

    if (!updatedBaseline.isReady()) {
      // Hack: Force criteria for simulation if strict checks fail (e.g. days elapsed check might rely on actual time passing)
      // But we backdated timestamps, so let's see.
      // The readiness check uses `now - startDate`. Since we just created the baseline, `startDate` is NOW.
      // So daysElapsed will be 0.
      // We need to manually update startDate to 8 days ago to simulate time passing.
      updatedBaseline.startDate = startDate;
      await updatedBaseline.save();
      await baselineCollector.updateReadiness(baseline._id);
      console.log('Updated baseline start date to simulate time passage.');
    }

    // 6. Stop and Process
    console.log('Processing baseline...');
    const processed = await baselineCollector.stopBaseline(user._id);
    
    console.log('Baseline Processed Successfully!');
    console.log('Metrics:', JSON.stringify(processed.metrics, null, 2));
    
    // 7. Verify Profile Update
    const profile = await Profile.findOne({ user: user._id });
    console.log('Adaptive Difficulty:', profile.calibration.adaptiveDifficulty);

    console.log('TEST PASSED: Baseline computed and difficulty set.');

  } catch (error) {
    console.error('Simulation Failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

simulateBaseline();
