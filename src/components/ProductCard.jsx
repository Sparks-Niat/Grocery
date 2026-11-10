import React from 'react';
import { MessageSquare, Check, Phone, AlertCircle } from 'lucide-react';
import { storeInfo as defaultStoreInfo } from '../data/store';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product, categoryName }) {
  const { storeInfo: liveStoreInfo } = useStore();
  const storeInfo = liveStoreInfo || defaultStoreInfo;
  const whatsappBase = storeInfo.whatsappUrl || "https://wa.me/919542670795";
  const whatsappUrl = `${whatsappBase}?text=${encodeURIComponent(
    `Hello, I saw "${product.name} (${product.packSize})" on your website. Is it available in stock today?`
  )}`;

  const isProvisional = product.priceNote === 'provisional';
  const hasVariants = product.variants && product.variants.length > 1;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-cream-dark/60 overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 group">
      {/* Product Image Container */}
      <div className="relative aspect-card w-full overflow-hidden bg-cream-dark/30 flex items-center justify-center p-2 border-b border-cream-dark/45">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            // Graceful fallback to category-appropriate placeholder
            e.target.onerror = null;
            e.target.src = '/images/grocery.jpg';
          }}
        />

        {/* Availability Badge */}
        {product.inStock && (
          <div className="absolute top-3 left-3 bg-primary/90 text-cream text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm backdrop-blur-sm border border-primary-light/20">
            <Check size={10} className="text-accent" />
            <span>In Store</span>
          </div>
        )}

        {/* Subcategory badge if present */}
        {product.subcategory && (
          <div className="absolute top-3 right-3 bg-white/80 text-charcoal/70 text-[9px] font-bold px-2 py-0.5 rounded-full border border-cream-dark/60 backdrop-blur-sm">
            {product.subcategory}
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
        <p className="text-xs text-charcoal/60 mb-3">
          {product.packSize}
        </p>

        {/* Pricing and CTA */}
        <div className="mt-auto pt-3 border-t border-cream-dark/50 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {/* Price label */}
            <span className="text-[10px] text-charcoal/50 block font-medium uppercase leading-none mb-1">
              {isProvisional ? 'Est. Price*' : 'Store Price'}
            </span>

            {/* Single price or variants */}
            {hasVariants ? (
              <div className="flex flex-wrap gap-1">
                {product.variants.map((v, i) => (
                  <span
                    key={i}
                    className="font-display font-extrabold text-primary text-sm bg-primary/5 px-1.5 py-0.5 rounded"
                  >
                    ₹{v.price}
                  </span>
                ))}
              </div>
            ) : (
              <span className="font-display font-extrabold text-primary text-lg">
                ₹{product.price}
              </span>
            )}
          </div>

          {/* Quick CTA */}
          <div className="flex space-x-1.5 shrink-0">
            <a
              href={storeInfo.callUrl || "tel:9542670795"}
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

        {/* Provisional price disclaimer */}
        {isProvisional && (
          <div className="mt-2 flex items-start space-x-1 text-[10px] text-charcoal/45 leading-tight">
            <AlertCircle size={10} className="shrink-0 mt-0.5" />
            <span>Estimated price — confirm with store</span>
          </div>
        )}
      </div>
    </div>
  );
}
