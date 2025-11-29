import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import authService from '../../services/auth.service';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
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
              <h1 className="text-3xl font-bold text-system-blue mb-4">CHECK YOUR EMAIL</h1>
              <p className="text-gray-300 mb-6">
                If an account exists with <span className="text-system-blue font-mono">{email}</span>, 
                you will receive a password reset link shortly.
              </p>
              <p className="text-gray-400 text-sm mb-8">
                The link will expire in 1 hour for security reasons.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-system-blue hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>
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
            RESET PASSWORD
          </h1>
          <p className="text-center text-gray-400 mb-8 font-mono text-sm">ACCOUNT RECOVERY</p>

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
              <label className="block text-sm font-mono text-gray-400 mb-2">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-system-blue/30 rounded px-10 py-3 text-white focus:outline-none focus:border-system-blue transition-colors font-mono"
                  placeholder="hunter@system.com"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Enter the email address associated with your account
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-system-blue hover:bg-white text-black font-bold py-3 rounded shadow-glow-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>SENDING...</span>
                </>
              ) : (
                <span>SEND RESET LINK</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-system-blue transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
