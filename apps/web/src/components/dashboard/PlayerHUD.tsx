import React from 'react';
import { motion } from 'framer-motion';

interface PlayerHUDProps {
  name: string;
  rank: string;
  level: number;
  xp: number;
  title: string;
}

const PlayerHUD: React.FC<PlayerHUDProps> = ({ name, rank, level, xp, title }) => {
  // Simple XP calculation for progress bar (assuming constant 0.1 curve from backend)
  // XP required for next level = (Level / 0.1)^2
  // XP required for current level = ((Level-1) / 0.1)^2
  // Progress = (CurrentXP - PrevLevelXP) / (NextLevelXP - PrevLevelXP)
  
  const CONSTANT = 0.1;
  const nextLevelXp = Math.pow(level / CONSTANT, 2);
  const prevLevelXp = Math.pow((level - 1) / CONSTANT, 2);
  const levelXpRange = nextLevelXp - prevLevelXp;
  const currentLevelProgress = xp - prevLevelXp;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / levelXpRange) * 100));

  return (
    <div className="bg-slate-900 border-b border-blue-500/30 p-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/50 border-2 border-white">
            {level}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-blue-400 font-bold">{rank}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">{title}</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="flex justify-between text-xs text-blue-300 mb-1 font-mono">
            <span>XP</span>
            <span>{Math.floor(currentLevelProgress)} / {Math.floor(levelXpRange)}</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerHUD;
