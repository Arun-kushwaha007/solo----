import api from './api';

export interface BaselineDataPoint {
  category: 'strength' | 'agility' | 'intelligence' | 'vitality' | 'perception';
  dataType: string;
  value: number;
  unit?: string;
  timestamp?: Date;
  source?: string;
  metadata?: any;
}

export interface CalibrationTestResults {
  distance?: number;
  duration?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  reactionTime?: number;
  accuracy?: number;
  correctAnswers?: number;
  totalQuestions?: number;
  repetitions?: number;
  holdDuration?: number;
  formScore?: number;
  reachDistance?: number;
  perceivedExertion?: number;
  notes?: string;
}

export interface BaselineProgress {
  active: boolean;
  baselineId?: string;
  status?: string;
  daysElapsed?: number;
  daysRemaining?: number;
  targetDuration?: number;
  dataPointCount?: number;
  readinessScore?: number;
  readinessCriteria?: {
    minimumDays: boolean;
    minimumDataPoints: boolean;
    allCategoriesCovered: boolean;
    noLargeGaps: boolean;
  };
  isReady?: boolean;
  categoryProgress?: {
    [category: string]: {
      count: number;
      target: number;
      percentage: number;
    };
  };
}

export interface BaselineMetrics {
  baseline: {
    id: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    dataPointCount: number;
    metrics: any;
    confidenceIntervals: any;
    noiseFloor: any;
  };
  tests: any[];
}

class BaselineService {
  async startBaseline(duration: number = 7): Promise<{ success: boolean; data: any; message: string }> {
    const response = await api.post('/baseline/start', { duration });
    return response.data;
  }

  async stopBaseline(): Promise<{ success: boolean; data: any; message: string }> {
    const response = await api.post('/baseline/stop');
    return response.data;
  }

  async ingestData(dataPoints: BaselineDataPoint[]): Promise<{ success: boolean; data: any[]; count: number }> {
    const response = await api.post('/baseline/data', { dataPoints });
    return response.data;
  }

  async submitTest(
    testType: string,
    results: CalibrationTestResults,
    metadata?: any
  ): Promise<{ success: boolean; data: any; message: string }> {
    const response = await api.post(`/baseline/test/${testType}`, { results, metadata });
    return response.data;
  }

  async getMetrics(): Promise<{ success: boolean; data: BaselineMetrics }> {
    const response = await api.get('/baseline/metrics');
    return response.data;
  }

  async getProgress(): Promise<{ success: boolean; data: BaselineProgress }> {
    const response = await api.get('/baseline/progress');
    return response.data;
  }
}

export default new BaselineService();
