import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { LifeCategory } from '../types';
import { CATEGORY_INFO } from '../types';

interface LifeAssessmentProps {
  onComplete: (selectedCategories: LifeCategory[], categoryLevels: Record<LifeCategory, 'beginner' | 'intermediate' | 'advanced'>) => void;
}

export const LifeAssessment: React.FC<LifeAssessmentProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'categories' | 'levels'>('categories');
  const [selectedCategories, setSelectedCategories] = useState<LifeCategory[]>([]);
  const [categoryLevels, setCategoryLevels] = useState<Record<string, 'beginner' | 'intermediate' | 'advanced'>>({});

  const toggleCategory = (category: LifeCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const setCategoryLevel = (category: LifeCategory, level: 'beginner' | 'intermediate' | 'advanced') => {
    setCategoryLevels(prev => ({ ...prev, [category]: level }));
  };

  const handleContinue = () => {
    if (step === 'categories' && selectedCategories.length > 0) {
      setStep('levels');
    } else if (step === 'levels') {
      const allLevelsSet = selectedCategories.every(cat => categoryLevels[cat]);
      if (allLevelsSet) {
        onComplete(selectedCategories, categoryLevels as Record<LifeCategory, 'beginner' | 'intermediate' | 'advanced'>);
      }
    }
  };

  const canContinue = step === 'categories' 
    ? selectedCategories.length > 0
    : selectedCategories.every(cat => categoryLevels[cat]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-system-blue/10 via-transparent to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-5xl"
      >
        {/* Progress indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between mb-2 text-xs sm:text-sm">
            <span className="text-gray-400 font-mono">LIFE ASSESSMENT</span>
            <span className="text-system-blue font-mono">STEP {step === 'categories' ? '1' : '2'}/2</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-system-blue shadow-glow-blue"
              initial={{ width: 0 }}
              animate={{ width: step === 'categories' ? '50%' : '100%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-black/80 border-2 border-system-blue/50 rounded-lg p-4 sm:p-6 md:p-8 shadow-[0_0_50px_rgba(0,163,255,0.2)]">
          <AnimatePresence mode="wait">
            {step === 'categories' ? (
              <motion.div
                key="categories"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wider mb-2">
                  CHOOSE YOUR PATH
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
                  Select the life areas you want to level up. Choose at least one, or multiple to create a balanced routine.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {(Object.keys(CATEGORY_INFO) as LifeCategory[]).map((category) => {
                    const info = CATEGORY_INFO[category];
                    const isSelected = selectedCategories.includes(category);

                    return (
                      <motion.button
                        key={category}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleCategory(category)}
                        className={`p-4 sm:p-5 rounded-lg border-2 transition-all text-left relative ${
                          isSelected
                            ? 'border-system-blue bg-system-blue/10'
                            : 'border-gray-700 bg-black/40 hover:border-system-blue/50'
                        }`}
                        style={{
                          boxShadow: isSelected ? `0 0 20px ${info.color}40` : 'none'
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <span className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">{info.icon}</span>
                            <div className="min-w-0">
                              <h3 className="font-bold text-base sm:text-lg md:text-xl text-white truncate">{info.name}</h3>
                              <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{info.description}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="text-system-blue flex-shrink-0 ml-2" size={20} />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="text-center text-gray-500 text-xs sm:text-sm mb-4">
                  {selectedCategories.length === 0 ? (
                    'Select at least one category to continue'
                  ) : (
                    `${selectedCategories.length} ${selectedCategories.length === 1 ? 'category' : 'categories'} selected`
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="levels"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wider mb-2">
                  ASSESS YOUR LEVEL
                </h2>
                <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
                  For each selected area, choose your current experience level. Be honest - this helps create the perfect starting point.
                </p>

                <div className="space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {selectedCategories.map((category) => {
                    const info = CATEGORY_INFO[category];
                    const currentLevel = categoryLevels[category];

                    return (
                      <div key={category} className="border border-gray-700 rounded-lg p-4 sm:p-5 md:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4">
                          <span className="text-2xl sm:text-3xl">{info.icon}</span>
                          <h3 className="font-bold text-lg sm:text-xl text-white">{info.name}</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                            <button
                              key={level}
                              onClick={() => setCategoryLevel(category, level)}
                              className={`p-3 sm:p-4 rounded border-2 transition-all ${
                                currentLevel === level
                                  ? 'border-system-blue bg-system-blue/20 text-white'
                                  : 'border-gray-700 bg-black/40 text-gray-400 hover:border-system-blue/50'
                              }`}
                            >
                              <div className="font-bold capitalize text-sm sm:text-base mb-1">{level}</div>
                              <div className="text-xs text-gray-500">
                                {level === 'beginner' && 'Just starting out'}
                                {level === 'intermediate' && 'Some experience'}
                                {level === 'advanced' && 'Highly experienced'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full mt-6 sm:mt-8 bg-system-blue hover:bg-white text-black font-bold py-3 sm:py-4 rounded shadow-glow-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>{step === 'categories' ? 'CONTINUE' : 'START YOUR JOURNEY'}</span>
            <ArrowRight size={20} />
          </button>

          {step === 'levels' && (
            <button
              onClick={() => setStep('categories')}
              className="w-full mt-3 text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
            >
              ← Back to category selection
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
