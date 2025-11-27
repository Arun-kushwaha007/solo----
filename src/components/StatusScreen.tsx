import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Plus, LogOut } from 'lucide-react';
import authService from '../services/auth.service';
import type { LifeCategory } from '../types';
import { CATEGORY_INFO, CATEGORY_STAT_NAMES } from '../types';

const StatRow = ({ 
  label, 
  value, 
  onIncrease, 
  canIncrease 
}: { 
  label: string; 
  value: number; 
  onIncrease?: () => void; 
  canIncrease?: boolean 
}) => (
  <div className="flex items-center justify-between py-2 border-b border-white/10">
    <span className="text-gray-400 font-mono text-sm sm:text-base">{label}</span>
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-white font-bold font-mono text-sm sm:text-base">{value}</span>
      {canIncrease && onIncrease && (
        <button 
          onClick={onIncrease}
          className="p-1 bg-system-blue/20 hover:bg-system-blue text-system-blue hover:text-white rounded transition-colors"
        >
          <Plus size={16} />
        </button>
      )}
    </div>
  </div>
);

export const StatusScreen: React.FC = () => {
  const { player, selectedCategory, setSelectedCategory, allocateStatPoint } = useGame();

  if (!player) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 font-mono text-sm">Loading player data...</div>
      </div>
    );
  }

  const categoryProgress = player.categories[selectedCategory];
  const statNames = CATEGORY_STAT_NAMES[selectedCategory];
  const canAllocate = categoryProgress.availablePoints > 0;

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-y-auto">
      {/* Header Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-widest truncate">{player.name}</h2>
          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-gray-500">JOB: </span>
              <span className="text-system-blue font-mono">{player.job}</span>
            </div>
            <div>
              <span className="text-gray-500">TITLE: </span>
              <span className="text-system-blue font-mono">{player.title}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-xs sm:text-sm">OVERALL LEVEL: </span>
            <span className="text-white font-bold text-xl sm:text-2xl">{player.overallLevel}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-400">HP</span>
            <span className="text-system-red font-mono">{player.hp}/{player.maxHp}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-system-red shadow-glow-red transition-all"
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-400">MP</span>
            <span className="text-system-blue font-mono">{player.mp}/{player.maxMp}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-system-blue shadow-glow-blue transition-all"
              style={{ width: `${(player.mp / player.maxMp) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-gray-400">GOLD</span>
            <span className="text-yellow-500 font-mono">{player.gold.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-xs sm:text-sm text-gray-400 mb-3 font-mono">LIFE CATEGORIES</h3>
        <div className="flex flex-wrap gap-2">
          {player.selectedCategories.map((cat) => {
            const info = CATEGORY_INFO[cat];
            const isSelected = cat === selectedCategory;
            
            return (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'border-system-blue bg-system-blue/20 text-white'
                    : 'border-gray-700 bg-black/40 text-gray-400 hover:border-system-blue/50'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 15px ${info.color}40` : 'none'
                }}
              >
                <span className="text-base sm:text-xl">{info.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-bold">{info.name}</div>
                  <div className="text-xs text-gray-500">Lv.{player.categories[cat].level}</div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Category Stats */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl sm:text-2xl">{CATEGORY_INFO[selectedCategory].icon}</span>
            <span className="truncate">{CATEGORY_INFO[selectedCategory].name} STATS</span>
          </h3>
          <div className="text-xs sm:text-sm">
            <span className="text-gray-500">Level: </span>
            <span className="text-system-blue font-bold">{categoryProgress.level}</span>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">XP</span>
            <span className="text-gray-400">{categoryProgress.xp}/{categoryProgress.xpToNextLevel}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-system-blue to-purple-500 shadow-glow-blue transition-all"
              style={{ width: `${(categoryProgress.xp / categoryProgress.xpToNextLevel) * 100}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <StatRow 
            label={statNames.primary.toUpperCase()} 
            value={categoryProgress.stats.primary} 
            canIncrease={canAllocate}
            onIncrease={() => allocateStatPoint(selectedCategory, 'primary')}
          />
          <StatRow 
            label={statNames.secondary.toUpperCase()} 
            value={categoryProgress.stats.secondary} 
            canIncrease={canAllocate}
            onIncrease={() => allocateStatPoint(selectedCategory, 'secondary')}
          />
          <StatRow 
            label={statNames.tertiary.toUpperCase()} 
            value={categoryProgress.stats.tertiary} 
            canIncrease={canAllocate}
            onIncrease={() => allocateStatPoint(selectedCategory, 'tertiary')}
          />
        </div>
      </div>

      {/* Available Points */}
      <div className="mt-auto pt-4 border-t border-system-blue/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <span className="text-gray-400 text-xs sm:text-sm">AVAILABLE POINTS ({CATEGORY_INFO[selectedCategory].name})</span>
        <span className="text-system-blue font-bold text-xl sm:text-2xl animate-pulse">{categoryProgress.availablePoints}</span>
      </div>

      {/* Logout Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          authService.logout();
          window.location.href = '/login';
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-system-red/20 border border-system-red/50 rounded text-system-red hover:bg-system-red hover:text-white transition-all duration-300"
      >
        <LogOut size={18} />
        <span className="font-bold tracking-wider text-xs sm:text-sm">LOGOUT</span>
      </motion.button>
    </div>
  );
};
