// apps/web/src/components/ui/LevelUpModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, level, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ef4444', '#eab308'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateX: 45 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotateX: -45 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative w-full max-w-sm bg-neutral-900 border-2 border-primary-500 rounded-2xl shadow-glow-blue overflow-hidden text-center p-8"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-50" />

        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-primary-500 mb-4"
        >
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-wider">Level Up!</h2>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-primary-500 mb-6 drop-shadow-lg">
          {level}
        </div>

        <p className="text-neutral-300 mb-8">
          Your capabilities have increased.<br/>
          <span className="text-primary-400 text-sm">All stats restored.</span>
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg shadow-lg transition-transform active:scale-95"
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
};
