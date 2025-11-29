import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leveling';

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getSkills = async () => {
  const response = await axios.get(`${API_URL}/skills`, getConfig());
  return response.data;
};

export const unlockSkill = async (skillId: string) => {
  const response = await axios.post(`${API_URL}/skills/unlock`, { skillId }, getConfig());
  return response.data;
};
