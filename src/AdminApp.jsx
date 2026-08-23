import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import SettingsEditor from './pages/admin/SettingsEditor';
import NavigationEditor from './pages/admin/NavigationEditor';
import HeroEditor from './pages/admin/HeroEditor';
import CommitmentsEditor from './pages/admin/CommitmentsEditor';
import GalleryEditor from './pages/admin/GalleryEditor';
import FooterEditor from './pages/admin/FooterEditor';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token on load
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/admin" /> : <AdminLogin setIsAuthenticated={setIsAuthenticated} />
        } 
      />
      
      {/* Protected Routes inside Layout */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <AdminLayout setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/admin/login" />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="settings" element={<SettingsEditor />} />
        
        <Route path="navigation" element={<NavigationEditor />} />
        <Route path="hero" element={<HeroEditor />} />
        <Route path="commitments" element={<CommitmentsEditor />} />
        <Route path="gallery" element={<GalleryEditor />} />
        <Route path="footer" element={<FooterEditor />} />
      </Route>
    </Routes>
  );
}
