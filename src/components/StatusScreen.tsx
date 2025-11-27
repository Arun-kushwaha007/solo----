import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Plus, LogOut } from 'lucide-react';
import authService from '../services/auth.service';

const StatRow = ({ label, value, onIncrease, canIncrease }: { label: string; value: number; onIncrease?: () => void; canIncrease?: boolean }) => (
  <div className="flex items-center justify-between py-1 border-b border-white/10">
    <span className="text-gray-400 font-mono">{label}</span>
    <div className="flex items-center gap-3">
      <span className="text-white font-bold font-mono">{value}</span>
      {canIncrease && onIncrease && (
        <button 
          onClick={onIncrease}
          className="p-0.5 bg-system-blue/20 hover:bg-system-blue text-system-blue hover:text-white rounded transition-colors"
          data-testid={`increase-${label.toLowerCase()}`}
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  </div>
);

export const StatusScreen: React.FC = () => {
  const { player, allocateStatPoint } = useGame();

  if (!player) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 font-mono">Loading player data...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white tracking-widest">{player.name}</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">LEVEL</span>
            <span className="text-system-blue text-xl font-bold">{player.level}</span>
          </div>
        </div>
        <div className="space-y-1 text-sm text-right md:text-left">
          <div className="flex justify-between md:justify-start md:gap-4">
            <span className="text-gray-500">JOB</span>
            <span className="text-white">{player.job}</span>
          </div>
          <div className="flex justify-between md:justify-start md:gap-4">
            <span className="text-gray-500">TITLE</span>
            <span className="text-white">{player.title}</span>
          </div>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>HP</span>
            <span>{player.hp}/{player.maxHp}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              className="h-full bg-system-red shadow-glow-red"
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>MP</span>
            <span>{player.mp}/{player.maxMp}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(player.mp / player.maxMp) * 100}%` }}
              className="h-full bg-system-blue shadow-glow-blue"
            />
          </div>
        </div>
         <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>XP</span>
            <span>{Math.floor((player.xp / player.xpToNextLevel) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(player.xp / player.xpToNextLevel) * 100}%` }}
              className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-system-blue/30 my-2" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        <StatRow 
          label="STRENGTH" 
          value={player.stats.strength} 
          canIncrease={player.availablePoints > 0}
          onIncrease={() => allocateStatPoint('strength')}
        />
        <StatRow 
          label="VITALITY" 
          value={player.stats.vitality} 
          canIncrease={player.availablePoints > 0}
          onIncrease={() => allocateStatPoint('vitality')}
        />
        <StatRow 
          label="AGILITY" 
          value={player.stats.agility} 
          canIncrease={player.availablePoints > 0}
          onIncrease={() => allocateStatPoint('agility')}
        />
        <StatRow 
          label="INTELLIGENCE" 
          value={player.stats.intelligence} 
          canIncrease={player.availablePoints > 0}
          onIncrease={() => allocateStatPoint('intelligence')}
        />
        <StatRow 
          label="SENSE" 
          value={player.stats.sense} 
          canIncrease={player.availablePoints > 0}
          onIncrease={() => allocateStatPoint('sense')}
        />
      </div>

      {/* Available Points */}
      <div className="mt-auto pt-4 border-t border-system-blue/30 flex justify-between items-center">
        <span className="text-gray-400 text-sm">AVAILABLE POINTS</span>
        <span className="text-system-blue font-bold text-xl animate-pulse">{player.availablePoints}</span>
      </div>

      {/* Logout Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          authService.logout();
          window.location.href = '/login';
        }}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-system-red/20 border border-system-red/50 rounded text-system-red hover:bg-system-red hover:text-white transition-all duration-300"
      >
        <LogOut size={18} />
        <span className="font-bold tracking-wider text-sm">LOGOUT</span>
      </motion.button>
    </div>
  );
};
