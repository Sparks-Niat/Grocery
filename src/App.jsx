import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import MobileBottomBar from './components/MobileBottomBar';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import { authStorage, adminApi } from './admin/api';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Admin routing state
  const getAdminSubroute = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path.startsWith('/admin/dashboard') || hash === '#admin/dashboard') return 'dashboard';
    if (path.startsWith('/admin/login') || hash === '#admin/login') return 'login';
    if (path.startsWith('/admin') || hash === '#admin') return 'dashboard'; // default /admin directs to dashboard or login
    return null;
  };

  const [adminRoute, setAdminRoute] = useState(getAdminSubroute());
  const [adminUser, setAdminUser] = useState(authStorage.getUser());

  // Listen to browser forward/back buttons & URL hash changes
  useEffect(() => {
    const handlePopState = () => {
      setAdminRoute(getAdminSubroute());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    const handleAuthChange = () => {
      setAdminUser(authStorage.getUser());
    };
    window.addEventListener('sms_admin_auth_changed', handleAuthChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('sms_admin_auth_changed', handleAuthChange);
    };
  }, []);

  // Verify token on mount if in admin route
  useEffect(() => {
    if (adminRoute && authStorage.getToken()) {
      adminApi.verify()
        .then(res => {
          if (res.user) {
            setAdminUser(res.user);
            authStorage.setUser(res.user);
          }
        })
        .catch(() => {
          authStorage.removeToken();
          setAdminUser(null);
        });
    }
  }, [adminRoute]);

  const handleOpenAdmin = () => {
    // If logged in, go directly to /admin/dashboard, otherwise go to /admin/login
    if (adminUser && authStorage.getToken()) {
      setAdminRoute('dashboard');
      window.history.pushState({}, '', '/admin/dashboard');
    } else {
      setAdminRoute('login');
      window.history.pushState({}, '', '/admin/login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStore = () => {
    setAdminRoute(null);
    window.history.pushState({}, '', '/');
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (user) => {
    setAdminUser(user);
    authStorage.setUser(user);
    // Redirect to /admin/dashboard on successful login
    setAdminRoute('dashboard');
    window.history.pushState({}, '', '/admin/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    authStorage.removeToken();
    setAdminUser(null);
    setAdminRoute('login');
    window.history.pushState({}, '', '/admin/login');
  };

  // If in Admin portal:
  if (adminRoute) {
    const isAuthenticated = Boolean(adminUser && authStorage.getToken());

    // If authenticated and user navigates to /admin/login, redirect to /admin/dashboard
    if (isAuthenticated && adminRoute === 'login') {
      window.history.replaceState({}, '', '/admin/dashboard');
      return (
        <AdminLayout
          user={adminUser}
          onLogout={handleAdminLogout}
          onBackToStore={handleBackToStore}
        />
      );
    }

    // If unauthenticated and trying to open dashboard or login, show login page
    if (!isAuthenticated) {
      if (adminRoute === 'dashboard') {
        window.history.replaceState({}, '', '/admin/login');
      }
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onBackToStore={handleBackToStore}
        />
      );
    }

    // Authenticated dashboard
    return (
      <AdminLayout
        user={adminUser}
        onLogout={handleAdminLogout}
        onBackToStore={handleBackToStore}
      />
    );
  }

  // Customer-facing website layout:
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return (
          <Home 
            setActivePage={setActivePage} 
            onCategorySelect={setSelectedCategory} 
          />
        );
      case 'products':
        return (
          <Products 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />
        );
      case 'about':
        return <About />;
      case 'gallery':
        return <Gallery />;
      case 'contact':
        return <Contact />;
      default:
        return (
          <Home 
            setActivePage={setActivePage} 
            onCategorySelect={setSelectedCategory} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cream selection:bg-primary/10 selection:text-primary">
      {/* Global Brand Watermark — fixed behind all content, visible while scrolling */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src="/images/logo.png"
          alt=""
          style={{
            width: '520px',
            maxWidth: '70vw',
            opacity: 0.06,
            objectFit: 'contain',
            userSelect: 'none',
            WebkitUserDrag: 'none',
          }}
        />
      </div>

      {/* Sticky Navigation Bar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} onOpenAdmin={handleOpenAdmin} />

      {/* Main Content Layout */}
      <main className="flex-grow relative" style={{ zIndex: 1 }}>
        {renderPage()}
      </main>

      {/* Shared Footer with Admin link */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Footer setActivePage={setActivePage} onOpenAdmin={handleOpenAdmin} />
      </div>

      {/* Floating Desktop WhatsApp Button */}
      <WhatsAppButton />

      {/* Mobile Sticky Quick Action Bar */}
      <MobileBottomBar />
    </div>
  );
}
