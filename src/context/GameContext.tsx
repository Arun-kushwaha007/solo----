import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Player, Quest, Item } from '../types';
import gameService from '../services/game.service';

interface GameContextType {
  player: Player | null;
  quests: Quest[];
  inventory: (Item | null)[];
  loading: boolean;
  error: string | null;
  updateTaskProgress: (questId: number, taskId: string, amount?: number) => Promise<void>;
  completeQuest: (questId: number) => Promise<{ leveledUp: boolean }>;
  allocateStatPoint: (stat: keyof Player['stats']) => Promise<void>;
  refreshData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const INITIAL_PLAYER: Player = {
  name: "SUNG JIN-WOO",
  job: "NONE",
  title: "NONE",
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  hp: 100,
  maxHp: 100,
  mp: 10,
  maxMp: 10,
  fatigue: 0,
  stats: {
    strength: 10,
    agility: 10,
    sense: 10,
    vitality: 10,
    intelligence: 10,
  },
  availablePoints: 0,
  gold: 0,
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [inventory, _setInventory] = useState<(Item | null)[]>(Array(20).fill(null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error('Failed to fetch game data:', err);
      setError(err.response?.data?.message || 'Failed to load game data');
      // Use fallback data if API fails
      setPlayer(INITIAL_PLAYER);
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

  const allocateStatPoint = async (stat: keyof Player['stats']) => {
    try {
      const updatedPlayer = await gameService.allocateStat(stat);
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
