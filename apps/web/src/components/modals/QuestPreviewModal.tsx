import React from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Coins, Trophy } from 'lucide-react';

interface QuestPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBaseline: () => void;
}

export const QuestPreviewModal: React.FC<QuestPreviewModalProps> = ({
  isOpen,
  onClose,
  onStartBaseline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-system-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Quest Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sample Quest Info */}
          <div className="bg-system-blue/10 border border-system-blue/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-2">
              Your First Daily Quest
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Complete a simple physical or mental challenge to earn your first rewards.
            </p>

            {/* Rewards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 rounded-lg p-3 flex items-center gap-2">
                <Zap size={20} className="text-yellow-400" />
                <div>
                  <div className="text-xs text-gray-500">XP Reward</div>
                  <div className="text-lg font-bold text-white">50 XP</div>
                </div>
              </div>
              <div className="bg-black/40 rounded-lg p-3 flex items-center gap-2">
                <Coins size={20} className="text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500">Gold Reward</div>
                  <div className="text-lg font-bold text-white">10 G</div>
                </div>
              </div>
            </div>
          </div>

          {/* Unlock Message */}
          <div className="flex items-start gap-3 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <Trophy size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-purple-300 font-medium mb-1">
                Unlock Your First Quest
              </p>
              <p className="text-xs text-gray-400">
                Complete the 90-second baseline assessment to unlock personalized quests tailored to your goals.
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onStartBaseline}
            className="w-full py-3 bg-system-blue text-black font-bold rounded-lg shadow-glow-blue hover:bg-white transition-colors"
          >
            Start Baseline Assessment
          </button>
        </div>
      </motion.div>
    </div>
  );
};
