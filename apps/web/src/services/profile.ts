import axios from 'axios';

const API_URL = 'http://localhost:5000/api/profile';

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProfile = async () => {
  const response = await axios.get(`${API_URL}/me`, getConfig());
  return response.data;
};

export const updateDemographics = async (data: any) => {
  const response = await axios.put(`${API_URL}/demographics`, data, getConfig());
  return response.data;
};

export const startCalibration = async () => {
  const response = await axios.post(`${API_URL}/calibration/start`, {}, getConfig());
  return response.data;
};

export const submitCalibration = async (data: any) => {
  const response = await axios.post(`${API_URL}/calibration/submit`, data, getConfig());
  return response.data;
};
