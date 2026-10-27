import React, { useState } from 'react';
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
  const [activePage, setActivePage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
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
            setActivePage={setActivePage} 
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
            setActivePage={setActivePage} 
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
      <Navbar activePage={activePage} setActivePage={setActivePage} storeInfo={settings} navigation={navigation} />

      {/* Main Content Layout */}
      <main className="flex-grow">
        {renderPage()}
      </main>

      {/* Premium Shared Footer */}
      <Footer setActivePage={setActivePage} storeInfo={settings} categories={categories} footerLinks={footerLinks} socialLinks={socialLinks} />

      {/* Floating Desktop WhatsApp Button */}
      <WhatsAppButton storeInfo={settings} />

      {/* Mobile Sticky Quick Action Bar */}
      <MobileBottomBar storeInfo={settings} />
    </div>
  );
}
