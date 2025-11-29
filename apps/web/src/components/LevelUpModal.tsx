import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

interface LevelUpModalProps {
  show: boolean;
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ show, level, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000); // Auto close after 3s
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            className="bg-black/90 border-2 border-system-blue p-8 rounded-lg shadow-[0_0_50px_rgba(59,130,246,0.5)] text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-system-blue/10 animate-pulse"></div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <h2 className="text-4xl font-bold text-white mb-2 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                LEVEL UP!
              </h2>
              <div className="flex items-center justify-center gap-4 text-system-blue text-2xl font-bold">
                <span>Lv. {level - 1}</span>
                <ChevronUp className="animate-bounce" />
                <span>Lv. {level}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
