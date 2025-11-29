import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitCalibration } from '../../services/profile';

interface BaselineTestProps {
  onComplete: () => void;
}

const BaselineTest: React.FC<BaselineTestProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    pushups: 0,
    runTime: 0,
    focusScore: 0,
  });

  const handleSubmit = async () => {
    try {
      await submitCalibration(data);
      onComplete();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 p-6 rounded-lg border border-blue-500/30 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">System Calibration</h2>
      
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-xl text-blue-400 mb-4">Physical Strength</h3>
          <p className="text-slate-300 mb-4">How many pushups can you do in one set?</p>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white mb-6"
            placeholder="Enter count"
            onChange={(e) => setData({ ...data, pushups: parseInt(e.target.value) || 0 })}
          />
          <button
            onClick={() => setStep(1)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
          >
            Next
          </button>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-xl text-green-400 mb-4">Agility / Endurance</h3>
          <p className="text-slate-300 mb-4">What is your 2.4km (1.5 mile) run time? (in minutes)</p>
          <input
            type="number"
            className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white mb-6"
            placeholder="Enter minutes"
            onChange={(e) => setData({ ...data, runTime: parseInt(e.target.value) || 0 })}
          />
          <button
            onClick={() => setStep(2)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
          >
            Next
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 className="text-xl text-purple-400 mb-4">Intelligence / Focus</h3>
          <p className="text-slate-300 mb-4">Rate your ability to focus on a task for 1 hour (1-10)</p>
          <input
            type="number"
            max={10}
            className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white mb-6"
            placeholder="Score 1-10"
            onChange={(e) => setData({ ...data, focusScore: parseInt(e.target.value) || 0 })}
          />
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded"
          >
            Submit Calibration
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default BaselineTest;
