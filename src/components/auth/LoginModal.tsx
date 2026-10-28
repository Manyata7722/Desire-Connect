import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { DesireLogo } from '../common/DesireLogo';
import { X, Lock, User, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, setCurrentView } = useTickets();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !password.trim()) {
      setError('Please enter User ID and Password.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const res = login(employeeId.trim(), password.trim());
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed.');
      } else {
        setEmployeeId('');
        setPassword('');
        setError('');
      }
    }, 120);
  };

  const handleAdminDirectLogin = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      login('admin', 'admin');
      setLoading(false);
      setCurrentView('admin_employees'); // Direct to User Master!
    }, 100);
  };

  const handleQuickFill = (id: string, pass: string) => {
    setEmployeeId(id);
    setPassword(pass);
    setError('');
  };

  return (
    <div 
      className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 overflow-hidden touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsAuthModalOpen(false);
          setError('');
        }
      }}
    >
      {/* 100% Fixed in one screen for mobile - ZERO scrollers */}
      <div className="bg-white rounded-2xl w-full max-w-xs sm:max-w-sm border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DesireLogo size="sm" showSubtitle={false} />
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                System Sign In
              </h2>
              <span className="text-[10px] text-slate-500 font-medium">
                Desire Connect
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setError('');
            }}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Form - No inner scrolling */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 text-xs text-rose-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {/* Quick 1-Click Button for Admin / User Master */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between">
            <div className="pr-2">
              <span className="text-xs font-bold text-emerald-950 block">Admin Access</span>
              <span className="text-[10px] text-emerald-700">Manage User Master & rights</span>
            </div>
            <button
              type="button"
              onClick={handleAdminDirectLogin}
              className="px-2.5 py-1.5 text-[11px] font-bold text-white bg-[#0A5C36] hover:bg-[#08482b] rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enter Admin</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-800 mb-1">
              User ID <span className="text-slate-500 font-normal">(e.g. 1756 or admin)</span>
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setError('');
                }}
                placeholder="e.g. 1756 or admin"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0A5C36] font-mono"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-800 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0A5C36]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 mt-1"
          >
            <span>{loading ? 'Signing in...' : 'Sign In as Employee / Admin'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Quick Click Badges: 1756 format */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-500 block mb-1">
              Quick Test Credentials:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('1001', 'password123')}
                className="px-1.5 py-1 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-900 rounded border border-blue-200 font-mono font-bold transition-colors text-center cursor-pointer"
                title="Rahul Sharma - Normal Staff (Raise & Track only)"
              >
                1001 (User)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('1756', 'password123')}
                className="px-1.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200 font-mono transition-colors text-center cursor-pointer"
                title="Manyata Shekhar - IT Department Staff"
              >
                1756 (IT)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin')}
                className="px-1.5 py-1 text-[10px] bg-emerald-50 hover:bg-emerald-100 text-[#0A5C36] rounded border border-emerald-200 font-mono font-bold transition-colors text-center cursor-pointer"
                title="Central Administrator"
              >
                admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
