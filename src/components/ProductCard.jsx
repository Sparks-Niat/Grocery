import React from 'react';
import { MessageSquare, Check, Phone } from 'lucide-react';
import { storeInfo } from '../data/store';

export default function ProductCard({ product, categoryName }) {
  const packSuffix = product.packSize ? ` (${product.packSize})` : '';
  const whatsappUrl = `https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello, I saw "${product.name}${packSuffix}" on your website. Is it available in stock today?`
  )}`;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-cream-dark/60 overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
      {/* Product Image Container */}
      <div className="relative aspect-card w-full overflow-hidden bg-cream-dark/30 flex items-center justify-center p-2 border-b border-cream-dark/45">
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Availability Badge */}
        {product.inStock && (
          <div className="absolute top-3 left-3 bg-primary/90 text-cream text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm backdrop-blur-sm border border-primary-light/20">
            <Check size={10} className="text-accent" />
            <span>Available in Store</span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col text-left">
        {/* Category Label */}
        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 block">
          {categoryName || product.categoryId}
        </span>
        
        {/* Title */}
        <h3 className="font-display font-bold text-charcoal-dark text-sm sm:text-base line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        {/* Pack Size */}
        <p className="text-xs text-charcoal/60 mb-3 min-h-[1rem]">
          {product.packSize ? `Pack size: ${product.packSize}` : '\u00A0'}
        </p>

        {/* Pricing and Details */}
        <div className="mt-auto pt-3 border-t border-cream-dark/50 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-charcoal/50 block font-medium uppercase leading-none mb-1">
              {product.price != null && product.price !== '' ? 'Sample Price' : 'Price'}
            </span>
            <span className="font-display font-extrabold text-primary text-lg">
              {product.price != null && product.price !== '' ? `₹${product.price}` : 'Available'}
            </span>
          </div>

          {/* Quick CTA to inquire */}
          <div className="flex space-x-1.5">
            <a 
              href={`tel:${storeInfo.phone}`}
              className="p-2 rounded-lg bg-cream-dark hover:bg-primary hover:text-white text-charcoal/70 transition-all duration-200"
              title="Call store about this item"
            >
              <Phone size={14} />
            </a>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366] text-[#20ba5a] hover:text-white font-bold text-xs flex items-center space-x-1 transition-all duration-200"
              title="Inquire on WhatsApp"
            >
              <MessageSquare size={13} className="fill-current" />
              <span>Ask</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
