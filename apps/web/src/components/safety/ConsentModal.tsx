import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onAccept }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-blue-500/30 rounded-lg p-6 max-w-md w-full shadow-2xl shadow-blue-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">System Initialization</h2>
            <div className="text-slate-300 space-y-4 mb-6 text-sm">
              <p>
                Welcome to Solo Leveling - Life RPG. To proceed, you must accept our terms regarding data usage and privacy.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>We collect health and activity data to gamify your life.</li>
                <li>Your data is stored securely and never sold to third parties.</li>
                <li>We may prompt you for mood checks to ensure your well-being.</li>
              </ul>
            </div>
            <button
              onClick={onAccept}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded transition-colors uppercase tracking-widest"
            >
              I Accept
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConsentModal;
