import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { adminApi } from '../api';

export default function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('flat');
  const [discountValue, setDiscountValue] = useState('50');
  const [minOrderValue, setMinOrderValue] = useState('300');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code.trim() || !discountValue) {
      setError('Coupon code and discount value are required.');
      return;
    }

    try {
      setSubmitting(true);
      await adminApi.createCoupon({
        code,
        discountType,
        discountValue,
        minOrderValue,
        expiryDate
      });
      setIsModalOpen(false);
      setCode('');
      loadCoupons();
    } catch (err) {
      setError(err.message || 'Failed to create coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await adminApi.deleteCoupon(id);
      loadCoupons();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Offers & Coupons</span>
            <span className="text-sm font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {coupons.length} Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure promotional discount codes for festival sales and local customers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus size={15} />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                  {c.code}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
              </p>
              <p className="text-xs text-slate-500">
                Min. order: ₹{c.minOrderValue} • Valid till {c.expiryDate}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 p-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">
              Create Promotional Coupon
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DIWALI100"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold uppercase focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="flat">Flat ₹ (INR)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Value *</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="e.g. 50"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="e.g. 300"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
