import api from './api';
import type { Player, Quest, LifeCategory } from '../types';

// Helper to map backend quest format to frontend format
const mapBackendQuest = (backendQuest: any): Quest => ({
  id: backendQuest.questId,
  category: backendQuest.category,
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

  async allocateStat(category: LifeCategory, stat: 'primary' | 'secondary' | 'tertiary'): Promise<Player> {
    const response = await api.post('/player/allocate-stat', { category, stat });
    return response.data.data;
  }

  async getShopItems(): Promise<any[]> {
    const response = await api.get('/shop');
    return response.data.data;
  }

  async buyItem(itemId: string, quantity: number = 1): Promise<Player> {
    const response = await api.post('/shop/buy', { itemId, quantity });
    return response.data.data.player;
  }

  async getAnalytics(): Promise<any> {
    const response = await api.get('/analytics');
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
