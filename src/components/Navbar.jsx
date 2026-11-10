import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Phone, Clock, Shield, Home, 
  ShoppingBag, Info, Image, MapPin, ChevronRight 
} from 'lucide-react';
import { storeInfo as defaultStoreInfo } from '../data/store';
import { useStore } from '../context/StoreContext';

export default function Navbar({ activePage, setActivePage, onOpenAdmin }) {
  const { storeInfo: liveStoreInfo } = useStore();
  const storeInfo = liveStoreInfo || defaultStoreInfo;
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to adjust navbar appearance
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

  // Prevent background scrolling and handle Escape key when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  // Auto-close mobile menu if viewport resized to desktop breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'about', label: 'About', icon: Info },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'contact', label: 'Contact', icon: MapPin }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setIsOpen(false);
    // Smooth scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVisitStoreClick = (e) => {
    e.preventDefault();
    setActivePage('contact');
    setIsOpen(false);
    setTimeout(() => {
      const el = document.getElementById('store-location');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <nav 
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-cream-dark/80 py-2.5 sm:py-3' 
            : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-cream-dark/60 py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo & Brand Name */}
            <div 
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-3 cursor-pointer select-none group"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNavClick('home'); }}
              aria-label={`${storeInfo.name} - Home`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                <img 
                  src={storeInfo.logo} 
                  alt={`${storeInfo.name} Official Logo`} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/grocery.jpg';
                  }}
                />
              </div>
              <div className="text-left">
                <span className="font-display font-bold text-base sm:text-lg md:text-xl text-primary block leading-none">
                  {storeInfo.shortName}
                </span>
                <span className="text-[10px] text-secondary font-bold tracking-wider uppercase mt-1 block">
                  General Store
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors duration-200 ${
                    activePage === link.id
                      ? 'text-primary bg-primary/10 font-bold shadow-sm'
                      : 'text-charcoal/80 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop Visit CTA & Admin Portal Shortcut */}
            <div className="hidden md:flex items-center space-x-3">
              <a 
                href="#store-location" 
                onClick={handleVisitStoreClick}
                className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-primary hover:bg-primary-dark text-cream font-semibold text-sm shadow-sm hover:shadow transition-all duration-200"
              >
                <Phone size={14} className="text-accent" />
                <span>Visit Store</span>
              </a>

              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="p-2 rounded-full text-charcoal/50 hover:text-primary hover:bg-primary/5 transition"
                  title="Admin Portal"
                  aria-label="Admin Portal"
                >
                  <Shield size={16} />
                </button>
              )}
            </div>

            {/* Mobile Header Buttons */}
            <div className="flex md:hidden items-center space-x-2">
              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="p-2 rounded-lg text-charcoal/60 hover:text-primary hover:bg-cream-dark transition"
                  title="Admin Portal"
                  aria-label="Admin Portal"
                >
                  <Shield size={20} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 active:scale-95 transition focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-navigation-drawer"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer Backdrop (Solid Overlay) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[99] bg-charcoal-dark/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer (Pure Solid White Background, High Z-Index) */}
      <div 
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`md:hidden fixed top-0 right-0 bottom-0 z-[100] w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/5 p-1 border border-primary/10 flex items-center justify-center shrink-0">
              <img 
                src={storeInfo.logo} 
                alt={`${storeInfo.name} Logo`} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/grocery.jpg';
                }}
              />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-primary text-sm sm:text-base block leading-tight">
                {storeInfo.shortName}
              </span>
              <span className="text-[10px] text-secondary font-bold tracking-wider uppercase block mt-0.5">
                General Store
              </span>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-charcoal/70 hover:text-charcoal hover:bg-slate-100 active:scale-95 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Close navigation menu"
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-1.5 bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal/50 px-3 pb-2">
            Navigation Menu
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activePage === link.id;

            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-charcoal/85 hover:text-primary hover:bg-primary/5 active:bg-primary/10'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon 
                    size={19} 
                    className={isActive ? 'text-accent' : 'text-primary/70'} 
                  />
                  <span>{link.label}</span>
                </div>
                {isActive ? (
                  <span className="w-2 h-2 rounded-full bg-accent" />
                ) : (
                  <ChevronRight size={16} className="text-charcoal/30" />
                )}
              </button>
            );
          })}

          <div className="pt-4 pb-2">
            <div className="border-t border-slate-100" />
          </div>

          {/* Quick Store Info inside Drawer */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-left">
            <div className="flex items-center space-x-2.5 text-xs text-charcoal/80 font-medium">
              <Clock size={15} className="text-secondary shrink-0" />
              <span>7:00 AM – 9:30 PM Everyday</span>
            </div>
            <div className="flex items-start space-x-2.5 text-xs text-charcoal/80 font-medium">
              <MapPin size={15} className="text-accent shrink-0 mt-0.5" />
              <span className="leading-snug">{storeInfo.address}</span>
            </div>
          </div>
        </div>

        {/* Drawer Action Buttons & Footer */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2.5 shrink-0">
          <a 
            href={storeInfo.callUrl || "tel:9542670795"}
            className="w-full inline-flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow hover:bg-primary-dark transition-colors"
          >
            <Phone size={16} className="text-accent" />
            <span>Call {storeInfo.shortName}</span>
          </a>

          {onOpenAdmin && (
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAdmin();
              }}
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-charcoal/70 hover:text-primary hover:bg-slate-50 transition-colors"
            >
              <Shield size={14} className="text-amber-500" />
              <span>Admin Portal Login</span>
            </button>
          )}

          <div className="text-center pt-1 text-[11px] text-charcoal/50">
            &copy; {new Date().getFullYear()} {storeInfo.shortName}
          </div>
        </div>
      </div>
    </>
  );
}
