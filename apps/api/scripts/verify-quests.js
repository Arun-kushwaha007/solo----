const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testQuests = async () => {
  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'test1764453129169@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✅ Login Successful');

    // 2. Create Quest (Admin - Mock)
    console.log('\n2. Creating Quest...');
    const createRes = await axios.post(`${API_URL}/quests`, {
      title: 'Daily Pushups',
      description: 'Do 100 pushups',
      type: 'DAILY',
      difficulty: 'E',
      rewards: { xp: 100, gold: 10 }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const questId = createRes.data.data._id;
    console.log('✅ Quest Created:', createRes.data.data.title);

    // 3. List Quests
    console.log('\n3. Listing Quests...');
    const listRes = await axios.get(`${API_URL}/quests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Quests Found:', listRes.data.data.length);

    // 4. Accept Quest
    console.log('\n4. Accepting Quest...');
    const acceptRes = await axios.post(`${API_URL}/quests/${questId}/accept`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Quest Accepted:', acceptRes.data.data.status);

    // 5. Complete Quest
    console.log('\n5. Completing Quest...');
    const completeRes = await axios.post(`${API_URL}/quests/${questId}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Quest Completed:', completeRes.data.data.userQuest.status);
    console.log('✅ XP Gained:', completeRes.data.data.rewards.xp);
    console.log('✅ Leveled Up:', completeRes.data.data.leveling.leveledUp);

  } catch (err) {
    console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
  }
};

testQuests();
