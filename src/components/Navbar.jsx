import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBasket, Phone, Clock } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, storeInfo, navigation = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path) => {
    // Map paths like /products to page id 'products', and / to 'home'
    const pageId = path === '/' ? 'home' : path.replace('/', '');
    setActivePage(pageId);
    setIsOpen(false);
    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'py-3 bg-white/95 backdrop-blur-md shadow-md border-b border-primary/10' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavClick('/')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden border border-accent">
              <img 
                src={storeInfo.logo} 
                alt="DailyMart Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to Icon if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span className="hidden justify-center items-center text-white" style={{ display: 'none' }}>
                <ShoppingBasket size={20} className="text-accent" />
              </span>
            </div>
            <div>
              <span className="font-display font-bold text-lg md:text-xl text-primary block leading-none">
                {storeInfo.businessName || 'DailyMart'}
              </span>
              <span className="text-[10px] text-secondary font-medium tracking-widest uppercase">
                General Store
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((link) => {
              const pageId = link.path === '/' ? 'home' : link.path.replace('/', '');
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors duration-200 ${
                    activePage === pageId
                      ? 'text-primary bg-primary/5 font-semibold'
                      : 'text-charcoal/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Visit CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href="#store-location" 
              onClick={(e) => {
                e.preventDefault();
                setActivePage('contact');
                setTimeout(() => {
                  const el = document.getElementById('store-location');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-primary hover:bg-primary-dark text-cream font-semibold text-sm shadow-sm hover:shadow transition-all duration-200"
            >
              <Phone size={14} className="text-accent" />
              <span>Visit Store</span>
            </a>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-primary/5 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-charcoal-dark/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Drawer Content */}
      <div className={`md:hidden fixed top-0 right-0 bottom-0 z-50 w-64 bg-cream shadow-2xl border-l border-cream-dark/50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-center justify-between pb-6 border-b border-cream-dark">
            <div className="flex items-center space-x-2">
              <ShoppingBasket className="text-primary" size={24} />
              <span className="font-display font-bold text-primary">DailyMart</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-cream-dark"
            >
              <X size={20} className="text-charcoal" />
            </button>
          </div>

          <div className="flex-1 py-6 space-y-2">
            {navigation.map((link) => {
              const pageId = link.path === '/' ? 'home' : link.path.replace('/', '');
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.path)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activePage === pageId
                      ? 'text-primary bg-primary/5 font-semibold'
                      : 'text-charcoal/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-6 border-t border-cream-dark space-y-4">
            <div className="flex items-center space-x-3 text-xs text-charcoal/70">
              <Clock size={14} className="text-secondary" />
              <span>7:00 AM - 9:30 PM Everyday</span>
            </div>
            <a 
              href={`tel:${storeInfo.phone}`}
              className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-xl bg-primary text-cream font-semibold text-sm shadow hover:bg-primary-dark transition-colors"
            >
              <Phone size={14} className="text-accent" />
              <span>Call DailyMart</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
