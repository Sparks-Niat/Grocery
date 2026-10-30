import React, { useState, useEffect } from 'react';
import { 
  Package, CheckCircle2, XCircle, AlertTriangle, Layers, 
  ShoppingBag, IndianRupee, ArrowRight, Plus, RefreshCw,
  TrendingUp, Clock, AlertCircle
} from 'lucide-react';
import { adminApi } from '../api';

export default function DashboardOverview({ onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [unverifiedProducts, setUnverifiedProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, productsData, ordersData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getProducts(),
        adminApi.getOrders()
      ]);

      setStats(statsData);
      
      const low = productsData.filter(p => p.stock !== undefined && p.stock <= (p.lowStockThreshold || 5));
      setLowStockProducts(low.slice(0, 6));

      const unverified = productsData.filter(p => p.priceNote === 'provisional');
      setUnverifiedProducts(unverified.slice(0, 6));

      setRecentOrders(ordersData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Store Overview
          </h1>
          <p className="text-sm text-slate-500">
            Real-time live inventory, orders, and catalog status for Sri Manikanta Sai General Store
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-amber-600' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => onNavigateTab('products', { openAddModal: true })}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {/* Total Products */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Package size={20} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-display">
              {stats?.totalProducts ?? 91}
            </span>
            <span className="text-xs font-medium text-emerald-600 font-sans">
              in catalog
            </span>
          </div>
        </div>

        {/* Available in Stock */}
        <div 
          onClick={() => onNavigateTab('products', { filter: 'instock' })}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">In Stock</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-display">
              {stats?.inStockCount ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">
              ready for sale
            </span>
          </div>
        </div>

        {/* Low or Out of Stock */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Low / Out of Stock</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-600 font-display">
              {(stats?.outOfStockCount || 0) + (stats?.lowStockCount || 0)}
            </span>
            <span className="text-xs font-medium text-rose-600">
              items need restock
            </span>
          </div>
        </div>

        {/* Needs Price Confirmation */}
        <div 
          onClick={() => onNavigateTab('products', { filter: 'provisional' })}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Est. Price Review</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-600 font-display">
              {stats?.unverifiedPriceCount ?? 0}
            </span>
            <span className="text-xs font-medium text-slate-500">
              owner to verify
            </span>
          </div>
        </div>
      </div>

      {/* Second Row KPI Cards: Categories & Orders & Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
        <div 
          onClick={() => onNavigateTab('categories')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition cursor-pointer"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Categories</p>
            <p className="text-2xl font-extrabold text-slate-900 font-display">{stats?.totalCategories ?? 14}</p>
            <p className="text-xs text-slate-500 mt-0.5">Covering all kirana staples</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Layers size={24} />
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition cursor-pointer"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Orders</p>
            <p className="text-2xl font-extrabold text-slate-900 font-display">{stats?.totalOrders ?? 0}</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">
              {stats?.pendingOrders ? `${stats.pendingOrders} pending confirmation` : 'All up to date'}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Verified Sales Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900 font-display">₹{stats?.totalRevenue ?? 0}</p>
            <p className="text-xs text-slate-500 mt-0.5">From completed store orders</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <IndianRupee size={24} />
          </div>
        </div>
      </div>

      {/* Dual Section: Low Stock Warning & Price Verification Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Warning Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={18} className="text-rose-500" />
              <h2 className="font-display font-bold text-slate-900 text-base sm:text-lg">
                Low Stock Alert
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
            >
              <span>Manage Stock</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500/60" />
              All items currently have healthy stock levels.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={p.image}
                      alt=""
                      className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.packSize} • ₹{p.price}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full">
                      {p.stock ?? 0} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Provisional Price Queue Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle size={18} className="text-amber-500" />
              <h2 className="font-display font-bold text-slate-900 text-base sm:text-lg">
                Price Confirmation Queue
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('products', { filter: 'provisional' })}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {unverifiedProducts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500/60" />
              All product prices are verified.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {unverifiedProducts.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={p.image}
                      alt=""
                      className="w-10 h-10 object-contain rounded-lg bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                      <p className="text-xs text-amber-600 font-medium">Estimated: ₹{p.price} ({p.packSize})</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('products', { editProductId: p.id })}
                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg transition"
                  >
                    Edit Price
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Bar for kirana store owner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-lg text-amber-400">
            Quick Store Management
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Update prices, adjust daily incoming stock, add new local items, or manage customer delivery requests directly from this panel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab('products', { openAddModal: true })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            + Add Kirana Item
          </button>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition"
          >
            Adjust Stock
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition"
          >
            Check Orders
          </button>
          <button
            onClick={() => onNavigateTab('settings')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition"
          >
            Store Settings
          </button>
        </div>
      </div>
    </div>
  );
}
