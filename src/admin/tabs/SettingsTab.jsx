import React, { useState, useEffect } from 'react';
import { 
  Store, Phone, MessageSquare, MapPin, Clock, DollarSign, 
  ShieldCheck, Check, AlertCircle, Save, Lock
} from 'lucide-react';
import { adminApi, authStorage } from '../api';

export default function SettingsTab() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      setSaving(true);
      await adminApi.updateSettings(settings);
      setSuccessMsg('Store settings updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdError('');

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    try {
      setChangingPwd(true);
      await adminApi.changePassword(currentPassword, newPassword);
      setPwdMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdMsg(''), 4000);
    } catch (err) {
      setPwdError(err.message || 'Failed to update password.');
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const currentUser = authStorage.getUser();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Store Settings & Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage Sri Manikanta Sai General Store profile, contact numbers, timings, and delivery policies
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
          <Check size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSettingsSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        {/* Brand & Logo Preview */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100">
          <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0">
            <img
              src="/images/logo.png"
              alt="Official Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">
              Official Store Brand Logo
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Active circular emblem featuring Lord Ganesha with "SRI MANIKANTA SAI". This official logo is currently applied to the store header, watermark, and invoice receipts.
            </p>
            <div className="mt-2 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block border border-emerald-200">
              Verified & Active Asset: /images/logo.png
            </div>
          </div>
        </div>

        {/* Store Name & Tagline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Store Name *</label>
            <input
              type="text"
              value={settings.name || ''}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tagline</label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Phone & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
            <input
              type="text"
              value={settings.phone || ''}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">WhatsApp Number *</label>
            <input
              type="text"
              value={settings.whatsapp || ''}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Store Physical Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Store Address *</label>
          <textarea
            rows="2"
            value={settings.address || ''}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
          />
        </div>

        {/* Minimum Order, Delivery Charge, Free Delivery */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Min. Order Value (₹)</label>
            <input
              type="number"
              value={settings.minOrderValue ?? 200}
              onChange={(e) => setSettings({ ...settings, minOrderValue: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Charge (₹)</label>
            <input
              type="number"
              value={settings.deliveryCharge ?? 20}
              onChange={(e) => setSettings({ ...settings, deliveryCharge: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Free Delivery Above (₹)</label>
            <input
              type="number"
              value={settings.freeDeliveryThreshold ?? 500}
              onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50 flex items-center space-x-1.5"
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Security & Password Change */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <ShieldCheck size={20} className="text-amber-500" />
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">
              Admin Account & Security
            </h3>
            <p className="text-xs text-slate-500">
              Logged in as <span className="font-bold text-slate-800">{currentUser?.email || 'joelramireddy@gmail.com'}</span>
            </p>
          </div>
        </div>

        {pwdMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs">
            {pwdMsg}
          </div>
        )}

        {pwdError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
            {pwdError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Password *</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm New *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPwd}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            {changingPwd ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
