import React, { useState, useEffect } from 'react';
import { Shield, Clock, Search, RefreshCw, FileText } from 'lucide-react';
import { adminApi } from '../api';

export default function ActivityLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.details && l.details.toLowerCase().includes(q)) ||
      (l.admin && l.admin.toLowerCase().includes(q))
    );
  });

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('CREATED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('DELETED')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (action.includes('PRICE')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action.includes('STOCK')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Admin Activity Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all product changes, price adjustments, inventory updates, and logins
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition"
        >
          <RefreshCw size={14} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, details, admin email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <FileText size={32} className="mx-auto mb-2 text-slate-300" />
            <p>No activity logs recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Administrator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {log.admin}
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
