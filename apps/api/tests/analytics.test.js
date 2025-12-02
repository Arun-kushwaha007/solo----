const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const AnalyticsService = require('../services/analytics');
const UserQuest = require('../models/UserQuest');
const XPLedger = require('../models/XPLedger');
const Profile = require('../models/Profile');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('AnalyticsService', () => {
  let userId;

  beforeEach(async () => {
    userId = new mongoose.Types.ObjectId();
    // Seed Profile
    await Profile.create({
      user: userId,
      xp: 1000,
      level: 10,
      stats: {
        strength: 50,
        agility: 40,
        focus: 60,
        vitality: 30,
        perception: 70
      }
    });
  });

  afterEach(async () => {
    await UserQuest.deleteMany({});
    await XPLedger.deleteMany({});
    await Profile.deleteMany({});
  });

  describe('calculateAdherence', () => {
    it('should calculate correct adherence rate', async () => {
      // Create 10 quests, 7 completed
      const quests = [];
      for (let i = 0; i < 10; i++) {
        quests.push({
          user: userId,
          quest: new mongoose.Types.ObjectId(),
          status: i < 7 ? 'COMPLETED' : 'ACTIVE',
          createdAt: new Date()
        });
      }
      await UserQuest.insertMany(quests);

      const adherence = await AnalyticsService.calculateAdherence(userId, 7);
      expect(adherence).toBe(70);
    });

    it('should return 0 if no quests found', async () => {
      const adherence = await AnalyticsService.calculateAdherence(userId, 7);
      expect(adherence).toBe(0);
    });
  });

  describe('getXpTrend', () => {
    it('should return correct trend based on ledger', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Initial balance implicitly 0
      // Day 1 (Yesterday): +100 XP
      await XPLedger.create({
        userId,
        source: 'QUEST',
        amount: 100,
        balanceAfter: 100,
        createdAt: yesterday
      });

      // Day 2 (Today): +50 XP
      await XPLedger.create({
        userId,
        source: 'QUEST',
        amount: 50,
        balanceAfter: 150,
        createdAt: today
      });

      const trend = await AnalyticsService.getXpTrend(userId, 7);
      
      // Check last 2 entries
      const lastEntry = trend[trend.length - 1]; // Today
      const prevEntry = trend[trend.length - 2]; // Yesterday
      
      expect(lastEntry.xp).toBe(150);
      expect(prevEntry.xp).toBe(100);
    });
  });

  describe('projectTrajectory', () => {
    it('should project growth based on history', async () => {
      // Seed history: steady growth of 10 XP/day for 30 days
      const entries = [];
      let balance = 0;
      const now = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        balance += 10;
        entries.push({
          userId,
          source: 'SYSTEM',
          amount: 10,
          balanceAfter: balance,
          createdAt: d
        });
      }
      await XPLedger.insertMany(entries);
      
      // Update profile XP to match current balance
      await Profile.updateOne({ user: userId }, { xp: balance });

      const projection = await AnalyticsService.projectTrajectory(userId);
      
      expect(projection.length).toBe(12);
      // Week 1 projection: current (310) + 7 * 10 = 380
      // Allow some floating point variance in regression
      expect(projection[0].xp).toBeGreaterThan(370);
      expect(projection[0].xp).toBeLessThan(390);
    });
  });
});
