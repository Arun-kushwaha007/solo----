import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics';

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAnalyticsDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard`, getConfig());
  return response.data;
};
