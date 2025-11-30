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

export const Dashboard: React.FC = () => {
  const { player } = useGame();
  const [showWizard, setShowWizard] = useState(false);
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
    loadAnalytics();
    setTimeBasedGreeting();
  }, []);

  const setTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  };

  const loadAnalytics = async () => {
    try {
      const data = await gameService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
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
        </div>

import { StatRadar } from './ui/StatRadar';

// ... imports

export const Dashboard: React.FC = () => {
  // ...
  return (
    // ...
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
            
            <StatRadar data={radarData} entropy={recommendation.entropy} />
          </div>
    // ...
  );
};

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
