// apps/web/src/components/onboarding/BaselineModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiAdapter } from '../../mocks/apiAdapter';

interface BaselineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const BaselineModal: React.FC<BaselineModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'intro' | 'assessment' | 'complete'>('intro');
  const [assessmentType, setAssessmentType] = useState<'quick' | 'full'>('quick');
  const [progress, setProgress] = useState(0);

  const startAssessment = (type: 'quick' | 'full') => {
    setAssessmentType(type);
    setStep('assessment');
    // Simulate progress
    let p = 0;
    const interval = setInterval(() => {
      p += 5; // Fast simulation
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep('complete'), 500);
      }
    }, 100);
  };

  const handleComplete = async () => {
    // Call mock API to unlock starter quest
    await apiAdapter.logEvent('baseline_completed', { type: assessmentType });
    // In a real app, this would create the profile or set a flag
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-1 bg-gradient-to-r from-primary-500/50 to-purple-500/50"></div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-white text-center">System Initialization</h2>
                <p className="text-neutral-400 text-center">
                  Select your baseline assessment protocol. This will determine your initial stats and daily quest difficulty.
                </p>

                <div className="grid grid-cols-1 gap-4 mt-6">
                  <button
                    onClick={() => startAssessment('quick')}
                    className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-primary-500 hover:bg-neutral-800/80 transition-all text-left group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white group-hover:text-primary-400">Quick Baseline</span>
                      <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">5 MIN</span>
                    </div>
                    <p className="text-sm text-neutral-400">Rapid physical evaluation. Basic stat allocation.</p>
                  </button>

                  <button
                    onClick={() => startAssessment('full')}
                    className="p-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-purple-500 hover:bg-neutral-800/80 transition-all text-left group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white group-hover:text-purple-400">Full Analysis</span>
                      <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">20 MIN</span>
                    </div>
                    <p className="text-sm text-neutral-400">Comprehensive mental & physical test. Bonus starter items.</p>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'assessment' && (
              <motion.div
                key="assessment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <div className="mb-6 relative w-32 h-32 mx-auto">
                   <svg className="w-full h-full" viewBox="0 0 100 100">
                     <circle
                       className="text-neutral-800 stroke-current"
                       strokeWidth="10"
                       cx="50"
                       cy="50"
                       r="40"
                       fill="transparent"
                     ></circle>
                     <circle
                       className="text-primary-500 progress-ring__circle stroke-current"
                       strokeWidth="10"
                       strokeLinecap="round"
                       cx="50"
                       cy="50"
                       r="40"
                       fill="transparent"
                       strokeDasharray={`${2 * Math.PI * 40}`}
                       strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                       transform="rotate(-90 50 50)"
                     ></circle>
                   </svg>
                   <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                     <span className="text-2xl font-bold font-mono text-primary-400">{progress}%</span>
                   </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Analyzing...</h3>
                <p className="text-sm text-neutral-400 font-mono">
                  {progress < 30 ? "Measuring muscle density..." :
                   progress < 60 ? "Evaluating neural pathways..." :
                   "Calibrating mana sensitivity..."}
                </p>
              </motion.div>
            )}

            {step === 'complete' && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-success-500/20 rounded-full flex items-center justify-center mx-auto text-success-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete</h2>
                  <p className="text-neutral-400">
                    You have been assigned: <span className="text-white font-bold">E-Rank Hunter</span>
                  </p>
                </div>

                <button
                  onClick={handleComplete}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-glow-blue transition-all"
                >
                  Enter Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
