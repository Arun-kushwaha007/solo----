import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../../services/auth.service';

export const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: '', color: '' };
    if (pwd.length < 6) return { strength: 1, label: 'Too Short', color: 'text-system-red' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 1) return { strength: 25, label: 'Weak', color: 'text-system-red' };
    if (strength === 2) return { strength: 50, label: 'Fair', color: 'text-yellow-500' };
    if (strength === 3) return { strength: 75, label: 'Good', color: 'text-system-blue' };
    return { strength: 100, label: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-system-blue/10 via-transparent to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md"
        >
          <div className="bg-black/80 border-2 border-system-blue/50 rounded-lg p-8 shadow-[0_0_50px_rgba(0,163,255,0.2)]">
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 text-system-blue" size={64} />
              <h1 className="text-3xl font-bold text-system-blue mb-4">PASSWORD RESET SUCCESSFUL</h1>
              <p className="text-gray-300 mb-6">
                Your password has been successfully reset.
              </p>
              <p className="text-gray-400 text-sm">
                Redirecting to login...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-system-blue/10 via-transparent to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-black/80 border-2 border-system-blue/50 rounded-lg p-8 shadow-[0_0_50px_rgba(0,163,255,0.2)]">
          <h1 className="text-4xl font-bold text-center mb-2 text-system-blue tracking-wider">
            NEW PASSWORD
          </h1>
          <p className="text-center text-gray-400 mb-8 font-mono text-sm">SECURE YOUR ACCOUNT</p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-sm font-mono text-gray-400 mb-2">NEW PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-black/50 border border-system-blue/30 rounded px-10 py-3 text-white focus:outline-none focus:border-system-blue transition-colors font-mono pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Password Strength</span>
                    <span className={passwordStrength.color}>{passwordStrength.label}</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.strength}%` }}
                      className={`h-full ${
                        passwordStrength.strength <= 25 ? 'bg-system-red' :
                        passwordStrength.strength <= 50 ? 'bg-yellow-500' :
                        passwordStrength.strength <= 75 ? 'bg-system-blue' :
                        'bg-green-500'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-mono text-gray-400 mb-2">CONFIRM PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-black/50 border border-system-blue/30 rounded px-10 py-3 text-white focus:outline-none focus:border-system-blue transition-colors font-mono pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-system-red">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || password !== confirmPassword}
              className="w-full bg-system-blue hover:bg-white text-black font-bold py-3 rounded shadow-glow-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>RESETTING...</span>
                </>
              ) : (
                <span>RESET PASSWORD</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
