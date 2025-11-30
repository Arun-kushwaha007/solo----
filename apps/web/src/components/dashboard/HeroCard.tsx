import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock, Shield } from 'lucide-react';

interface HeroCardProps {
  onStart: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-linear-to-br from-system-blue/20 to-system-black border border-system-blue/30 p-6 md:p-8 mb-6"
    >
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-system-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-system-blue font-mono text-xs tracking-widest uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-system-blue opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-system-blue"></span>
            </span>
            System Alert
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Player Evaluation Required
          </h2>
          
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            The System needs to calibrate your baseline stats to generate appropriate quests. 
            Complete the rapid assessment to unlock your first rank.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={14} className="text-system-blue" />
              <span>5 Minutes</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Shield size={14} className="text-system-blue" />
              <span>Adaptive Difficulty</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={onStart}
            className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-system-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          >
            <Zap size={18} className="fill-current" />
            <span>Start Baseline</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-6 py-3 bg-transparent border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-medium rounded-lg transition-colors text-sm">
            Learn More
          </button>
        </div>
      </div>
    </motion.div>
  );
};
