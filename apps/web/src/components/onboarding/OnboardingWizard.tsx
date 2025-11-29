import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { updateDemographics, startCalibration } from '../../services/profile';
import BaselineTest from './BaselineTest';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0: Demographics, 1: Intro, 2: Baseline
  const [demographics, setDemographics] = useState({
    age: '',
    height: '',
    weight: '',
    gender: 'Male',
  });

  const handleDemographicsSubmit = async () => {
    try {
      await updateDemographics({
        age: parseInt(demographics.age),
        height: parseInt(demographics.height),
        weight: parseInt(demographics.weight),
        gender: demographics.gender,
      });
      setStep(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartCalibration = async () => {
    try {
      await startCalibration();
      setStep(2);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {step === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900 p-8 rounded-lg border border-slate-700"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Hunter Registration</h2>
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Age"
              className="w-full p-3 bg-slate-800 rounded border border-slate-700"
              value={demographics.age}
              onChange={e => setDemographics({...demographics, age: e.target.value})}
            />
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Height (cm)"
                className="w-1/2 p-3 bg-slate-800 rounded border border-slate-700"
                value={demographics.height}
                onChange={e => setDemographics({...demographics, height: e.target.value})}
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                className="w-1/2 p-3 bg-slate-800 rounded border border-slate-700"
                value={demographics.weight}
                onChange={e => setDemographics({...demographics, weight: e.target.value})}
              />
            </div>
            <select
              className="w-full p-3 bg-slate-800 rounded border border-slate-700"
              value={demographics.gender}
              onChange={e => setDemographics({...demographics, gender: e.target.value})}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <button
              onClick={handleDemographicsSubmit}
              className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-500 rounded font-bold"
            >
              Register
            </button>
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="max-w-2xl text-center"
        >
          <h1 className="text-4xl font-bold mb-6 text-blue-500">System Initialization</h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Welcome, Player. To determine your initial rank and stats, you must undergo a baseline calibration.
            This will involve a series of physical and mental tests.
          </p>
          <button
            onClick={handleStartCalibration}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-lg shadow-lg shadow-blue-500/30"
          >
            Start Calibration
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <BaselineTest onComplete={onComplete} />
      )}
    </div>
  );
};

export default OnboardingWizard;
