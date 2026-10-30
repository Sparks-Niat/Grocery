import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, RefreshCw, AlertTriangle, CheckCircle, Search, 
  History, ArrowUpRight, ArrowDownRight, Package
} from 'lucide-react';
import { adminApi } from '../api';

export default function InventoryTab() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [changeAmount, setChangeAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('add'); // 'add' or 'subtract'
  const [reason, setReason] = useState('New stock arrival from distributor');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, inventoryLogs] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getInventoryLogs()
      ]);
      setProducts(prods);
      setLogs(inventoryLogs);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdjustModal = (product) => {
    setAdjustingProduct(product);
    setChangeAmount('10');
    setAdjustmentType('add');
    setReason('New stock arrival from distributor');
    setError('');
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(changeAmount);
    if (!qty || qty <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }

    const delta = adjustmentType === 'add' ? qty : -qty;

    try {
      setSubmitting(true);
      await adminApi.adjustStock(
        adjustingProduct.id,
        delta,
        reason,
        adjustingProduct.packSize
      );
      setAdjustingProduct(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.brand && p.brand.toLowerCase().includes(q))) {
        return false;
      }
    }
    if (stockFilter === 'lowstock') {
      const isLow = p.stock !== undefined && p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);
      if (!isLow) return false;
    }
    if (stockFilter === 'outofstock') {
      if (p.inStock && p.stock > 0) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Stock & Inventory Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track daily incoming stock counts, shortages, and complete audit history
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition"
        >
          <RefreshCw size={14} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Stock Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product stock..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="all">All Items ({products.length})</option>
              <option value="lowstock">Low Stock (≤ 5)</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Pack Unit</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Alert Threshold</th>
                <th className="py-3 px-4 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isOut = !p.inStock || p.stock === 0;
                const isLow = p.stock !== undefined && p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{p.packSize}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">₹{p.price}</td>
                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-full font-bold">
                          0 (Out)
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full font-bold">
                          {p.stock} (Low)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold">
                          {p.stock ?? 25}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      ≤ {p.lowStockThreshold || 5}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openAdjustModal(p)}
                        className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 transition"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h3 className="font-display font-bold text-slate-900 text-base mb-3 flex items-center space-x-2">
          <History size={18} className="text-amber-500" />
          <span>Stock Adjustment History</span>
        </h3>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No stock adjustment entries yet.</p>
        ) : (
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Change</th>
                  <th className="py-2.5 px-3">Before → After</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const isAdd = log.adjustment && log.adjustment.startsWith('+');
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {log.productName}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={`inline-flex items-center space-x-1 ${isAdd ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isAdd ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                          <span>{log.adjustment}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {log.previousStock} → {log.newStock}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {log.reason}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {log.admin}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADJUST STOCK MODAL */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900">
              Adjust Stock: {adjustingProduct.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current recorded stock: <span className="font-bold text-slate-800">{adjustingProduct.stock ?? 0}</span> ({adjustingProduct.packSize})
            </p>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('add')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1 transition ${
                      adjustmentType === 'add'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Plus size={14} />
                    <span>Add Stock</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('subtract')}
                    className={`py-2 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1 transition ${
                      adjustmentType === 'subtract'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Minus size={14} />
                    <span>Reduce Stock</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quantity ({adjustingProduct.packSize}) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={changeAmount}
                  onChange={(e) => setChangeAmount(e.target.value)}
                  placeholder="e.g. 10"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reason for Adjustment *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="New stock arrival from distributor">New stock arrival from distributor</option>
                  <option value="Physical count correction">Physical store count correction</option>
                  <option value="Damaged / Expired goods removal">Damaged / Expired goods removal</option>
                  <option value="Customer return / replenishment">Customer return / replenishment</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Save Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
