import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 bg-mesh flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-900/30 to-surface-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(16,185,129,0.12),_transparent_60%)]" />
        <div className="text-center relative z-10 max-w-md">
          <div className="w-24 h-24 bg-accent-500/10 border border-accent-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">Start selling in minutes</h2>
          <p className="text-surface-400 leading-relaxed">No credit card required. Full access to all features during your 14-day trial.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow-sm">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none"><path d="M8 12L16 6L24 12V20L16 26L8 20V12Z" stroke="white" strokeWidth="2.5" fill="none"/><circle cx="16" cy="16" r="3" fill="white"/></svg>
            </div>
            <span className="font-display font-bold text-xl text-white">Swift<span className="text-primary-400">POS</span></span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Create your account</h1>
            <p className="text-surface-500 mb-8">Start your 14-day free trial</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div><label className="label">Full Name</label><input name="name" value={form.name} onChange={handleChange} className="input" placeholder="John Smith" required /></div>
              <div><label className="label">Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="you@example.com" required /></div>
              <div><label className="label">Password</label><input name="password" type="password" value={form.password} onChange={handleChange} className="input" placeholder="Min 6 characters" required /></div>
              <div><label className="label">Confirm Password</label><input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input" placeholder="Confirm password" required /></div>
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 text-base">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-surface-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
