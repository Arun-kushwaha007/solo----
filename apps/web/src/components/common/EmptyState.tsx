import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-800 rounded-2xl bg-black/20"
    >
      <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-6 text-gray-500">
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-8">{description}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-system-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
};
