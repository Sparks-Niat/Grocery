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
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/85 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 group">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50/70 flex items-center justify-center p-3 sm:p-4 border-b border-slate-100">
        <img 
          src={displayImage} 
          alt={`${product.name}${product.packSize ? ` (${product.packSize})` : ''} - DailyMart Grocery Store`} 
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        
        {/* Availability Badge */}
        {product.inStock && (
          <div className="absolute top-2.5 left-2.5 bg-primary/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm backdrop-blur-sm border border-white/20">
            <Check size={10} className="text-accent" />
            <span>In Store</span>
          </div>
        )}

        {/* Identified Placeholder Badge */}
        {isIdentifiedPlaceholder && (
          <div className="absolute top-2.5 right-2.5 bg-slate-700/80 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm backdrop-blur-sm">
            <ImageOff size={9} />
            <span>Placeholder</span>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-left">
        <div>
          {/* Category Label */}
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1 block">
            {categoryName || product.categoryId}
          </span>
          
          {/* Title with min-height for uniform row alignment */}
          <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base line-clamp-2 min-h-[2.5rem] leading-snug mb-1.5 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Pack Size badge */}
          <div className="min-h-[1.5rem] mb-3">
            {product.packSize ? (
              <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100/90 px-2 py-0.5 rounded-md">
                Pack: {product.packSize}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Standard pack</span>
            )}
          </div>
        </div>

        {/* Pricing and Details */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none mb-1">
              {product.price != null && product.price !== '' ? 'Price' : 'Status'}
            </span>
            <span className="font-display font-extrabold text-primary text-base sm:text-lg leading-tight">
              {product.price != null && product.price !== '' ? `₹${product.price}` : 'Available'}
            </span>
          </div>

          {/* Quick CTA to inquire */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <a 
              href={`tel:${storeInfo.phone}`}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-slate-600 transition-all duration-200"
              title="Call store about this item"
            >
              <Phone size={14} />
            </a>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs sm:text-sm border border-emerald-200/70 hover:border-emerald-600 shadow-xs transition-all duration-200"
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
