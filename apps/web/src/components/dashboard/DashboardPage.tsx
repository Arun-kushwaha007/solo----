import React, { useEffect, useState } from 'react';
import { getProfile } from '../../services/profile';
import PlayerHUD from './PlayerHUD';
import StatRadar from './StatRadar';
import QuestList from '../quests/QuestList';
import SkillTree from '../leveling/SkillTree';
import { Activity, Shield, Zap } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(res => {
      setProfile(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white text-center mt-20">System Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <PlayerHUD 
        name={profile.user.name}
        rank={profile.rank}
        level={profile.level}
        xp={profile.xp}
        title={profile.title}
      />

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Left Column: Stats */}
        <div className="lg:col-span-1 space-y-6">
          <StatRadar stats={profile.stats} />
          
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

        {/* Middle Column: Quests */}
        <div className="lg:col-span-1">
          <QuestList />
        </div>

        {/* Right Column: Skills */}
        <div className="lg:col-span-1">
          <SkillTree />
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
