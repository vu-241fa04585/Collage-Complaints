import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardRoute } from '../../utils/helpers';
import {
  HiShieldCheck,
  HiMail,
  HiLockClosed,
  HiArrowRight,
  HiLightningBolt,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const user = await login({ email, password });
      const targetRoute = getDashboardRoute(user.role);
      navigate(targetRoute);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick filler
  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Left side: Enterprise Hero / Branding */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <HiShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wider">CGR SYSTEM</h1>
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest">
              College Grievance Redressal
            </p>
          </div>
        </div>

        {/* Middle Value Proposition */}
        <div className="my-10 z-10">
          <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/60 text-blue-300 text-xs font-semibold mb-6 border border-blue-700/50">
            <HiLightningBolt className="text-blue-400" />
            <span>Smart Routing & SLA Escalation Architecture</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
            A Transparent, Accountable Redressal Platform for Campus Life.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
            Empowering students with real-time tracking IDs, automated department assignment, strict resolution SLA deadlines, and confidential reporting protocols.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <p className="text-white font-bold text-lg">100%</p>
              <p className="text-slate-400">Digital Tracking Audit</p>
            </div>
            <div>
              <p className="text-white font-bold text-lg">&lt; 24 Hrs</p>
              <p className="text-slate-400">Avg Resolution SLA</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 z-10">
          © {new Date().getFullYear()} National Institute of Engineering & Technology. All rights reserved.
        </div>
      </div>

      {/* Right side: Login Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-900/90">
        <div className="w-full max-w-md space-y-6">
          <div className="text-left">
            <h3 className="text-2xl font-bold text-white tracking-tight">Sign in to your account</h3>
            <p className="text-sm text-slate-400 mt-1">
              Enter your college credentials or select a demo role below
            </p>
          </div>

          {/* Quick Demo Role Selector */}
          <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700/70 space-y-2">
            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
              <HiLightningBolt className="w-3.5 h-3.5" />
              <span>One-Click Demo Account Login</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('student@college.edu')}
                className="px-2.5 py-1.5 bg-slate-700/70 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium transition text-left truncate"
              >
                👨‍🎓 Student
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('faculty@college.edu')}
                className="px-2.5 py-1.5 bg-slate-700/70 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium transition text-left truncate"
              >
                👨‍🏫 Faculty
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('hod@college.edu')}
                className="px-2.5 py-1.5 bg-slate-700/70 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium transition text-left truncate"
              >
                🏛️ Dept Head
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@college.edu')}
                className="px-2.5 py-1.5 bg-slate-700/70 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium transition text-left truncate"
              >
                🛡️ Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('management@college.edu')}
                className="px-2.5 py-1.5 bg-slate-700/70 hover:bg-blue-600 text-slate-200 hover:text-white rounded-lg font-medium transition text-left truncate col-span-2 sm:col-span-2"
              >
                📊 College Management
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-right">Default Password: password123</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., student@college.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <HiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center pt-2 text-xs text-slate-400">
            Are you a newly enrolled student without an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

