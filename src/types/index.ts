// Life Categories
export type LifeCategory =
  | "physical"
  | "mental"
  | "professional"
  | "creative"
  | "social"
  | "financial"
  | "spiritual";

export const CATEGORY_INFO: Record<
  LifeCategory,
  { name: string; icon: string; color: string; description: string }
> = {
  physical: {
    name: "Physical",
    icon: "💪",
    color: "#ef4444", // red
    description: "Fitness, nutrition, sleep, and health",
  },
  mental: {
    name: "Mental",
    icon: "🧠",
    color: "#8b5cf6", // purple
    description: "Learning, skills, reading, and knowledge",
  },
  professional: {
    name: "Professional",
    icon: "💼",
    color: "#3b82f6", // blue
    description: "Career, projects, and networking",
  },
  creative: {
    name: "Creative",
    icon: "🎨",
    color: "#ec4899", // pink
    description: "Art, music, writing, and hobbies",
  },
  social: {
    name: "Social",
    icon: "🤝",
    color: "#10b981", // green
    description: "Relationships and community",
  },
  financial: {
    name: "Financial",
    icon: "💰",
    color: "#f59e0b", // amber
    description: "Savings, investments, and income",
  },
  spiritual: {
    name: "Spiritual",
    icon: "🧘",
    color: "#06b6d4", // cyan
    description: "Meditation, mindfulness, and inner peace",
  },
};

// Category-specific stats
export interface CategoryStats {
  primary: number;
  secondary: number;
  tertiary: number;
}

export interface CategoryProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: CategoryStats;
  availablePoints: number;
}

export interface Player {
  name: string;
  job: string;
  title: string;
  overallLevel: number;
  categories: Record<LifeCategory, CategoryProgress>;
  selectedCategories: LifeCategory[];
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  fatigue: number;
  gold: number;
  inventory: Item[];
  achievements: { id: string; unlockedAt: string }[];
  loginStreak: number;
  lastLoginDate: string;
  createdAt: string;
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
  category: LifeCategory;
  title: string;
  description: string;
  difficulty: string;
  tasks: QuestTask[];
  completed: boolean;
  rewards: {
    xp: number;
    gold: number;
    items?: number[];
  };
}

export interface Item {
  id: number;
  name: string;
  type: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  iconName: string;
}

// Stat names per category
export const CATEGORY_STAT_NAMES: Record<
  LifeCategory,
  { primary: string; secondary: string; tertiary: string }
> = {
  physical: {
    primary: "Strength",
    secondary: "Endurance",
    tertiary: "Flexibility",
  },
  mental: {
    primary: "Intelligence",
    secondary: "Focus",
    tertiary: "Creativity",
  },
  professional: {
    primary: "Productivity",
    secondary: "Expertise",
    tertiary: "Innovation",
  },
  creative: {
    primary: "Imagination",
    secondary: "Skill",
    tertiary: "Expression",
  },
  social: { primary: "Charisma", secondary: "Empathy", tertiary: "Leadership" },
  financial: {
    primary: "Wealth",
    secondary: "Investment",
    tertiary: "Strategy",
  },
  spiritual: { primary: "Mindfulness", secondary: "Peace", tertiary: "Wisdom" },
};
