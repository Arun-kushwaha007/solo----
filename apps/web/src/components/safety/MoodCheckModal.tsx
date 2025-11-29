import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { logSafetyEvent } from '../../services/safety';

interface MoodCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrisisTrigger: () => void;
}

const MoodCheckModal: React.FC<MoodCheckModalProps> = ({ isOpen, onClose, onCrisisTrigger }) => {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = async (value: number) => {
    const newScore = score + value;
    if (step === 0) {
      setScore(newScore);
      setStep(1);
    } else {
      // Finalize
      try {
        const res = await logSafetyEvent('MOOD_CHECK', { score: newScore, maxScore: 6 });
        if (res.crisisTriggered || newScore >= 3) { // PHQ-2 cutoff is usually 3
          onCrisisTrigger();
        }
        onClose();
        setStep(0);
        setScore(0);
      } catch (err) {
        console.error(err);
      }
    }
  };

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
            className="bg-slate-900 border border-blue-500/30 rounded-lg p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-bold text-white mb-6">Daily Status Check</h2>
            
            <p className="text-slate-300 mb-8 text-lg">
              {step === 0 
                ? "Over the last 2 weeks, how often have you been bothered by having little interest or pleasure in doing things?"
                : "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?"
              }
            </p>

            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Not at all", value: 0 },
                { label: "Several days", value: 1 },
                { label: "More than half the days", value: 2 },
                { label: "Nearly every day", value: 3 },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className="p-3 text-left bg-slate-800 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500 text-white rounded transition-all"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MoodCheckModal;
