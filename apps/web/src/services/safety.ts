import axios from 'axios';

const API_URL = 'http://localhost:5000/api/safety';

// Get token from localStorage (assuming Auth implementation stores it there)
const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const logSafetyEvent = async (type: 'CONSENT' | 'MOOD_CHECK' | 'CRISIS_RESOURCE_ACCESS', data: any) => {
  const response = await axios.post(`${API_URL}/log`, { type, data }, getConfig());
  return response.data;
};

export const getCrisisResources = async () => {
  const response = await axios.get(`${API_URL}/resources`);
  return response.data;
};
