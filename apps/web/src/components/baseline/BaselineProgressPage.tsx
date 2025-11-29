import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Loader, TrendingUp, Calendar, Activity } from 'lucide-react';
import baselineService, { type BaselineProgress } from '../../services/baseline.service';


export const BaselineProgressPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<BaselineProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadProgress();
    const interval = setInterval(loadProgress, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadProgress = async () => {
    try {
      const { data } = await baselineService.getProgress();
      setProgress(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!progress?.isReady) return;
    
    setCompleting(true);
    try {
      await baselineService.stopBaseline();
      navigate('/game');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete baseline');
    } finally {
      setCompleting(false);
    }
  };

  const handleAddData = () => {
    // Navigate to manual data entry (to be implemented)
    navigate('/baseline/add-data');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader className="animate-spin text-system-blue" size={48} />
      </div>
    );
  }

  if (!progress?.active) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-system-blue mb-4">No Active Baseline</h1>
          <p className="text-gray-400 mb-6">You don't have an active baseline collection.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-system-blue text-black font-bold rounded hover:bg-white transition-colors"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  const categories = ['strength', 'agility', 'intelligence', 'vitality', 'perception'];
  const readinessScore = progress.readinessScore || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-system-blue/10 via-transparent to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-system-blue mb-2">BASELINE CALIBRATION</h1>
          <p className="text-gray-400 font-mono">Establishing your hunter profile...</p>
        </div>

        {error && (
          <div className="mb-6 bg-system-red/10 border border-system-red/50 rounded p-4 text-system-red">
            {error}
          </div>
        )}

        {/* Overall Progress */}
        <div className="bg-black/80 border-2 border-system-blue/50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-system-blue">Overall Progress</h2>
              <p className="text-gray-400 text-sm">
                Day {progress.daysElapsed} of {progress.targetDuration}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-system-blue">{readinessScore}%</div>
              <div className="text-sm text-gray-400">Ready</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${readinessScore}%` }}
              className="h-full bg-gradient-to-r from-system-blue to-blue-400"
            />
          </div>

          {/* Readiness Criteria */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {progress.readinessCriteria?.minimumDays ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <Circle className="text-gray-600" size={20} />
              )}
              <span className="text-sm">Minimum Days</span>
            </div>
            <div className="flex items-center gap-2">
              {progress.readinessCriteria?.minimumDataPoints ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <Circle className="text-gray-600" size={20} />
              )}
              <span className="text-sm">Data Points</span>
            </div>
            <div className="flex items-center gap-2">
              {progress.readinessCriteria?.allCategoriesCovered ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <Circle className="text-gray-600" size={20} />
              )}
              <span className="text-sm">All Categories</span>
            </div>
            <div className="flex items-center gap-2">
              {progress.readinessCriteria?.noLargeGaps ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <Circle className="text-gray-600" size={20} />
              )}
              <span className="text-sm">No Gaps</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-black/80 border border-system-blue/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-system-blue" size={24} />
              <div>
                <div className="text-2xl font-bold">{progress.daysRemaining}</div>
                <div className="text-sm text-gray-400">Days Remaining</div>
              </div>
            </div>
          </div>

          <div className="bg-black/80 border border-system-blue/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-system-blue" size={24} />
              <div>
                <div className="text-2xl font-bold">{progress.dataPointCount}</div>
                <div className="text-sm text-gray-400">Data Points</div>
              </div>
            </div>
          </div>

          <div className="bg-black/80 border border-system-blue/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-system-blue" size={24} />
              <div>
                <div className="text-2xl font-bold">{progress.status}</div>
                <div className="text-sm text-gray-400">Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Progress */}
        <div className="bg-black/80 border-2 border-system-blue/50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-system-blue mb-4">Category Progress</h2>
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryData = progress.categoryProgress?.[category];
              const count = categoryData?.count || 0;
              const target = categoryData?.target || 50;
              const percentage = categoryData?.percentage || 0;

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono uppercase text-gray-300">{category}</span>
                    <span className="text-sm text-gray-400">
                      {count} / {target}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full ${
                        percentage >= 100 ? 'bg-green-500' : 'bg-system-blue'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleAddData}
            className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded border border-gray-700 transition-colors"
          >
            Add Manual Data
          </button>
          
          <button
            onClick={handleComplete}
            disabled={!progress.isReady || completing}
            className={`flex-1 px-6 py-3 font-bold rounded transition-colors ${
              progress.isReady
                ? 'bg-system-blue hover:bg-white text-black'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            {completing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={18} />
                Processing...
              </span>
            ) : (
              'Complete Baseline'
            )}
          </button>
        </div>

        {!progress.isReady && (
          <p className="text-center text-gray-500 text-sm mt-4">
            Complete all readiness criteria to finish baseline calibration
          </p>
        )}
      </div>
    </div>
  );
};
