import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { adminApi } from './api';
import { storeInfo } from '../data/store';

export default function AdminLogin({ onLoginSuccess, onBackToStore }) {
  const [email, setEmail] = useState('joelramireddy@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await adminApi.login(email.trim(), password);
      if (res.token) {
        onLoginSuccess(res.admin);
      }
    } catch (err) {
      setError(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Return to customer website button */}
      <div className="w-full max-w-md mb-6 z-10 flex justify-between items-center">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Storefront</span>
        </button>

        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Secure Portal
        </span>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Store Logo & Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative flex items-center justify-center">
            <img
              src="/images/logo.png"
              alt="Sri Manikanta Sai Logo"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            Sri Manikanta Sai
          </h1>
          <p className="text-xs font-medium text-amber-400/90 tracking-wider uppercase mt-0.5">
            Admin & Management Dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-start space-x-3 text-rose-300 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Log In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-center space-x-2 text-xs text-slate-400">
          <Lock size={12} className="text-emerald-400" />
          <span>Server-side hashed JWT token security</span>
        </div>
      </div>
    </div>
  );
}
