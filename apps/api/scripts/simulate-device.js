const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
// You need to login first to get a token. For this script, we'll assume we can get one or mock it if we disable auth for testing.
// Since we can't easily login via script without a UI flow or a specific test user with known creds, 
// we might need to temporarily bypass auth or use a known token. 
// For this verification, I'll assume we have a way to get a token or I'll add a temporary "dev-token" endpoint or similar if needed.
// BUT, since I am the agent, I can actually create a user and get a token via the API if I want to be thorough.

async function runSimulation() {
  try {
    // 1. Login to get token (assuming a test user exists or we create one)
    // For simplicity, let's assume we're running this in a context where we can just hit the endpoint if we had a token.
    // I will try to register a new user for this test.
    
    const email = `test_wearable_${Date.now()}@example.com`;
    const password = 'password123';
    
    console.log('Registering test user...');
    const authRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Wearable Tester',
      email,
      password
    });
    
    const token = authRes.data.token;
    console.log('Got token:', token);
    
    // 2. Generate synthetic data
    const provider = 'google_fit';
    const now = new Date();
    const dataPoints = [];
    
    // Generate 60 minutes of step data
    for (let i = 0; i < 60; i++) {
      const time = new Date(now.getTime() - (60 - i) * 60000);
      dataPoints.push({
        type: 'steps',
        value: Math.floor(Math.random() * 100), // 0-100 steps per minute
        unit: 'count',
        timestamp: time.toISOString(),
        confidence: 95,
        deviceId: 'simulated_device_001'
      });
      
      // Also add some heart rate data
      dataPoints.push({
        type: 'heart_rate',
        value: 60 + Math.floor(Math.random() * 40), // 60-100 bpm
        unit: 'bpm',
        timestamp: time.toISOString(),
        confidence: 90,
        deviceId: 'simulated_device_001'
      });
    }
    
    console.log(`Generated ${dataPoints.length} data points.`);
    
    // 3. Ingest data
    console.log('Ingesting data...');
    const ingestRes = await axios.post(
      `${API_URL}/integrations/${provider}/ingest`,
      { data: dataPoints },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Ingestion result:', ingestRes.data);
    
    // 4. Verify data retrieval
    console.log('Verifying data retrieval...');
    const start = new Date(now.getTime() - 65 * 60000).toISOString();
    const end = now.toISOString();
    
    const getRes = await axios.get(
      `${API_URL}/integrations/${provider}/data?start=${start}&end=${end}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log(`Retrieved ${getRes.data.count} records.`);
    
    if (getRes.data.count === dataPoints.length) {
      console.log('SUCCESS: Retrieved count matches ingested count.');
    } else {
      console.error('FAILURE: Count mismatch.');
    }

  } catch (error) {
    console.error('Simulation failed:', error.response ? error.response.data : error.message);
  }
}

runSimulation();
