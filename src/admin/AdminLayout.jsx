import React, { useState } from 'react';
import { 
  LayoutDashboard, Package, Layers, TrendingUp, ShoppingBag, 
  Users, Tag, Settings, FileText, LogOut, ExternalLink, 
  Menu, X, Shield, Bell, ChevronRight
} from 'lucide-react';
import { authStorage } from './api';
import DashboardOverview from './tabs/DashboardOverview';
import ProductsTab from './tabs/ProductsTab';
import CategoriesTab from './tabs/CategoriesTab';
import InventoryTab from './tabs/InventoryTab';
import OrdersTab from './tabs/OrdersTab';
import CustomersTab from './tabs/CustomersTab';
import CouponsTab from './tabs/CouponsTab';
import SettingsTab from './tabs/SettingsTab';
import ActivityLogsTab from './tabs/ActivityLogsTab';

export default function AdminLayout({ user, onLogout, onBackToStore }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Navigation options passed between tabs
  const [tabOptions, setTabOptions] = useState({});

  const handleNavigateTab = (tabName, options = {}) => {
    setTabOptions(options);
    setActiveTab(tabName);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products (91)', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'inventory', label: 'Stock & Inventory', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Offers & Coupons', icon: Tag },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'logs', label: 'Audit Logs', icon: FileText }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onNavigateTab={handleNavigateTab} />;
      case 'products':
        return (
          <ProductsTab 
            initialFilter={tabOptions.filter} 
            initialEditId={tabOptions.editProductId}
            initialOpenAdd={tabOptions.openAddModal}
          />
        );
      case 'categories':
        return <CategoriesTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'orders':
        return <OrdersTab />;
      case 'customers':
        return <CustomersTab />;
      case 'coupons':
        return <CouponsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'logs':
        return <ActivityLogsTab />;
      default:
        return <DashboardOverview onNavigateTab={handleNavigateTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0 z-30 fixed inset-y-0 left-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 p-1 flex items-center justify-center shrink-0">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-white text-sm truncate">
              Sri Manikanta Sai
            </h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigateTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={17} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-slate-950" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Storefront & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink size={15} />
              <span>View Storefront</span>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="font-display font-extrabold text-base sm:text-lg text-slate-900 capitalize hidden sm:block">
              {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToStore}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-white transition"
            >
              <ExternalLink size={13} />
              <span>Customer Website</span>
            </button>

            {/* Profile badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xs">
                J
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || 'Joel Rami Reddy'}
                </div>
                <div className="text-[10px] text-slate-500 leading-none">
                  {user?.email || 'joelramireddy@gmail.com'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs flex">
            <div className="w-64 bg-slate-900 text-slate-300 h-full flex flex-col p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <img src="/images/logo.png" alt="" className="w-9 h-9 object-contain" />
                  <span className="font-display font-bold text-white text-sm">Sri Manikanta Sai</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigateTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={onBackToStore}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  <ExternalLink size={14} />
                  <span>View Customer Website</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Tab Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
