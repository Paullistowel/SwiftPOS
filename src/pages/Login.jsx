import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 dark:bg-mesh flex">
      {/* Left panel */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow-sm">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none"><path d="M8 12L16 6L24 12V20L16 26L8 20V12Z" stroke="white" strokeWidth="2.5" fill="none"/><circle cx="16" cy="16" r="3" fill="white"/></svg>
            </div>
            <span className="font-display font-bold text-xl text-surface-900 dark:text-white">Swift<span className="text-primary-600 dark:text-primary-400">POS</span></span>
          </Link>
          <ThemeToggle />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-surface-500 mb-8">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label !mb-0">Password</label>
                  <a href="#" className="text-xs text-primary-400 hover:text-primary-300 font-medium">Forgot?</a>
                </div>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input pr-12" placeholder="Enter your password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d={showPassword ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" : "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"} />
                      {!showPassword && <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
              <p className="text-xs font-semibold text-primary-400 mb-2">Demo Credentials</p>
              <div className="text-xs text-primary-300/70 space-y-1 font-mono">
                <div>admin@swiftpos.com / admin123</div>
                <div>cashier@swiftpos.com / cashier123</div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-surface-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 font-semibold hover:text-primary-300">Create one</Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-900/50 to-surface-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(99,102,241,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(16,185,129,0.08),_transparent_50%)]" />
        <div className="text-center relative z-10 max-w-md">
          <div className="w-24 h-24 bg-primary-500/10 border border-primary-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">Manage your business</h2>
          <p className="text-surface-400 leading-relaxed">Process sales, scan barcodes, track inventory, and analyze performance — all from one powerful dashboard.</p>
          <div className="flex justify-center gap-8 mt-10 text-center">
            {[{ n: '10K+', l: 'Transactions' }, { n: '99.9%', l: 'Uptime' }, { n: '50ms', l: 'Response' }].map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-display font-bold gradient-text">{s.n}</div>
                <div className="text-xs text-surface-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
