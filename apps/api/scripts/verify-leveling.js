const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testLeveling = async () => {
  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'test1764453129169@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✅ Login Successful');

    // 2. Add XP (Level Up Test)
    console.log('\n2. Adding XP (Should trigger Level Up)...');
    // Level 1 -> 2 needs approx 100 XP (with constant 0.1, 100^0.5 * 0.1 = 1 + 1 = 2)
    const xpRes = await axios.post(`${API_URL}/leveling/xp`, {
      amount: 500
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ XP Added. Leveled Up:', xpRes.data.data.leveledUp);
    console.log('Current Level:', xpRes.data.data.profile.level);
    console.log('Stats (Strength):', xpRes.data.data.profile.stats.strength);

    // 3. Get Skills
    console.log('\n3. Fetching Skills...');
    const skillsRes = await axios.get(`${API_URL}/leveling/skills`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Skills Fetched:', skillsRes.data.data.length);

  } catch (err) {
    console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
  }
};

testLeveling();
