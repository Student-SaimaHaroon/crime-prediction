import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';
import { Shield, Eye, EyeOff, AlertCircle, Loader2, Lock, User, CheckCircle } from 'lucide-react';

const demoStates = [
  { label: 'Invalid Credentials', email: 'wrong@test.com', password: 'wrong', type: 'invalid' },
  { label: 'Account Locked', email: 'locked@test.com', password: 'Admin@123', type: 'locked' },
  { label: 'Session Expired', email: 'expired@test.com', password: 'Admin@123', type: 'expired' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('arjun@cybercrime.gov.in');
  const [password, setPassword] = useState('Admin@123');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoState, setDemoState] = useState(null);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Simulate demo states
    if (email === 'locked@test.com') { setError({ type: 'locked', msg: 'Account is locked. Please contact your administrator.' }); return; }
    if (email === 'expired@test.com') { setError({ type: 'expired', msg: 'Your session has expired. Please log in again to continue.' }); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const result = login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError({ type: 'invalid', msg: 'Invalid email or password. Please try again.' });
    }
    setLoading(false);
  };

  const errorColors = {
    locked: 'bg-red-50 border-red-200 text-red-700',
    expired: 'bg-orange-50 border-orange-200 text-orange-700',
    invalid: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-purple-500 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">CYBERCRIME PREDICTION</p>
              <p className="text-blue-300 text-xs">& INVESTIGATION PLATFORM</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl font-bold text-white leading-tight">
            AI-Powered<br />
            Cybercrime<br />
            <span className="text-blue-400">Intelligence</span>
          </h1>
          <p className="text-blue-200/80 text-sm leading-relaxed max-w-xs">
            Advanced threat prediction and investigation platform for law enforcement agencies. Real-time analytics, fund flow tracking, and intelligent case management.
          </p>
          <div className="space-y-3">
            {['Predictive Crime Analytics', 'Fund Flow Visualization', 'GIS Intelligence Mapping', 'Automated Case Management'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-blue-100/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-white/30 text-xs">Ministry of Home Affairs</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Cybercrime Prediction Platform</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-sm text-gray-500 mt-1">Sign in to your investigator account</p>
            </div>

            {/* Demo credentials hint */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700 font-medium mb-1">Demo Credentials</p>
              <p className="text-xs text-blue-600">Email: arjun@cybercrime.gov.in</p>
              <p className="text-xs text-blue-600">Password: Admin@123</p>
            </div>

            {/* Error */}
            {error && (
              <div className={`mb-4 p-3 rounded-lg border flex items-start gap-2 ${errorColors[error.type]}`}>
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">{error.msg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email / Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="officer@cybercrime.gov.in"
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600" />
                  <span className="text-xs text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Forgot password?</Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : 'Sign In'}
              </button>
            </form>

            <div className="mt-4">
              <div className="relative flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <button className="w-full border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Sign in with SSO / Government Portal
              </button>
            </div>

            {/* Demo state buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 mb-2 font-medium">DEMO STATES</p>
              <div className="flex flex-wrap gap-1.5">
                {demoStates.map(s => (
                  <button key={s.type} onClick={() => { setEmail(s.email); setPassword(s.password); setError(null); }}
                    className="text-[10px] px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Request Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}