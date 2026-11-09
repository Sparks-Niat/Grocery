import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MessageSquare, Phone, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products as initialProducts } from '../data/products';
import { categories as initialCategories } from '../data/categories';
import { storeInfo as initialStoreInfo } from '../data/store';
import { useStore } from '../context/StoreContext';

export default function Products({ selectedCategory, setSelectedCategory }) {
  const { products: storeProducts, categories: storeCategories, storeInfo: storeSettings } = useStore();
  const productsList = storeProducts && storeProducts.length > 0 ? storeProducts : initialProducts;
  const categoriesList = storeCategories && storeCategories.length > 0 ? storeCategories : initialCategories;
  const storeInfo = storeSettings || initialStoreInfo;
  const [searchQuery, setSearchQuery] = useState('');

  // Accept external categories filter event
  useEffect(() => {
    const handleFilter = (e) => {
      setSelectedCategory(e.detail);
    };
    window.addEventListener('filter-category', handleFilter);
    return () => window.removeEventListener('filter-category', handleFilter);
  }, [setSelectedCategory]);

  // Filter products by selected category AND search query
  const filteredProducts = productsList.filter((prod) => {
    const matchesCategory = selectedCategory === 'all' || prod.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      prod.name.toLowerCase().includes(q) ||
      prod.packSize.toLowerCase().includes(q) ||
      (prod.subcategory && prod.subcategory.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
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
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" size={18} />
            <input
              type="text"
              placeholder="Search products by name, size or subcategory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-cream-dark/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-charcoal focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Categories Filter Scroller */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-primary text-cream shadow-sm'
                  : 'bg-white text-charcoal/70 hover:bg-cream-dark/50 border border-cream-dark/60'
              }`}
            >
              All Categories ({productsList.length})
            </button>
            {categoriesList.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  selectedCategory === category.id
                    ? 'bg-primary text-cream shadow-sm'
                    : 'bg-white text-charcoal/70 hover:bg-cream-dark/50 border border-cream-dark/60'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Counter and Selected Category Notice */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm font-semibold text-charcoal/60">
            Showing <span className="text-primary font-bold">{filteredProducts.length}</span> Products
            {selectedCategory !== 'all' && (
              <span> in <span className="text-primary font-bold">{categoriesList.find(c => c.id === selectedCategory)?.name || selectedCategory}</span></span>
            )}
            {searchQuery && (
              <span> matching "<span className="text-primary font-bold">{searchQuery}</span>"</span>
            )}
          </p>

          {(selectedCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs text-secondary hover:text-secondary-dark font-bold underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryName={categoriesList.find(c => c.id === product.categoryId)?.name}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-cream-dark p-8">
            <div className="w-16 h-16 bg-cream-dark/40 rounded-full flex items-center justify-center mx-auto mb-4 text-charcoal/40">
              <SlidersHorizontal size={28} />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal mb-1">
              No products found
            </h3>
            <p className="text-charcoal/60 text-sm max-w-sm mx-auto mb-6">
              We couldn't find any products matching your current search or category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="btn-primary py-2 px-5 text-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Store Inquiries Banner */}
        <div className="mt-16 bg-gradient-to-r from-primary-dark to-primary rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl text-left">
            <span className="text-xs font-bold text-accent uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Custom Orders & Inquiries
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl mt-3 mb-2">
              Looking for something specific?
            </h2>
            <p className="text-cream/80 text-sm sm:text-base mb-6">
              If an item is not listed here, we may still carry it in stock or can arrange it for you. Message or call our store staff directly.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${storeInfo.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(storeInfo.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent py-3 px-6 text-sm flex items-center space-x-2"
              >
                <MessageSquare size={16} />
                <span>Message on WhatsApp</span>
              </a>
              <a
                href={`tel:${storeInfo.phone}`}
                className="bg-white/10 hover:bg-white/20 text-cream border border-white/20 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 flex items-center space-x-2"
              >
                <Phone size={16} />
                <span>Call Us Today</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
