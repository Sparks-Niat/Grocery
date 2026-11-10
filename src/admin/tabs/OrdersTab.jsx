import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, Printer, CheckCircle, Clock, 
  XCircle, Truck, PackageCheck, AlertCircle, Eye, Phone, MapPin
} from 'lucide-react';
import { adminApi } from '../api';
import { storeInfo } from '../../data/store';

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      let cancelReason = '';
      if (newStatus === 'Cancelled') {
        cancelReason = prompt('Please enter the cancellation reason:') || 'Customer requested cancellation';
      }

      await adminApi.updateOrderStatus(orderId, newStatus, undefined, cancelReason);
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Pending</span>;
      case 'Confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">Confirmed</span>;
      case 'Preparing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">Preparing</span>;
      case 'Ready for Delivery':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">Ready</span>;
      case 'Out for Delivery':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">Out for Delivery</span>;
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Completed</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Customer Orders</span>
            <span className="text-sm font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {orders.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process daily kirana delivery orders, manage packing, and print store bills
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, customer phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:border-amber-400 focus:outline-none"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready for Delivery">Ready for Delivery</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <ShoppingBag size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">No orders found</p>
            <p className="text-slate-400 mt-0.5">Orders placed by customers will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{o.id}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(o.orderDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{o.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                        <Phone size={10} />
                        <span>{o.customerPhone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {o.items.length} item(s)
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      ₹{o.total}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{o.paymentMethod}</div>
                      <div className="text-[10px] text-slate-400">{o.paymentStatus}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(o.orderStatus)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setIsReceiptOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                          title="View & Print Bill"
                        >
                          <Printer size={16} />
                        </button>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className="bg-slate-100 hover:bg-slate-200 border-0 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready for Delivery">Ready</option>
                          <option value="Out for Delivery">Out</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRINT RECEIPT / INVOICE MODAL */}
      {isReceiptOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-extrabold text-base text-slate-900">
                  Sri Manikanta Sai General Store
                </h3>
                <p className="text-[11px] text-slate-500">
                  {storeInfo.address} • Phone: {storeInfo.phoneDisplay || storeInfo.phone}
                </p>
              </div>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Bill Details */}
            <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-800">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="text-slate-700">{new Date(selectedOrder.orderDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{selectedOrder.customerName} ({selectedOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Address:</span>
                <span className="text-slate-700">{selectedOrder.deliveryAddress}</span>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Price</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-medium text-slate-800">{it.name}</td>
                      <td className="p-2 text-center text-slate-600">{it.quantity}</td>
                      <td className="p-2 text-right text-slate-600">₹{it.price}</td>
                      <td className="p-2 text-right font-bold text-slate-900">₹{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 text-xs text-right pr-2">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Charge:</span>
                <span>₹{selectedOrder.deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-primary font-display">₹{selectedOrder.total}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5"
              >
                <Printer size={14} />
                <span>Print Bill</span>
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
