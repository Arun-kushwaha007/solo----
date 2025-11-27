import api from './api';
import type { Player, Quest } from '../types';

// Helper to map backend quest format to frontend format
interface BackendQuest {
  _id: string;
  userId: string;
  questId: number;
  title: string;
  description: string;
  difficulty: string;
  tasks: Array<{
    id: string;
    label: string;
    current: number;
    target: number;
    unit?: string;
  }>;
  completed: boolean;
  rewards: {
    xp: number;
    gold: number;
  };
}

const mapBackendQuest = (backendQuest: any): Quest => ({
  id: backendQuest.questId,
  title: backendQuest.title,
  description: backendQuest.description,
  difficulty: backendQuest.difficulty,
  tasks: backendQuest.tasks,
  completed: backendQuest.completed,
  rewards: backendQuest.rewards,
});

class GameService {
  async getPlayer(): Promise<Player> {
    const response = await api.get('/player');
    return response.data.data;
  }

  async allocateStat(stat: keyof Player['stats']): Promise<Player> {
    const response = await api.post('/player/allocate-stat', { stat });
    return response.data.data;
  }

  async getQuests(): Promise<Quest[]> {
    const response = await api.get('/quests');
    const backendQuests = response.data.data;
    return backendQuests.map(mapBackendQuest);
  }

  async updateTask(questId: number, taskId: string, amount: number = 1): Promise<Quest> {
    const response = await api.put(`/quests/${questId}/task/${taskId}`, { amount });
    return mapBackendQuest(response.data.data);
  }

  async completeQuest(questId: number): Promise<{ quest: Quest; player: Player; leveledUp: boolean }> {
    const response = await api.post(`/quests/${questId}/complete`);
    return {
      quest: mapBackendQuest(response.data.data.quest),
      player: response.data.data.player,
      leveledUp: response.data.data.leveledUp,
    };
  }
}

export default new GameService();
