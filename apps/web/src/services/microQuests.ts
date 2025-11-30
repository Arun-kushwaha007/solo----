// Mock service for creating micro-quests based on user requirements

interface MicroQuest {
  id: number;
  title: string;
  description: string;
  category: string;
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

/**
 * Creates a micro-quest to earn a specific amount of gold
 * @param amount - Amount of gold to earn
 * @returns Promise resolving to the created quest
 */
export const createEarnGoldQuest = async (amount: number): Promise<MicroQuest> => {
  // Mock implementation - in production, this would call the backend API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        title: `Earn ${amount} Gold`,
        description: 'Complete daily tasks to earn gold and unlock new items.',
        category: 'financial',
        difficulty: 'E-RANK',
        tasks: [
          {
            id: 'task-1',
            label: 'Complete 1 daily quest',
            current: 0,
            target: 1,
          },
        ],
        completed: false,
        rewards: {
          xp: Math.floor(amount / 2), // 50% of gold as XP
          gold: amount,
        },
      });
    }, 300);
  });
};

/**
 * Gets a suggested micro-quest based on user requirement
 * @param requirement - The requirement that needs to be fulfilled
 * @returns Promise resolving to a suggested quest
 */
export const getSuggestedMicroQuest = async (requirement: {
  type: 'gold' | 'level' | 'quest';
  amount: number;
}): Promise<MicroQuest> => {
  // Mock implementation
  if (requirement.type === 'gold') {
    return createEarnGoldQuest(requirement.amount);
  }

  // Default fallback
  return createEarnGoldQuest(100);
};

/**
 * Adds a micro-quest to the user's active quests
 * @param quest - The quest to add
 * @returns Promise resolving to success status
 */
export const addMicroQuestToActive = async (quest: MicroQuest): Promise<boolean> => {
  // Mock implementation - in production, this would update the backend
  console.log('[MicroQuests] Adding quest to active:', quest.title);
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 200);
  });
};
