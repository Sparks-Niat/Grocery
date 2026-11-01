import React, { useState } from 'react';
import { MessageSquare, Check, Phone, ImageOff } from 'lucide-react';
import { storeInfo } from '../data/store';

export default function ProductCard({ product, categoryName }) {
  const [imgError, setImgError] = useState(false);
  const packSuffix = product.packSize ? ` (${product.packSize})` : '';
  const whatsappUrl = `https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello, I saw "${product.name}${packSuffix}" on your website. Is it available in stock today?`
  )}`;

  const fallbackCategoryImages = {
    snacks: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80',
    beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    grocery: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    kitchen: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
    'fresh-produce': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80',
    'personal-care': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    'home-cleaning': 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=500&auto=format&fit=crop&q=80',
    stationery: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=80',
    'household-utilities': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'
  };

  const defaultImage = fallbackCategoryImages[product.categoryId] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80';
  const displayImage = imgError || !product.image ? defaultImage : product.image;
  const isIdentifiedPlaceholder = Boolean(product.isPlaceholder || imgError);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-cream-dark/60 overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
      {/* Product Image Container */}
      <div className="relative aspect-card w-full overflow-hidden bg-cream-dark/30 flex items-center justify-center p-2 border-b border-cream-dark/45">
        <img 
          src={displayImage} 
          alt={`${product.name}${product.packSize ? ` (${product.packSize})` : ''} - DailyMart Grocery Store`} 
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        
        {/* Availability Badge */}
        {product.inStock && (
          <div className="absolute top-3 left-3 bg-primary/90 text-cream text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm backdrop-blur-sm border border-primary-light/20">
            <Check size={10} className="text-accent" />
            <span>Available in Store</span>
          </div>
        )}

        {/* Identified Placeholder Badge */}
        {isIdentifiedPlaceholder && (
          <div className="absolute top-3 right-3 bg-charcoal/70 text-cream text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm backdrop-blur-sm">
            <ImageOff size={9} />
            <span>Placeholder</span>
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
