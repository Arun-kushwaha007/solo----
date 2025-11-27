import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, Zap, Heart, CheckCircle2 } from 'lucide-react';

interface AssessmentProps {
  onComplete: (fitnessLevel: 'beginner' | 'intermediate' | 'advanced', goals: string[]) => void;
}

export const FitnessAssessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const questions = [
    {
      id: 'experience',
      question: 'What is your current fitness level?',
      icon: Activity,
      options: [
        { value: 'beginner', label: 'Beginner', desc: 'I rarely exercise or just starting out' },
        { value: 'intermediate', label: 'Intermediate', desc: 'I exercise 2-3 times per week' },
        { value: 'advanced', label: 'Advanced', desc: 'I exercise 4+ times per week regularly' },
      ],
    },
    {
      id: 'pushups',
      question: 'How many push-ups can you do in one set?',
      icon: Zap,
      options: [
        { value: 'low', label: '0-10 push-ups', level: 'beginner' },
        { value: 'medium', label: '11-25 push-ups', level: 'intermediate' },
        { value: 'high', label: '26+ push-ups', level: 'advanced' },
      ],
    },
    {
      id: 'cardio',
      question: 'Can you run/jog for 10 minutes without stopping?',
      icon: Heart,
      options: [
        { value: 'no', label: 'No, I get tired quickly', level: 'beginner' },
        { value: 'maybe', label: 'Yes, but it\'s challenging', level: 'intermediate' },
        {value: 'yes', label: 'Yes, easily', level: 'advanced' },
      ],
    },
    {
      id: 'goals',
      question: 'What are your primary fitness goals? (Select all that apply)',
      icon: Target,
      multiple: true,
      options: [
        { value: 'strength', label: 'Build Strength' },
        { value: 'endurance', label: 'Improve Endurance' },
        { value: 'weight_loss', label: 'Lose Weight' },
        { value: 'muscle', label: 'Gain Muscle' },
        { value: 'flexibility', label: 'Increase Flexibility' },
        { value: 'general', label: 'General Fitness' },
      ],
    },
  ];

  const currentQuestion = questions[step];
  const Icon = currentQuestion.icon;

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      // Calculate fitness level
      const levels = [
        answers.experience,
        answers.pushups === 'low' ? 'beginner' : answers.pushups === 'medium' ? 'intermediate' : 'advanced',
        answers.cardio === 'no' ? 'beginner' : answers.cardio === 'maybe' ? 'intermediate' : 'advanced',
      ];
      
      const levelCounts = levels.reduce((acc, level) => {
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const fitnessLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0][0] as any;
      const goals = Array.isArray(newAnswers.goals) ? newAnswers.goals : [newAnswers.goals];

      setTimeout(() => onComplete(fitnessLevel, goals), 500);
    }
  };

  const handleMultipleAnswer = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const levels = [
        answers.experience,
        answers.pushups === 'low' ? 'beginner' : answers.pushups === 'medium' ? 'intermediate' : 'advanced',
        answers.cardio === 'no' ? 'beginner' : answers.cardio === 'maybe' ? 'intermediate' : 'advanced',
      ];
      
      const levelCounts = levels.reduce((acc, level) => {
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const fitnessLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0][0] as any;
      const goals = Array.isArray(answers.goals) ? answers.goals : [answers.goals];

      onComplete(fitnessLevel, goals);
    }
  };

  const toggleMultiple = (value: string) => {
    const current = answers[currentQuestion.id] || [];
    const newValue = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    setAnswers({ ...answers, [currentQuestion.id]: newValue });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-system-blue/10 via-transparent to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400 font-mono">ASSESSMENT PROGRESS</span>
            <span className="text-sm text-system-blue font-mono">{step + 1}/{questions.length}</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-system-blue shadow-glow-blue"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-black/80 border-2 border-system-blue/50 rounded-lg p-8 shadow-[0_0_50px_rgba(0,163,255,0.2)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-system-blue/20 rounded-lg">
              <Icon className="text-system-blue" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wider">{currentQuestion.question}</h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = currentQuestion.multiple
                ? (answers[currentQuestion.id] || []).includes(option.value)
                : answers[currentQuestion.id] === option.value;

              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => currentQuestion.multiple ? toggleMultiple(option.value) : handleAnswer(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'bg-system-blue/20 border-system-blue text-white'
                      : 'bg-black/40 border-gray-700 text-gray-300 hover:border-system-blue/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{option.label}</div>
                      {option.desc && <div className="text-sm text-gray-500 mt-1">{option.desc}</div>}
                    </div>
                    {isSelected && <CheckCircle2 className="text-system-blue" size={24} />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {currentQuestion.multiple && (
            <button
              onClick={handleMultipleAnswer}
              disabled={!answers[currentQuestion.id] || answers[currentQuestion.id].length === 0}
              className="w-full mt-6 bg-system-blue hover:bg-white text-black font-bold py-3 rounded shadow-glow-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              CONTINUE
            </button>
          )}
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm font-mono">
          Your answers will help us create a personalized training plan
        </div>
      </motion.div>
    </div>
  );
};
