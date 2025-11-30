const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const questRoutes = require('../routes/quest');
const Quest = require('../models/Quest');
const UserQuest = require('../models/UserQuest');
const User = require('../models/User');
const Profile = require('../models/Profile');
const XPRule = require('../models/XPRule');

// Mock services if needed, but we want integration test so we use real services
// We might need to mock LevelingService if it has external dependencies, but it seems DB only.

const app = express();
app.use(express.json());

// Mock auth middleware to populate req.user
app.use((req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, 'testsecret');
      req.user = { id: decoded.id };
    } catch (err) {
      // Invalid token
    }
  }
  next();
});

app.use('/api/quests', questRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create test user
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });
  userId = user._id;

  // Create profile for user (needed for leveling)
  await Profile.create({
    user: userId,
    level: 1,
    xp: 0,
    stats: { strength: 10, agility: 10, intelligence: 10, vitality: 10, perception: 10 }
  });

  // Create player (needed for XP rules)
  const Player = require('../models/Player');
  await Player.create({
    userId: userId,
    username: 'Test User',
    email: 'test@example.com',
    class: 'None',
  });

  token = jwt.sign({ id: user._id }, 'testsecret', { expiresIn: '1h' });
  process.env.JWT_SECRET = 'testsecret'; // For the real auth middleware if used
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Quest.deleteMany({});
  await UserQuest.deleteMany({});
  await XPRule.deleteMany({});
});

describe('Quest API', () => {
  
  describe('POST /api/quests', () => {
    it('should create a new quest', async () => {
      const res = await request(app)
        .post('/api/quests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Daily Run',
          description: 'Run 5km',
          type: 'DAILY',
          xpValue: 100,
          verificationType: 'MANUAL',
          rewards: { xp: 100 }
        });

      if (res.status !== 201) console.log('Create Quest Error:', res.body);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Daily Run');
    });
  });

  describe('Quest Flow', () => {
    let questId;

    beforeEach(async () => {
      const quest = await Quest.create({
        title: 'Pushups',
        description: 'Do 50 pushups',
        type: 'DAILY',
        verificationType: 'AUTO_PHOTO',
        rewards: { xp: 100 },
        evidenceRequired: true,
        evidenceTypes: ['PHOTO']
      });
      questId = quest._id;
    });

    it('should accept a quest', async () => {
      const res = await request(app)
        .post(`/api/quests/${questId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      if (res.status !== 200) console.log('Accept Quest Error:', res.body);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const userQuest = await UserQuest.findOne({ user: userId, quest: questId });
      expect(userQuest).toBeTruthy();
      expect(userQuest.status).toBe('ACTIVE');
    });

    it('should fail to complete quest without evidence if required', async () => {
      // Accept first
      await request(app)
        .post(`/api/quests/${questId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      // Try complete
      const res = await request(app)
        .patch(`/api/quests/${questId}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Verification failed');
    });

    it('should complete quest with valid evidence and award XP', async () => {
      // Accept first
      await request(app)
        .post(`/api/quests/${questId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      // Complete
      const res = await request(app)
        .patch(`/api/quests/${questId}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          evidence: [{ type: 'PHOTO', data: 'base64data', mimeType: 'image/jpeg' }]
        });

      if (res.status !== 200) console.log('Complete Quest Error:', res.body);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userQuest.status).toBe('COMPLETED');
      expect(res.body.data.userQuest.xpAwarded).toBe(100);

      // Check profile XP
      const profile = await Profile.findOne({ user: userId });
      expect(profile.xp).toBe(100);
    });

    it('should apply XP rules', async () => {
      // Create a rule: +50 XP for DAILY quests
      await XPRule.create({
        name: 'Daily Bonus',
        description: 'Bonus for daily quests',
        ruleType: 'CATEGORY_BONUS',
        conditions: { questTypes: ['DAILY'] },
        calculation: { type: 'FIXED', value: 50 },
        isActive: true
      });

      // Accept first
      await request(app)
        .post(`/api/quests/${questId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      // Complete
      const res = await request(app)
        .patch(`/api/quests/${questId}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          evidence: [{ type: 'PHOTO', data: 'base64data', mimeType: 'image/jpeg' }]
        });

      if (res.status !== 200) console.log('XP Rule Error:', res.body);
      expect(res.status).toBe(200);
      expect(res.body.data.userQuest.xpAwarded).toBe(150); // 100 base + 50 bonus
      expect(res.body.data.rewards.breakdown.bonusXP).toBe(50);
    });
    
    it('should retrieve evidence', async () => {
       // Accept first
      await request(app)
        .post(`/api/quests/${questId}/accept`)
        .set('Authorization', `Bearer ${token}`);

      // Complete
      await request(app)
        .patch(`/api/quests/${questId}/complete`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          evidence: [{ type: 'PHOTO', data: 'base64data', mimeType: 'image/jpeg' }]
        });
        
      const res = await request(app)
        .get(`/api/quests/${questId}/evidence`)
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].type).toBe('PHOTO');
    });
  });
});
