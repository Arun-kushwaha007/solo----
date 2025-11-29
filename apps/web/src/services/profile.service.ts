import api from './api';

export interface ProfileData {
  user: string;
  stats: {
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
    perception: number;
  };
  level: number;
  xp: number;
  rank: string;
  title: string;
  demographics?: {
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
  };
  healthConstraints?: {
    injuries?: string[];
    medicalConditions?: string[];
    limitations?: string[];
    dietaryRestrictions?: string[];
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  persona?: string;
  goals?: Goal[];
  timezone?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      questReminders?: boolean;
    };
    theme?: 'dark' | 'light' | 'system';
    language?: string;
    questDifficulty?: 'easy' | 'normal' | 'hard' | 'extreme';
  };
}

export interface Goal {
  _id?: string;
  title: string;
  description?: string;
  category?: string;
  targetDate?: Date;
  completed?: boolean;
  createdAt?: Date;
}

export interface UpdateProfileData {
  demographics?: ProfileData['demographics'];
  persona?: string;
  timezone?: string;
  preferences?: ProfileData['preferences'];
  stats?: ProfileData['stats'];
}

export interface UpdateHealthConstraintsData {
  injuries?: string[];
  medicalConditions?: string[];
  limitations?: string[];
  dietaryRestrictions?: string[];
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

class ProfileService {
  async getProfile(): Promise<{ success: boolean; data: ProfileData }> {
    const response = await api.get('/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; data: ProfileData }> {
    const response = await api.put('/profile', data);
    return response.data;
  }

  async updateHealthConstraints(data: UpdateHealthConstraintsData): Promise<{ success: boolean; data: ProfileData }> {
    const response = await api.put('/profile/health', data);
    return response.data;
  }

  async updatePersona(persona: string, goals?: Goal[]): Promise<{ success: boolean; data: ProfileData }> {
    const response = await api.put('/profile/persona', { persona, goals });
    return response.data;
  }

  async addGoal(goal: Omit<Goal, '_id' | 'createdAt'>): Promise<{ success: boolean; data: Goal }> {
    const response = await api.post('/profile/goals', goal);
    return response.data;
  }

  async updateGoal(goalId: string, goal: Partial<Goal>): Promise<{ success: boolean; data: Goal }> {
    const response = await api.put(`/profile/goals/${goalId}`, goal);
    return response.data;
  }

  async deleteGoal(goalId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/profile/goals/${goalId}`);
    return response.data;
  }
}

export default new ProfileService();
