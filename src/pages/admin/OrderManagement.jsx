import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'Preparing': 'bg-indigo-100 text-indigo-800',
    'Out for Delivery': 'bg-purple-100 text-purple-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  const availableStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const filteredOrders = orders.filter(o => 
    (filterStatus === 'All' || o.status === filterStatus) &&
    (o.customerName?.toLowerCase().includes(search.toLowerCase()) || 
     o.id.toString().includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by ID or customer..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select 
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {availableStatuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    ₹{order.totalAmount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block text-left group">
                      <button className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                        <ChevronDown className="w-3 h-3 ml-1" />
                      </button>
                      <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                        <div className="py-1">
                          {availableStatuses.map(status => (
                            <button
                              key={status}
                              onClick={() => updateOrderStatus(order.id, status)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredOrders.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
