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
import { useStoreData } from './hooks/useStoreData';

export default function App() {
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+/, '').split('/')[0];
      const validPages = ['products', 'about', 'gallery', 'contact'];
      if (validPages.includes(path)) return path;
    }
    return 'home';
  };

  const [activePage, setActivePage] = useState(getInitialPage);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handlePageChange = (page) => {
    setActivePage(page);
    const targetPath = page === 'home' ? '/' : `/${page}`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const { 
    categories, products, settings, loading,
    navigation, heroTags, commitments, gallery, footerLinks, socialLinks 
  } = useStoreData();

  const renderPage = () => {
    if (loading) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    
    switch (activePage) {
      case 'home':
        return (
          <Home 
            setActivePage={handlePageChange} 
            onCategorySelect={setSelectedCategory} 
            categories={categories}
            products={products}
            storeInfo={settings}
            heroTags={heroTags}
            commitments={commitments}
            gallery={gallery}
          />
        );
      case 'products':
        return (
          <Products 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            categories={categories}
            products={products}
            storeInfo={settings}
          />
        );
      case 'about':
        return <About storeInfo={settings} />;
      case 'gallery':
        return <Gallery storeInfo={settings} gallery={gallery} />;
      case 'contact':
        return <Contact storeInfo={settings} />;
      default:
        return (
          <Home 
            setActivePage={handlePageChange} 
            onCategorySelect={setSelectedCategory} 
            categories={categories}
            products={products}
            storeInfo={settings}
            heroTags={heroTags}
            commitments={commitments}
            gallery={gallery}
          />
        );
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-cream">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream selection:bg-primary/10 selection:text-primary">
      {/* Premium Sticky Navigation Bar */}
      <Navbar activePage={activePage} setActivePage={handlePageChange} storeInfo={settings} navigation={navigation} />

      {/* Main Content Layout */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Premium Shared Footer */}
      <Footer setActivePage={handlePageChange} storeInfo={settings} categories={categories} footerLinks={footerLinks} socialLinks={socialLinks} />

      {/* Floating Desktop WhatsApp Button */}
      <WhatsAppButton storeInfo={settings} />

      {/* Mobile Sticky Quick Action Bar */}
      <MobileBottomBar storeInfo={settings} />
    </div>
  );
}
