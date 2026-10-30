import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, MapPin, ShoppingBag } from 'lucide-react';
import { adminApi } from '../api';

export default function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getCustomers({ search: search.trim() || undefined });
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Customer Directory</span>
            <span className="text-sm font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {customers.length}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered customer contact information and order history
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer by name or phone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Users size={32} className="mx-auto mb-2 text-slate-300" />
            <p>No customer profiles recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Delivery Address</th>
                  <th className="py-3 px-4 text-center">Orders Placed</th>
                  <th className="py-3 px-4">Last Order</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 text-slate-700 flex items-center space-x-1">
                      <Phone size={12} className="text-slate-400" />
                      <span>{c.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{c.address || 'In-store customer'}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{c.totalOrders ?? 1}</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        {c.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
