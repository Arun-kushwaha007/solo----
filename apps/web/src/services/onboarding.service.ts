import api from './api';

export interface OnboardingStepData {
  welcome?: {
    completed: boolean;
  };
  persona?: {
    displayName: string;
    persona: string;
    timezone: string;
  };
  goals?: {
    goals: Array<{
      title: string;
      description?: string;
      category?: string;
      targetDate?: Date;
      priority?: number;
    }>;
  };
  constraints?: {
    healthConstraints: {
      injuries?: string[];
      medicalConditions?: string[];
      limitations?: string[];
      dietaryRestrictions?: string[];
      fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    };
    timeAvailability: {
      hoursPerWeek: number;
      preferredTimes: string[];
    };
    equipment: {
      gym: boolean;
      homeEquipment: string[];
      outdoorAccess: boolean;
    };
  };
  wearables?: {
    permissions: {
      manual: boolean;
      fitbit: boolean;
      appleHealth: boolean;
      googleFit: boolean;
    };
  };
  baselineIntro?: {
    agreedToBaseline: boolean;
    baselineDuration: number;
  };
}

export interface OnboardingProgress {
  userId: string;
  currentStep: number;
  completedSteps: number[];
  stepData: OnboardingStepData;
  startedAt: Date;
  completedAt?: Date;
  lastUpdated: Date;
}

class OnboardingService {
  async startOnboarding(): Promise<{ success: boolean; data: OnboardingProgress }> {
    const response = await api.post('/onboarding/start');
    return response.data;
  }

  async saveStepProgress(stepId: number, data: any): Promise<{ success: boolean; data: OnboardingProgress }> {
    const response = await api.put(`/onboarding/step/${stepId}`, data);
    return response.data;
  }

  async completeOnboarding(): Promise<{ success: boolean; data: any; message: string }> {
    const response = await api.post('/onboarding/complete');
    return response.data;
  }

  async getProgress(): Promise<{ success: boolean; data: OnboardingProgress | null }> {
    const response = await api.get('/onboarding/progress');
    return response.data;
  }

  async resumeOnboarding(): Promise<{ success: boolean; data: OnboardingProgress }> {
    const response = await api.post('/onboarding/resume');
    return response.data;
  }
}

export default new OnboardingService();
