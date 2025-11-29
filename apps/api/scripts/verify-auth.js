const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

const testAuth = async () => {
  try {
    console.log('1. Testing Registration...');
    const registerRes = await axios.post(`${API_URL}/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    console.log('✅ Registration Successful:', registerRes.data.success);
    const token = registerRes.data.token;

    console.log('\n2. Testing Login...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: registerRes.data.user.email,
      password: 'password123'
    });
    console.log('✅ Login Successful:', loginRes.data.success);

    console.log('\n3. Testing Get Me (Protected Route)...');
    const meRes = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get Me Successful:', meRes.data.success);
    console.log('User:', meRes.data.data.email);

  } catch (err) {
    console.error('❌ Test Failed:', err.response ? err.response.data : err.message);
  }
};

testAuth();
