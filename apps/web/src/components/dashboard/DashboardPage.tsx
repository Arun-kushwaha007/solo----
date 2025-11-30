import React, { useEffect, useState } from 'react';
import { getDashboardSummary } from '../../services/api';
import PlayerHUD from './PlayerHUD';
import StatRadar from './StatRadar';
import RecentQuests from './RecentQuests';
import DailyChecklist from './DailyChecklist';
import { Activity, Shield, Zap } from 'lucide-react';

interface DashboardData {
  stats: {
    strength: number;
    endurance: number;
    focus: number;
    resilience: number;
    social: number;
  };
  level: number;
  xp: number;
  rank: string;
  title: string;
  daysToNextLevel: number;
  adherence: number;
  recentQuests: any[]; // Ideally define Quest type properly
}

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(res => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard data', err);
        setError('Failed to load system data.');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-blue-500 font-mono animate-pulse">SYSTEM LOADING...</div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-red-500 font-mono border border-red-500 p-4 rounded bg-red-900/20">
        ERROR: {error || 'Failed to load data'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <PlayerHUD 
        name={data.rank === 'S-Rank' ? 'Shadow Monarch' : 'Player'} // Fallback name if not in response, or update backend to send name
        rank={data.rank}
        level={data.level}
        xp={data.xp}
        title={data.title}
      />

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column: Stats & Vitals */}
        <div className="lg:col-span-1 space-y-6">
          <StatRadar stats={data.stats} />
          
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <h3 className="text-slate-400 text-sm font-bold mb-4 uppercase tracking-wider">Vital Signs</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
                <div className="flex items-center gap-3 text-red-400">
                  <Activity size={20} />
                  <span className="font-bold">HP</span>
                </div>
                <span className="font-mono text-white">100%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
                <div className="flex items-center gap-3 text-blue-400">
                  <Zap size={20} />
                  <span className="font-bold">MP</span>
                </div>
                <span className="font-mono text-white">100%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
                <div className="flex items-center gap-3 text-yellow-400">
                  <Shield size={20} />
                  <span className="font-bold">Fatigue</span>
                </div>
                <span className="font-mono text-white">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Recent Activity & Checklist */}
        <div className="lg:col-span-1 space-y-6">
          <RecentQuests quests={data.recentQuests} />
          <DailyChecklist />
        </div>

        {/* Right Column: Next Rank ETA & Adherence */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-6 rounded-lg border border-blue-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Activity size={100} />
            </div>
            <h3 className="text-blue-400 text-sm font-bold mb-2 uppercase tracking-wider">Next Rank Estimation</h3>
            <div className="text-4xl font-bold text-white mb-1">{data.daysToNextLevel} Days</div>
            <div className="text-slate-400 text-sm">Estimated time to Level {data.level + 1}</div>
            
            <div className="mt-6 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-400 text-sm">Adherence Rate</span>
                <span className="text-2xl font-bold text-green-400">{data.adherence}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${data.adherence}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
