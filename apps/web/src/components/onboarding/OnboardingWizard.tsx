import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Brain, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import gameService from '../../services/game.service';
import { useMetrics } from '../../hooks/useMetrics';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { track } = useMetrics();

  useEffect(() => {
    if (isOpen) {
      track('onboarding_start');
    }
  }, [isOpen, track]);

  if (!isOpen) return null;

  const handleComplete = async () => {
    track('onboarding_complete', { step: 3 });
    try {
      await gameService.startBaseline(7);
    } catch (error) {
      console.error('Failed to start baseline:', error);
    }
    onClose();
    navigate('/game?tab=quests');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-system-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-system-blue/20 flex items-center justify-center text-system-blue font-bold">
              {step}
            </div>
            <h2 className="text-xl font-bold text-white">
              {step === 1 && 'System Calibration'}
              {step === 2 && 'Baseline Assessment'}
              {step === 3 && 'Analysis Complete'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && <Step1Persona onNext={() => setStep(2)} />}
            {step === 2 && <Step2Test onNext={() => setStep(3)} />}
            {step === 3 && <Step3Results onComplete={handleComplete} />}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const Step1Persona = ({ onNext }: { onNext: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Initialize Player Profile</h3>
        <p className="text-gray-400">Configure your system integration preferences.</p>
      </div>

      <div className="grid gap-4">
        <label className="flex items-center justify-between p-4 border border-gray-800 rounded-xl hover:border-system-blue/50 cursor-pointer transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300">
              <Activity size={24} />
            </div>
            <div>
              <div className="font-bold text-white">Wearable Integration</div>
              <div className="text-sm text-gray-500">Sync health data from device</div>
            </div>
          </div>
          <input type="checkbox" className="w-5 h-5 accent-system-blue" defaultChecked />
        </label>

        <label className="flex items-center justify-between p-4 border border-gray-800 rounded-xl hover:border-system-blue/50 cursor-pointer transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300">
              <Brain size={24} />
            </div>
            <div>
              <div className="font-bold text-white">Cognitive Tracking</div>
              <div className="text-sm text-gray-500">Enable mental acuity tests</div>
            </div>
          </div>
          <input type="checkbox" className="w-5 h-5 accent-system-blue" defaultChecked />
        </label>
      </div>

      <div className="pt-8 flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 bg-system-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-all"
        >
          Initialize
          <ChevronRight size={20} />
        </button>
      </div>
    </motion.div>
  );
};

const Step2Test = ({ onNext }: { onNext: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 50); // 5 seconds total

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 text-center py-8"
    >
      <div className="space-y-4">
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="#1f2937"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray={377}
              strokeDashoffset={377 - (377 * progress) / 100}
              className="transition-all duration-100 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white font-mono">
            {progress}%
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white animate-pulse">
          Analyzing Physical Capabilities...
        </h3>
        <p className="text-gray-500">Please wait while the System calibrates your baseline.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-gray-500 mb-1">Strength</div>
          <div className="text-white font-mono">{progress > 30 ? 'CALCULATING...' : 'WAITING'}</div>
        </div>
        <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-gray-500 mb-1">Agility</div>
          <div className="text-white font-mono">{progress > 60 ? 'CALCULATING...' : 'WAITING'}</div>
        </div>
        <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
          <div className="text-gray-500 mb-1">Endurance</div>
          <div className="text-white font-mono">{progress > 90 ? 'CALCULATING...' : 'WAITING'}</div>
        </div>
      </div>

      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={onNext}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all"
          >
            View Results
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

const Step3Results = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-white">Calibration Complete</h3>
        <p className="text-gray-400">You have been assigned the rank: <span className="text-white font-bold">E-Rank Hunter</span></p>
      </div>

      <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Daily Quest Unlocked</span>
          <span className="text-yellow-500 font-bold flex items-center gap-1">
            <Lock size={14} className="text-yellow-500" />
            UNLOCKED
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-black rounded-lg border border-gray-800">
          <div className="w-10 h-10 bg-system-blue/20 rounded flex items-center justify-center text-system-blue font-bold">
            D
          </div>
          <div>
            <div className="text-white font-bold">Strength Training I</div>
            <div className="text-xs text-gray-500">Daily • 100 XP</div>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full py-4 bg-system-blue hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20"
      >
        Accept First Mission
      </button>
    </motion.div>
  );
};

export default OnboardingWizard;
