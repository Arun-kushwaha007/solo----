import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Player, Quest, Item, LifeCategory } from '../types';
import gameService from '../services/game.service';

interface GameContextType {
  player: Player | null;
  quests: Quest[];
  inventory: (Item | null)[];
  loading: boolean;
  error: string | null;
  selectedCategory: LifeCategory;
  setSelectedCategory: (category: LifeCategory) => void;
  updateTaskProgress: (questId: number, taskId: string, amount?: number) => Promise<void>;
  completeQuest: (questId: number) => Promise<{ leveledUp: boolean }>;
  allocateStatPoint: (category: LifeCategory, stat: 'primary' | 'secondary' | 'tertiary') => Promise<void>;
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [inventory, _setInventory] = useState<(Item | null)[]>(Array(20).fill(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<LifeCategory>('physical');

  // Fetch initial data when component mounts
  const fetchGameData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [playerData, questsData] = await Promise.all([
        gameService.getPlayer(),
        gameService.getQuests(),
      ]);

      setPlayer(playerData);
      setQuests(questsData);
      
      // Set selected category to first selected category
      if (playerData.selectedCategories && playerData.selectedCategories.length > 0) {
        setSelectedCategory(playerData.selectedCategories[0]);
      }
    } catch (err: any) {
      console.error('Failed to fetch game data:', err);
      setError(err.response?.data?.message || 'Failed to load game data');
      setQuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  const refreshData = async () => {
    await fetchGameData();
  };

  const updateTaskProgress = async (questId: number, taskId: string, amount: number = 1) => {
    try {
      const updatedQuest = await gameService.updateTask(questId, taskId, amount);
      
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? updatedQuest : q))
      );
    } catch (err: any) {
      console.error('Failed to update task:', err);
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const completeQuest = async (questId: number): Promise<{ leveledUp: boolean }> => {
    try {
      const { quest, player: updatedPlayer, leveledUp } = await gameService.completeQuest(questId);

      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? quest : q))
      );
      setPlayer(updatedPlayer);

      return { leveledUp };
    } catch (err: any) {
      console.error('Failed to complete quest:', err);
      setError(err.response?.data?.message || 'Failed to complete quest');
      return { leveledUp: false };
    }
  };

  const allocateStatPoint = async (category: LifeCategory, stat: 'primary' | 'secondary' | 'tertiary') => {
    try {
      const updatedPlayer = await gameService.allocateStat(category, stat);
      setPlayer(updatedPlayer);
    } catch (err: any) {
      console.error('Failed to allocate stat:', err);
      setError(err.response?.data?.message || 'Failed to allocate stat point');
    }
  };

  return (
    <GameContext.Provider
      value={{
        player,
        quests,
        inventory,
        loading,
        error,
        selectedCategory,
        setSelectedCategory,
        updateTaskProgress,
        completeQuest,
        allocateStatPoint,
        refreshData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
