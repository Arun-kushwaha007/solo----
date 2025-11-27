export interface PlayerStats {
  strength: number;
  agility: number;
  sense: number;
  vitality: number;
  intelligence: number;
}

export interface Player {
  name: string;
  job: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  fatigue: number;
  stats: PlayerStats;
  availablePoints: number;
  gold: number;
}

export interface QuestTask {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tasks: QuestTask[];
  completed: boolean;
  rewards: {
    xp: number;
    gold: number;
    items?: number[]; // Item IDs
  };
}

export interface Item {
  id: number;
  name: string;
  type: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  iconName: string; // We'll map this to Lucide icons
}
