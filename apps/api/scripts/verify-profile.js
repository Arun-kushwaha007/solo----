const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testProfile = async () => {
  try {
    // 1. Login to get token
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'test1764453129169@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✅ Login Successful');

    // 2. Get Profile (Should auto-create)
    console.log('\n2. Fetching Profile (Auto-create)...');
    const profileRes = await axios.get(`${API_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile Fetched:', profileRes.data.data.rank);

    // 3. Update Demographics
    console.log('\n3. Updating Demographics...');
    const updateRes = await axios.put(`${API_URL}/profile/demographics`, {
      age: 25,
      height: 180,
      weight: 75,
      gender: 'Male'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Demographics Updated:', updateRes.data.data.demographics.age);

    // 4. Start Calibration
    console.log('\n4. Starting Calibration...');
    const startRes = await axios.post(`${API_URL}/profile/calibration/start`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Calibration Started:', startRes.data.data.calibration.status);

    // 5. Submit Calibration
    console.log('\n5. Submitting Calibration...');
    const submitRes = await axios.post(`${API_URL}/profile/calibration/submit`, {
      pushups: 20,
      runTime: 12, // minutes
      focusScore: 8
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Calibration Submitted:', submitRes.data.data.calibration.status);
    console.log('✅ New Stats:', submitRes.data.data.stats);

  } catch (err) {
    console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
  }
};

testProfile();
