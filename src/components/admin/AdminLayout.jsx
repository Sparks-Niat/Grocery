import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ListTree, 
  ShoppingCart, 
  Settings,
  LogOut,
  Menu,
  X,
  Store
} from 'lucide-react';

export default function AdminLayout({ setIsAuthenticated }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName') || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  const websiteNavItems = [
    { name: 'Navigation', path: '/admin/navigation', icon: Menu },
    { name: 'Hero', path: '/admin/hero', icon: LayoutDashboard },
    { name: 'Commitments', path: '/admin/commitments', icon: ListTree },
    { name: 'Gallery', path: '/admin/gallery', icon: Package },
    { name: 'Footer', path: '/admin/footer', icon: Settings },
  ];

  const storeNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: ListTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const NavGroup = ({ title, items }) => (
    <div className="mb-6">
      <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-green-600">
          <Store className="w-6 h-6 text-white mr-2" />
          <span className="text-xl font-bold text-white">Grocery Admin</span>
        </div>
        
        <nav className="p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <NavGroup title="Store" items={storeNavItems} />
          <NavGroup title="Website CMS" items={websiteNavItems} />
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button
              className="text-gray-500 focus:outline-none lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-2xl font-semibold text-gray-800">Admin Portal</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-600 hidden sm:block">
              Welcome, <span className="font-semibold">{adminName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
