import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MessageSquare, Phone, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Products({ selectedCategory, setSelectedCategory, categories, products, storeInfo = {} }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Accept external categories filter event
  useEffect(() => {
    const handleFilter = (e) => {
      setSelectedCategory(e.detail);
    };
    window.addEventListener('filter-category', handleFilter);
    return () => window.removeEventListener('filter-category', handleFilter);
  }, [setSelectedCategory]);

  // Filter products safely by selected category AND search query
  const cleanSearch = (searchQuery || '').trim().toLowerCase();
  const filteredProducts = (products || []).filter((prod) => {
    if (!prod) return false;
    const matchesCategory = selectedCategory === 'all' || prod.categoryId === selectedCategory;
    const nameMatch = (prod.name || '').toLowerCase().includes(cleanSearch);
    const packMatch = (prod.packSize || '').toLowerCase().includes(cleanSearch);
    return matchesCategory && (nameMatch || packMatch);
  });

  return (
    <div className="pt-24 pb-16 bg-cream min-h-screen">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="text-left max-w-3xl">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            Store Showcase
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-primary mt-3 mb-3">
            Our Everyday Essentials
          </h1>
          <p className="text-charcoal/70 text-sm sm:text-base">
            Explore a selection of products available on our shelves today. Browse by category, search specific items, and visit us in Nandigama to shop.
          </p>
        </div>
      </div>

      {/* Control Panel: Search & Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sticky top-[72px] z-30 py-3 bg-cream/90 backdrop-blur-sm border-y border-cream-dark/50">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" size={18} />
            <input 
              type="text" 
              placeholder="Search groceries, beverages, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-cream-dark/80 bg-white text-charcoal placeholder-charcoal/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal p-0.5 rounded-full hover:bg-cream-dark"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Title/Label */}
          <div className="hidden lg:flex items-center text-charcoal/50 text-xs font-bold uppercase tracking-wider space-x-1.5 shrink-0">
            <SlidersHorizontal size={14} />
            <span>Categories</span>
          </div>
        </div>

        {/* Category Pills Horizontal list */}
        <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none sm:-mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors border ${
              selectedCategory === 'all'
                ? 'bg-primary border-primary text-cream'
                : 'bg-white border-cream-dark hover:border-primary/30 text-charcoal/80'
            }`}
          >
            All Products ({products?.length || 0})
          </button>
          
          {categories.map((cat) => {
            const count = (products || []).filter(p => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors border ${
                  selectedCategory === cat.id
                    ? 'bg-primary border-primary text-cream'
                    : 'bg-white border-cream-dark hover:border-primary/30 text-charcoal/80'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid & Catalogue */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProducts.length > 0 ? (
          <div>
            <div className="text-left text-xs font-bold text-charcoal/50 uppercase tracking-widest mb-6">
              Showing {filteredProducts.length} Products
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => {
                const cat = categories.find(c => c.id === prod.categoryId);
                return (
                  <ProductCard 
                    key={prod.id}
                    product={prod}
                    categoryName={cat ? cat.name : ""}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty Search/Filter State */
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-cream-dark/50 flex items-center justify-center text-charcoal/40 mx-auto mb-4">
              <Search size={28} />
            </div>
            <h3 className="font-display font-bold text-charcoal-dark text-lg mb-2">
              No Products Found
            </h3>
            <p className="text-charcoal/60 text-sm mb-6">
              We couldn't find any products matching "{searchQuery}" in this category. We might still have it in stock on our shelves!
            </p>
            <div className="flex justify-center space-x-3">
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="px-4 py-2 rounded-lg bg-cream-dark hover:bg-cream text-charcoal-dark text-xs font-bold transition-all border border-cream-dark"
              >
                Clear Filters
              </button>
              <a 
                href={`tel:${storeInfo.phone}`}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-light text-cream text-xs font-bold transition-all"
              >
                Call Store to Ask
              </a>
            </div>
          </div>
        )}

        {/* Not Found Helpers - Bottom CTA Banner */}
        <div className="mt-16 bg-primary/5 border border-primary/10 rounded-2xl p-6 sm:p-8 text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="font-display font-extrabold text-primary text-lg sm:text-xl mb-2">
              Looking for something specific?
            </h3>
            <p className="text-charcoal/70 text-sm leading-relaxed">
              We stock hundreds of everyday products, fresh items, and local brands that might not be listed in this online catalog. Ring us or send a text on WhatsApp to confirm stock!
            </p>
          </div>
          
          <div className="flex gap-3 shrink-0 w-full md:w-auto">
            <a
              href={`tel:${storeInfo?.phone || ''}`}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-cream font-bold text-sm shadow transition-colors"
            >
              <Phone size={14} className="text-accent" />
              <span>Call Us</span>
            </a>
            
            <a
              href={`https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello DailyMart, I am looking for a specific product and wanted to check if you have it in store.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-cream-dark text-charcoal-dark font-bold text-sm border border-cream-dark shadow-sm transition-colors"
            >
              <MessageSquare size={14} className="text-[#25D366] fill-[#25D366]/10" />
              <span>WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
