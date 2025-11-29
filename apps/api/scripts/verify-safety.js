const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testSafety = async () => {
  try {
    // 1. Login to get token
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'test1764453129169@example.com', // Using the user created in previous step
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✅ Login Successful');

    // 2. Get Crisis Resources (Public)
    console.log('\n2. Fetching Crisis Resources...');
    const resourcesRes = await axios.get(`${API_URL}/safety/resources`);
    console.log('✅ Resources Fetched:', resourcesRes.data.data.length, 'items');

    // 3. Log Consent (Private)
    console.log('\n3. Logging Consent...');
    const consentRes = await axios.post(`${API_URL}/safety/log`, {
      type: 'CONSENT',
      data: { version: '1.0', agreed: true, timestamp: new Date() }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Consent Logged:', consentRes.data.success);

    // 4. Log Mood Check (Private) - Normal
    console.log('\n4. Logging Normal Mood...');
    const moodRes = await axios.post(`${API_URL}/safety/log`, {
      type: 'MOOD_CHECK',
      data: { score: 5, note: 'Feeling great' }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Mood Logged:', moodRes.data.success, '| Crisis Triggered:', moodRes.data.crisisTriggered);

    // 5. Log Mood Check (Private) - Crisis Trigger
    console.log('\n5. Logging Low Mood (Crisis Trigger)...');
    const crisisRes = await axios.post(`${API_URL}/safety/log`, {
      type: 'MOOD_CHECK',
      data: { score: 1, note: 'Not feeling well' }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Mood Logged:', crisisRes.data.success, '| Crisis Triggered:', crisisRes.data.crisisTriggered);

  } catch (err) {
    console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
  }
};

testSafety();
