const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testAnalytics = async () => {
  try {
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'test1764453129169@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('✅ Login Successful');

    console.log('\n2. Fetching Analytics Dashboard...');
    const analyticsRes = await axios.get(`${API_URL}/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Analytics Fetched');
    console.log('Adherence Rate:', analyticsRes.data.data.adherence + '%');
    console.log('XP Trend (Last 7 Days):', analyticsRes.data.data.xpTrend.length, 'data points');
    console.log('12-Week Projection:', analyticsRes.data.data.trajectory.length, 'weeks');
    console.log('Projected Level (Week 12):', analyticsRes.data.data.trajectory[11].level);

  } catch (err) {
    console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
  }
};

testAnalytics();
