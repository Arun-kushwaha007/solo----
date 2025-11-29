import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CATEGORY_INFO, CATEGORY_STAT_NAMES } from '../types';

export const StatusScreen: React.FC = () => {
  const { player, allocateStatPoint } = useGame();

  if (!player) return null;

  return (
    <div className="h-full flex flex-col gap-8 pb-20">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-gray-900 to-black border border-gray-800 p-8 md:p-12">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Shield size={300} />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          {/* Avatar Placeholder */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-linear-to-br from-system-blue to-purple-600 p-1 shadow-2xl shadow-system-blue/20">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl font-bold text-white">
              {player.name.charAt(0)}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-system-blue/20 text-system-blue text-xs font-bold tracking-wider border border-system-blue/30">
                {player.title || 'NOVICE HUNTER'}
              </span>
              <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs font-bold tracking-wider border border-gray-700">
                LEVEL {player.overallLevel}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-2">
              {player.name}
            </h1>
            <p className="text-gray-400 max-w-lg">
              {player.job || 'Freelance Hunter'} • Joined {new Date(player.createdAt).toLocaleDateString()}
            </p>

            {/* Vitals */}
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto md:mx-0">
              <div className="bg-black/40 border border-gray-800 p-3 rounded-xl text-center">
                <div className="text-xs text-gray-500 font-bold mb-1">HP</div>
                <div className="text-xl font-bold text-red-500">{player.hp}/{player.maxHp}</div>
              </div>
              <div className="bg-black/40 border border-gray-800 p-3 rounded-xl text-center">
                <div className="text-xs text-gray-500 font-bold mb-1">MP</div>
                <div className="text-xl font-bold text-blue-500">{player.mp}/{player.maxMp}</div>
              </div>
              <div className="bg-black/40 border border-gray-800 p-3 rounded-xl text-center">
                <div className="text-xs text-gray-500 font-bold mb-1">FATIGUE</div>
                <div className="text-xl font-bold text-yellow-500">{player.fatigue}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {player.selectedCategories.map(cat => {
          const info = CATEGORY_INFO[cat];
          const progress = player.categories[cat];
          const statNames = CATEGORY_STAT_NAMES[cat];

          return (
            <div key={cat} className="bg-black/40 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-xl">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{info.name}</h3>
                    <div className="text-xs text-gray-500 font-mono">LVL {progress.level}</div>
                  </div>
                </div>
                {progress.availablePoints > 0 && (
                  <div className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded border border-yellow-500/30 animate-pulse">
                    +{progress.availablePoints} PTS
                  </div>
                )}
              </div>

              {/* XP Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.floor((progress.xp / progress.xpToNextLevel) * 100)}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.xp / progress.xpToNextLevel) * 100}%` }}
                    className="h-full bg-system-blue"
                  />
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-3">
                {(['primary', 'secondary', 'tertiary'] as const).map(statType => (
                  <div key={statType} className="flex items-center justify-between group">
                    <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
                      {statNames[statType]}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-white">
                        {progress.stats[statType]}
                      </span>
                      {progress.availablePoints > 0 && (
                        <button
                          onClick={() => allocateStatPoint(cat, statType)}
                          className="w-6 h-6 rounded bg-gray-800 hover:bg-system-blue hover:text-black flex items-center justify-center text-gray-400 transition-colors"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
