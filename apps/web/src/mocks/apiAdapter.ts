// apps/web/src/mocks/apiAdapter.ts

// Types reflecting the likely data structures (inferred from requirements)
export interface UserProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: {
    strength: number;
    endurance: number;
    focus: number;
    resilience: number;
    social: number;
  };
  rank: string;
  title: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  status: 'available' | 'active' | 'completed';
  rewards: {
    xp: number;
    gold: number;
    items?: string[];
  };
  requirements?: {
    level?: number;
    stats?: Partial<UserProfile['stats']>;
  };
  expiresAt?: string; // ISO date
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  quantity: number;
  equipped?: boolean;
}

// Initial Mock Data
const MOCK_PROFILE: UserProfile = {
  id: 'user-001',
  username: 'ShadowMonarch',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  stats: {
    strength: 5,
    endurance: 5,
    focus: 5,
    resilience: 5,
    social: 5,
  },
  rank: 'E-Rank Hunter',
  title: 'None',
};

const MOCK_QUESTS: Quest[] = [
  {
    id: 'quest-000',
    title: 'Daily Training: Strength',
    description: 'Do 100 push-ups.',
    difficulty: 'E',
    status: 'available',
    rewards: {
      xp: 20,
      gold: 10,
    },
  },
  {
    id: 'quest-starter',
    title: 'First Steps',
    description: 'Complete the baseline assessment to determine your starting stats.',
    difficulty: 'E',
    status: 'available',
    rewards: {
      xp: 50,
      gold: 100,
      items: ['starter-box'],
    },
  },
];

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'item-001',
    name: 'Health Potion',
    type: 'consumable',
    rarity: 'common',
    description: 'Restores 50 HP.',
    quantity: 3,
  },
];

// Feature Flag
const USE_MOCK = true; // Set to true by default for this task, or check window.__USE_MOCK_API__

// State (in-memory for the session)
let currentProfile = { ...MOCK_PROFILE };
let currentQuests = [...MOCK_QUESTS];
let currentInventory = [...MOCK_INVENTORY];

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiAdapter = {
  getProfile: async (): Promise<UserProfile> => {
    if (USE_MOCK) {
      await delay(300);
      return currentProfile;
    }
    // Fallback to real API would go here
    const res = await fetch('/api/profile');
    return res.json();
  },

  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
     if (USE_MOCK) {
      await delay(500);
      currentProfile = { ...currentProfile, ...updates };
      // Check for level up
      if (currentProfile.xp >= currentProfile.xpToNextLevel) {
          currentProfile.level += 1;
          currentProfile.xp -= currentProfile.xpToNextLevel;
          currentProfile.xpToNextLevel = Math.floor(currentProfile.xpToNextLevel * 1.5);
      }
      return currentProfile;
    }
    const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    return res.json();
  },

  getQuests: async (): Promise<Quest[]> => {
    if (USE_MOCK) {
      await delay(300);
      return currentQuests;
    }
    const res = await fetch('/api/quests');
    return res.json();
  },

  acceptQuest: async (questId: string): Promise<Quest> => {
      if (USE_MOCK) {
          await delay(200);
          const questIndex = currentQuests.findIndex(q => q.id === questId);
          if (questIndex > -1) {
              currentQuests[questIndex] = { ...currentQuests[questIndex], status: 'active' };
              return currentQuests[questIndex];
          }
          throw new Error('Quest not found');
      }
      const res = await fetch(`/api/quests/${questId}/accept`, { method: 'POST' });
      return res.json();
  },

  completeQuest: async (questId: string): Promise<{ quest: Quest; rewards: any }> => {
      if (USE_MOCK) {
          await delay(500);
          const questIndex = currentQuests.findIndex(q => q.id === questId);
           if (questIndex > -1) {
              const quest = currentQuests[questIndex];
              currentQuests[questIndex] = { ...quest, status: 'completed' };

              // Apply rewards
              currentProfile.xp += quest.rewards.xp;
              // (Level up logic is repeated here simplistically, ideally shared)
               if (currentProfile.xp >= currentProfile.xpToNextLevel) {
                    currentProfile.level += 1;
                    currentProfile.xp -= currentProfile.xpToNextLevel;
                    currentProfile.xpToNextLevel = Math.floor(currentProfile.xpToNextLevel * 1.5);
                }

              return { quest: currentQuests[questIndex], rewards: quest.rewards };
          }
          throw new Error('Quest not found');
      }
       const res = await fetch(`/api/quests/${questId}/complete`, { method: 'POST' });
      return res.json();
  },

  getInventory: async (): Promise<InventoryItem[]> => {
    if (USE_MOCK) {
      await delay(300);
      return currentInventory;
    }
    const res = await fetch('/api/inventory');
    return res.json();
  },

  // Telemetry Mock
  logEvent: (eventName: string, data?: any) => {
    console.log(`[Telemetry] ${eventName}`, data);
    // In a real scenario, this would POST to an analytics endpoint
    if (typeof window !== 'undefined') {
        const events = (window as any).__MOCK_EVENTS__ || [];
        events.push({ eventName, data, timestamp: new Date().toISOString() });
        (window as any).__MOCK_EVENTS__ = events;
    }
  }
};

// Expose for debugging
if (typeof window !== 'undefined') {
    (window as any).__apiAdapter = apiAdapter;
    (window as any).__USE_MOCK_API__ = true;
}
