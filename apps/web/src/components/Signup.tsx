import { useState, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, AlertCircle, Loader, Sword } from 'lucide-react';
import authService from '../services/auth.service';
import { LifeAssessment } from './LifeAssessment';
import type { LifeCategory } from '../types';

interface SignupProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [showAssessment, setShowAssessment] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    playerName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof formData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleAssessmentComplete = (
    selectedCategories: LifeCategory[],
    categoryLevels: Record<LifeCategory, 'beginner' | 'intermediate' | 'advanced'>
  ) => {
    submitRegistration(selectedCategories, categoryLevels);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    setShowAssessment(true);
  };

  const submitRegistration = async (
    selectedCategories: LifeCategory[],
    categoryLevels: Record<LifeCategory, 'beginner' | 'intermediate' | 'advanced'>
  ) => {
    setError('');
    setLoading(true);

    try {
      await authService.register({
        ...formData,
        playerName: formData.playerName || undefined,
        selectedCategories,
        categoryLevels,
      } as any);
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
      setError(errorMsg);
      setShowAssessment(false);
    } finally {
      setLoading(false);
    }
  };

  if (showAssessment) {
    return <LifeAssessment onComplete={handleAssessmentComplete} />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-system-blue/10 via-transparent to-transparent" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="bg-black/80 border-2 border-system-blue/50 rounded-lg p-8 shadow-[0_0_50px_rgba(0,163,255,0.2)]">
          <h1 className="text-4xl font-bold text-center mb-2 text-system-blue tracking-wider">SOLO LEVELING</h1>
          <p className="text-center text-gray-400 mb-8 font-mono text-sm">BEGIN YOUR JOURNEY</p>

          <form onSubmit={handleInitialSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-system-red/10 border border-system-red/50 rounded p-3 flex items-center gap-2 text-system-red text-sm"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">USERNAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleChange('username')}
                  required
                  minLength={3}
                  maxLength={20}
                  className="w-full bg-black/50 border border-system-blue/30 rounded px-10 py-3 text-white focus:outline-none focus:border-system-blue transition-colors font-mono"
                  placeholder="hunter123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  className="w-full bg-black/50 border border-system-blue/30 rounded px-10 py-3 text-white focus:outline-none focus:border-system-blue transition-colors font-mono"
                  placeholder="hunter@system.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  required
                  minLength={6}
                  className="w-full bg-black/50 border border-system-blue/30 rounded px-10 py-3 text-white focus:outline-none focus:border-system-blue transition-colors font-mono"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">
                PLAYER NAME <span className="text-gray-600">(Optional)</span>
              </label>
              <div className="relative">
                <Sword className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={formData.playerName}
                  onChange={handleChange('playerName')}
                  className="w-full bg-black/50 border border-system-blue/30 rounded px-10 py-3 text-white focus:outline-none focus:border-system-blue transition-colors font-mono"
                  placeholder="SUNG JIN-WOO"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-system-blue hover:bg-white text-black font-bold py-3 rounded shadow-glow-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>CREATING HUNTER...</span>
                </>
              ) : (
                <span>CONTINUE TO ASSESSMENT</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already a hunter?{' '}
              <button onClick={onSwitchToLogin} className="text-system-blue hover:text-white transition-colors font-bold">
                Login
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
