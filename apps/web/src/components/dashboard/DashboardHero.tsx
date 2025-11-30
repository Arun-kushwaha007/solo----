// apps/web/src/components/dashboard/DashboardHero.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface DashboardHeroProps {
  onStartBaseline: () => void;
  abVariant?: 'control' | 'hero_v2';
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ onStartBaseline, abVariant = 'control' }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-8 md:p-12 mb-12">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-medium text-primary-400 bg-primary-500/10 border border-primary-500/20 rounded-full">
            SYSTEM NOTIFICATION
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Welcome, Hunter.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
              Your awakening awaits.
            </span>
          </h1>
          <p className="text-lg text-neutral-400 mb-8 leading-relaxed max-w-lg">
            Complete the baseline assessment to determine your starting rank and abilities. Failure to complete the daily quest will result in a penalty.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={onStartBaseline}
            className={`
              group relative px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl
              shadow-glow-blue transition-all duration-300 transform hover:-translate-y-1
              flex items-center justify-center gap-2
              ${abVariant === 'hero_v2' ? 'w-full sm:w-auto text-lg' : ''}
            `}
          >
            <span>Initialize System</span>
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {abVariant === 'hero_v2' && (
             <button
                className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl border border-neutral-700 transition-colors"
                onClick={() => console.log('Read guide')}
             >
               Hunter's Guide
             </button>
          )}
        </motion.div>
      </div>

      {/* Decorative UI elements for "System" feel */}
      <div className="absolute right-8 top-8 hidden md:block">
          <div className="w-64 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-neutral-500 font-mono">STATUS</span>
                  <span className="text-xs text-green-500 font-mono flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      ONLINE
                  </span>
              </div>
              <div className="space-y-2">
                  <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 w-[0%] animate-[loading_2s_ease-in-out_infinite]"></div>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400 font-mono">
                      <span>SYNC</span>
                      <span>PENDING...</span>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
