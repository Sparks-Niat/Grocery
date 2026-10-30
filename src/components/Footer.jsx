import React from 'react';
import { ShoppingBasket, Phone, MessageSquare, MapPin, Clock, ArrowUp, Shield } from 'lucide-react';
import { storeInfo } from '../data/store';
import { categories } from '../data/categories';

export default function Footer({ setActivePage, onOpenAdmin }) {
  const handleLinkClick = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-cream-light/80 pt-16 pb-20 sm:pb-8 border-t border-charcoal-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div 
              onClick={() => handleLinkClick('home')}
              className="flex items-center space-x-3 cursor-pointer select-none"
            >
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <img 
                  src={storeInfo.logo} 
                  alt={`${storeInfo.name} Logo`} 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-display font-bold text-base sm:text-lg text-white block leading-none">
                  {storeInfo.shortName}
                </span>
                <span className="text-[10px] text-accent font-medium tracking-widest uppercase">
                  General Store
                </span>
              </div>
            </div>
            <p className="text-sm text-cream-light/60 leading-relaxed">
              Discover your daily essentials at your trusted local neighborhood store. Convenient, welcoming, and fully stocked for Nandigama families.
            </p>
            <div className="pt-2 flex items-center space-x-3">
              <a 
                href={`tel:${storeInfo.phone}`}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Call Store"
              >
                <Phone size={14} />
              </a>
              <a 
                href={`https://wa.me/${storeInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(storeInfo.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors"
                aria-label="Message on WhatsApp"
              >
                <MessageSquare size={14} />
              </a>
              <a 
                href={storeInfo.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Find on Google Maps"
              >
                <MapPin size={14} />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-6">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => handleLinkClick('home')} 
                  className="hover:text-accent transition-colors"
                >
                  Home Showcase
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('products')} 
                  className="hover:text-accent transition-colors"
                >
                  Everyday Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('about')} 
                  className="hover:text-accent transition-colors"
                >
                  About Our Store
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('gallery')} 
                  className="hover:text-accent transition-colors"
                >
                  Store Gallery
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleLinkClick('contact')} 
                  className="hover:text-accent transition-colors"
                >
                  Contact & Directions
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-6">
              Aisles & Departments
            </h4>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => {
                      handleLinkClick('products');
                      window.dispatchEvent(new CustomEvent('filter-category', { detail: category.id }));
                    }}
                    className="hover:text-accent transition-colors"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Store Details Col */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-6">
              Store Info
            </h4>
            <div className="flex items-start space-x-3 text-sm">
              <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
              <span>{storeInfo.address}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Phone size={16} className="text-accent shrink-0" />
              <a href={`tel:${storeInfo.phone}`} className="hover:underline">{storeInfo.phone}</a>
            </div>
            <div className="flex items-start space-x-3 text-sm">
              <Clock size={16} className="text-accent shrink-0 mt-0.5" />
              <div>
                {storeInfo.openingHours.map((h, i) => (
                  <p key={i}>
                    <span className="font-semibold text-white">{h.days}</span>: {h.time}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar with Admin Login link */}
        <div className="border-t border-white/10 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream-light/40">
          <p>
            &copy; {currentYear} {storeInfo.name}. All Rights Reserved.
          </p>

          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center space-x-1.5 text-cream-light/50 hover:text-amber-400 hover:underline transition py-1 px-2 rounded-md hover:bg-white/5"
              title="Staff & Owner Login"
            >
              <span>🔐</span>
              <span className="font-medium">Admin Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
