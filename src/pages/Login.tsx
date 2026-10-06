import React, { useState } from 'react';
import { Store, ShieldCheck, UserCheck, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../api.ts';
import { User } from '../types/index.ts';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('cashier');
  const [password, setPassword] = useState('cashier123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(username, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userRole: 'admin' | 'cashier') => {
    const u = userRole === 'admin' ? 'admin' : 'cashier';
    const p = userRole === 'admin' ? 'admin123' : 'cashier123';
    setUsername(u);
    setPassword(p);
    setError('');
    setLoading(true);

    try {
      const res = await api.login(u, p);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 mb-3 text-white shadow-md shadow-indigo-950/50">
            <Store className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            SmartStock Academic
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            University Campus Store &amp; Point of Sale Terminal
          </p>
        </div>

        {/* Main Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Operator Sign In</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter staff credentials or select a verified demo profile below.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or cashier"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white text-xs shadow-md shadow-indigo-950/40 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick 1-Click Demo Profiles
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('cashier')}
                disabled={loading}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 hover:border-purple-500/40 border border-slate-800 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold text-white">Cashier</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Sarah Jenkins</p>
                <p className="text-[9px] font-mono text-purple-400 mt-0.5">cashier / cashier123</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
                className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 hover:border-indigo-500/40 border border-slate-800 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Admin</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Dr. Alistair Vance</p>
                <p className="text-[9px] font-mono text-indigo-400 mt-0.5">admin / admin123</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-4">
          SmartStock Academic v1.0.0 · Production MySQL &amp; JWT Verified
        </p>
      </div>
    </div>
  );
};
