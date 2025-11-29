import axios from 'axios';

const API_URL = 'http://localhost:5000/api/quests';

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getQuests = async () => {
  const response = await axios.get(`${API_URL}`, getConfig());
  return response.data;
};

export const acceptQuest = async (questId: string) => {
  const response = await axios.post(`${API_URL}/${questId}/accept`, {}, getConfig());
  return response.data;
};

export const completeQuest = async (questId: string) => {
  const response = await axios.post(`${API_URL}/${questId}/complete`, {}, getConfig());
  return response.data;
};
