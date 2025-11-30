// apps/web/src/components/common/EmptyState.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
  variant?: 'quest' | 'inventory' | 'shop' | 'default';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  variant = 'default',
}) => {
  const getGradient = () => {
    switch (variant) {
      case 'quest': return 'from-primary-500/20 to-blue-500/5';
      case 'inventory': return 'from-purple-500/20 to-indigo-500/5';
      case 'shop': return 'from-yellow-500/20 to-orange-500/5';
      default: return 'from-neutral-500/20 to-neutral-500/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 md:p-12
        flex flex-col items-center justify-center text-center
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-30`} />
      
      <div className="relative z-10">
        <div className="mb-6 inline-flex p-4 rounded-full bg-neutral-800/80 border border-neutral-700 shadow-xl">
          {icon || (
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          )}
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-neutral-400 mb-8 max-w-sm mx-auto">{description}</p>

        <button
          onClick={onAction}
          className="px-6 py-3 bg-neutral-100 hover:bg-white text-black font-bold rounded-lg shadow-glow-blue transition-all transform hover:-translate-y-0.5"
        >
          {actionLabel}
        </button>
      </div>
    </motion.div>
  );
};
