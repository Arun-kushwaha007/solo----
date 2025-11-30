import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, Tooltip, Cell, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Sun, Moon, Zap, CheckCircle2, TrendingUp, 
  Award, Brain, AlertTriangle
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import gameService from '../services/game.service';
import { CATEGORY_INFO } from '../types';
import { TheArchitect } from './TheArchitect';
import { HeroCard } from './dashboard/HeroCard';
import { OnboardingWizard } from './onboarding/OnboardingWizard';
import { StatRadar } from './ui/StatRadar';

import type { Quest } from '../types';
import { QuestCard } from './ui/QuestCard';
import { Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { player } = useGame();
  const [showWizard, setShowWizard] = useState(false);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [baselineProgress, setBaselineProgress] = useState<any>(null);
  const [analytics, setAnalytics] = useState<{
    radarData: any[];
    activityData: any[];
    recommendation: {
      category: string;
      level: number;
      message: string;
      mood: 'NEUTRAL' | 'WARNING' | 'DANGER' | 'PRAISE';
      entropy: Record<string, { isDecaying: boolean }>;
    };
    recentWins: any[];
    stats: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    loadData();
    setTimeBasedGreeting();
  }, []);

  const setTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

  const loadData = async () => {
    try {
      const [analyticsData, questsData, baselineData] = await Promise.all([
        gameService.getAnalytics(),
        gameService.getQuests(),
        gameService.getBaselineProgress()
      ]);
      setAnalytics(analyticsData);
      setQuests(questsData);
      setBaselineProgress(baselineData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = async (questId: number, taskId: string, taskLabel: string, current: number, target: number) => {
    try {
      // Optimistic update
      setQuests(prev => prev.map(q => {
        if (q.id === questId) {
          return {
            ...q,
            tasks: q.tasks.map(t => t.id === taskId ? { ...t, current: Math.min(t.current + 1, t.target) } : t)
          };
        }
        return q;
      }));

      await gameService.updateTask(questId, taskId, 1);
    } catch (error) {
      console.error('Failed to update task:', error);
      loadData();
    }
  };

  const handleQuestComplete = async (questId: number, questTitle: string, xpReward: number, goldReward: number) => {
    try {
      await gameService.completeQuest(questId);
      
      // Update local state
      setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: true } : q));
      
      // Refresh analytics to show new XP/wins
      const analyticsData = await gameService.getAnalytics();
      setAnalytics(analyticsData);

      console.log(`Quest Completed: ${questTitle} (+${xpReward} XP)`);
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-system-blue border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-500 font-mono text-sm tracking-widest">SYNCING SYSTEM...</div>
        </div>
      </div>
    );
  }

  const { radarData, activityData, recommendation, recentWins, stats } = analytics;

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
      {/* Header / Greeting */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">
            {new Date().getHours() < 18 ? <Sun size={14} /> : <Moon size={14} />}
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {greeting}, <span className="text-system-blue">{player?.name}</span>.
          </h1>
        </div>
      </div>

      {/* Hero Card (Onboarding) */}
      <HeroCard onStart={() => setShowWizard(true)} />
      <OnboardingWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />

      {/* The Architect (System AI) */}
      <TheArchitect message={recommendation.message} mood={recommendation.mood} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Momentum & Stats */}
        <div className="space-y-6">
          {/* Momentum Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 border border-gray-800 p-6 rounded-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Momentum
              </h3>
              <span className="text-2xl font-bold text-white">{stats.momentum}%</span>
            </div>
            
            {/* Velocity Bar */}
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.momentum}%` }}
                className={`h-full ${stats.momentum > 80 ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-system-blue'}`}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
              <span>Stagnant</span>
              <span>Unstoppable</span>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 border border-gray-800 p-4 rounded-xl">
              <div className="text-gray-500 text-xs font-medium mb-2">PRODUCTIVITY</div>
              <div className="text-2xl font-bold text-white flex items-end gap-2">
                {stats.productivityScore}
                <span className="text-xs text-green-500 mb-1 font-medium">/ 100</span>
              </div>
            </div>
            <div className="bg-black/40 border border-gray-800 p-4 rounded-xl">
              <div className="text-gray-500 text-xs font-medium mb-2">STREAK</div>
              <div className="text-2xl font-bold text-white flex items-end gap-2">
                {stats.streak}
                <span className="text-xs text-gray-500 mb-1 font-medium">DAYS</span>
              </div>
            </div>
          </div>

          {/* Baseline Progress (New) */}
          {baselineProgress?.active && (
            <div className="space-y-4">
              <div className="bg-system-blue/10 border border-system-blue/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-system-blue" />
                    Baseline Collection
                  </h3>
                  <span className="text-xs font-mono text-system-blue animate-pulse">ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black/40 p-2 rounded">
                    <div className="text-gray-500 text-xs">Days Remaining</div>
                    <div className="text-white font-bold">{baselineProgress.daysRemaining}</div>
                  </div>
                  <div className="bg-black/40 p-2 rounded">
                    <div className="text-gray-500 text-xs">Data Points</div>
                    <div className="text-white font-bold">{baselineProgress.dataPointCount}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  System is passively collecting data to calibrate your profile. Continue your daily activities.
                </div>
              </div>

              {/* Calibration Tests */}
              <div className="bg-black/40 border border-gray-800 p-4 rounded-xl space-y-3">
                <h3 className="font-bold text-white text-sm">Required Calibration Tests</h3>
                <div className="space-y-2">
                  {['pushups', 'plank', 'squats'].map(test => (
                    <div key={test} className="flex items-center justify-between bg-black/20 p-2 rounded border border-gray-800">
                      <span className="text-gray-300 capitalize">{test}</span>
                      <button 
                        onClick={() => {
                          const val = prompt(`Enter result for ${test}:`);
                          if (val) {
                            gameService.submitBaselineTest(test, Number(val))
                              .then(() => alert('Test submitted!'))
                              .catch(e => alert('Failed: ' + e.message));
                          }
                        }}
                        className="text-xs bg-system-blue px-2 py-1 rounded text-white hover:bg-blue-600"
                      >
                        Log Result
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active Quests Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-system-blue" />
              Active Quests
            </h3>
            <div className="space-y-4">
              {quests.filter(q => !q.completed).length === 0 ? (
                <div className="text-gray-500 text-sm italic text-center py-4 bg-black/20 rounded-lg">
                  No active quests. The system is waiting...
                </div>
              ) : (
                quests.filter(q => !q.completed).map(quest => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    onTaskClick={handleTaskClick}
                    onComplete={handleQuestComplete}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Life Balance Radar */}
        <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Brain size={18} className="text-purple-400" />
              Life Balance
            </h3>
            {/* Entropy Warning */}
            {(Object.values(recommendation.entropy || {}) as { isDecaying: boolean }[]).some((e) => e.isDecaying) && (
              <div className="flex items-center gap-1 text-red-500 text-xs font-bold animate-pulse">
                <AlertTriangle size={12} />
                ENTROPY DETECTED
              </div>
            )}
          </div>
          
          <StatRadar stats={stats} />
        </div>

        {/* Right Column: Activity & Wins */}
        <div className="space-y-6">
          {/* Activity Graph */}
          <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-400" />
              Consistency
            </h3>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Bar dataKey="xp" radius={[4, 4, 4, 4]}>
                    {activityData.map((entry: { xp: number }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.xp > 100 ? '#00A3FF' : '#333'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Wins Feed */}
          <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Award size={18} className="text-yellow-500" />
              Recent Wins
            </h3>
            <div className="space-y-4">
              {recentWins.map((win: { id: number; title: string; category: string; time: string }) => (
                <div key={win.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">{win.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${CATEGORY_INFO[win.category as keyof typeof CATEGORY_INFO]?.color || 'bg-gray-500'}`} />
                      {win.category.charAt(0).toUpperCase() + win.category.slice(1)} • {win.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
