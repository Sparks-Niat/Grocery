import React from 'react';
import { ShoppingBasket, Phone, MessageSquare, MapPin, Clock, ArrowUp } from 'lucide-react';

export default function Footer({ setActivePage, storeInfo, categories = [], footerLinks = [], socialLinks = [] }) {
  const handleLinkClick = (path) => {
    const pageId = path === '/' ? 'home' : path.replace('/', '');
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
              onClick={() => handleLinkClick('/')}
              className="flex items-center space-x-3 cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden border border-accent">
                <img 
                  src={storeInfo.logo} 
                  alt="DailyMart Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white block leading-none">
                  {storeInfo.businessName || 'DailyMart'}
                </span>
                <span className="text-[10px] text-accent font-medium tracking-widest uppercase">
                  General Store
                </span>
              </div>
            </div>
            <p className="text-sm text-cream-light/60 leading-relaxed">
              {storeInfo.aboutText || storeInfo.description}
            </p>
            <div className="pt-2 flex items-center space-x-3">
              {socialLinks.map(social => (
                <a 
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label={social.platform}
                  title={social.platform}
                >
                  <MessageSquare size={14} /> {/* Icon maps to lucide icons later, static for now */}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Col */}
          <div>
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.map(link => (
                <li key={link.id}>
                  <button 
                    onClick={() => handleLinkClick(link.path)}
                    className="hover:text-accent hover:underline transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories Col */}
          <div>
            <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-6">
              Our Products
            </h4>
            <ul className="space-y-3 text-sm">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button 
                    onClick={() => {
                      // Navigate to products and select category
                      handleLinkClick('/products');
                      // Wait a brief moment to set the category filter in state
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('filter-category', { detail: cat.id }));
                      }, 50);
                    }}
                    className="hover:text-accent hover:underline transition-colors text-left"
                  >
                    {cat.name}
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

        {/* Disclaimer Alert */}
        <div className="border-t border-white/10 pt-8 pb-4 text-center">
          <div className="inline-block px-4 py-2 rounded-lg bg-white/5 border border-white/10 mb-4 text-xs max-w-2xl leading-relaxed text-cream-light/60">
            <strong>Development Notice:</strong> This website is a premium digital showcase demonstration for development purposes. The brand name, products, gallery images, maps, and details are temporary sample placeholders and will be replaced with the actual business details prior to final launch.
          </div>
          <p className="text-xs text-cream-light/40">
            {storeInfo.copyright || `© ${currentYear} DailyMart General Store. All Rights Reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
