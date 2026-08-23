import React, { useState } from 'react';
import { ArrowRight, MapPin, Phone, MessageSquare, Clock, X, ChevronRight } from 'lucide-react';
import Hero from '../components/Hero';
import QuickActions from '../components/QuickActions';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';

export default function Home({ setActivePage, onCategorySelect, categories, products, storeInfo, heroTags = [], commitments = [], gallery = [] }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const featuredProducts = products.filter(p => p.featured);

  const handleCategoryClick = (catId) => {
    onCategorySelect(catId);
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreClick = () => {
    setActivePage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-12 bg-cream text-charcoal">
      {/* 2. Hero Section */}
      <Hero 
        onExploreClick={handleExploreClick}
        onDirectionsClick={() => window.open(storeInfo.mapUrl || (storeInfo.mapUrl || storeInfo.googleMapsUrl), '_blank')}
        storeInfo={storeInfo}
        heroTags={heroTags}
      />

      {/* 3. Quick Actions Section */}
      <QuickActions />

      {/* 4. What We Provide Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/15 px-3 py-1 rounded-full border border-accent/25">
            What We Provide
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-primary mt-3 mb-4">
            Everything You Need for Everyday Life
          </h2>
          <p className="text-charcoal/70 text-base sm:text-lg">
            From kitchen essentials to refreshments, stationery, and household products, find the everyday items you need in one convenient place.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <CategoryCard 
              key={cat.id} 
              category={cat} 
              onClick={() => handleCategoryClick(cat.id)}
            />
          ))}
        </div>
      </section>

      {/* 5. Featured Products Section */}
      <section className="bg-cream-dark/50 py-20 border-y border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="text-left max-w-2xl">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                Popular Everyday Picks
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-primary mt-3 mb-4">
                Featured Products
              </h2>
              <p className="text-charcoal/70 text-sm sm:text-base">
                Take a look at some of our popular, everyday branded and unpackaged products available in-store.
              </p>
            </div>
            
            <button
              onClick={handleExploreClick}
              className="mt-4 md:mt-0 inline-flex items-center space-x-1 text-sm font-bold text-primary hover:text-accent group self-start transition-colors duration-200"
            >
              <span>View All Products</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((prod) => {
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
      </section>

      {/* 6. Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/15 px-3 py-1 rounded-full border border-accent/25">
            Our Commitments
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-primary mt-3 mb-4">
            Your Local Store, Made Convenient
          </h2>
          <p className="text-charcoal/70 text-base">
            We strive to provide simple, reliable, and friendly shopping for everyone in our community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {commitments.map((item, idx) => (
            <div key={item.id} className="p-6 bg-white rounded-2xl border border-cream-dark/60 shadow-sm text-left">
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center font-display font-bold text-primary mb-4">
                {idx + 1}
              </div>
              <h3 className="font-display font-bold text-charcoal-dark text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-charcoal/70 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Store Gallery Section */}
      <section className="bg-cream-dark/40 py-20 border-t border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
              Take a Look Inside
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-primary mt-3 mb-4">
              Explore Our Store Gallery
            </h2>
            <p className="text-charcoal/70 text-base">
              Neat shelves, fresh arrangements, and welcoming aisles. Visit us to shop in comfort.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {gallery.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => setLightboxImage(item)}
                className="group relative aspect-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer border border-cream-dark"
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-charcoal-dark/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="px-4 py-2 rounded-full bg-white/95 text-charcoal font-semibold text-xs shadow-md">
                    Zoom Image
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. About Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 text-left">
            <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/15 px-3 py-1 rounded-full border border-accent/25">
              Welcome to DailyMart
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-primary mt-3 mb-6">
              Your Neighbourhood Store for Everyday Needs
            </h2>
            <div className="space-y-4 text-charcoal/80 text-base leading-relaxed">
              <p>{storeInfo.description}</p>
              <p>
                Whether you need early morning milk and groceries, snacks for the kids, writing registers for school, or emergency batteries — we ensure our inventory is always stocked with local, fresh, and major brands.
              </p>
              <p className="font-semibold text-primary">
                Come visit us today and experience simple shopping with a warm smile!
              </p>
            </div>
            
            <button
              onClick={() => setActivePage('about')}
              className="mt-8 inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-cream font-bold text-sm shadow transition-all"
            >
              <span>Learn More About Us</span>
              <ChevronRight size={16} className="text-accent" />
            </button>
          </div>
          
          <div className="lg:col-span-6 aspect-card rounded-2xl overflow-hidden border border-cream-dark shadow-lg">
            <img 
              src="/images/store-exterior.jpg" 
              alt="DailyMart Store Exterior" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 9. Location & 10. Contact Sections */}
      <section id="store-location" className="bg-cream-dark/50 py-20 border-t border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact Card */}
            <div id="store-contact-info" className="lg:col-span-5 text-left flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                  Find Us Easily
                </span>
                <h2 className="font-display font-extrabold text-3xl text-primary mt-3 mb-6">
                  Come Visit Us Today
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                      <MapPin className="text-primary" size={20} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-charcoal-dark text-sm uppercase tracking-wider mb-1">
                        Our Location
                      </h4>
                      <p className="text-charcoal/80 text-sm leading-relaxed">
                        {storeInfo.address}
                      </p>
                      <a 
                        href={(storeInfo.mapUrl || storeInfo.googleMapsUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs font-bold text-primary hover:text-accent underline"
                      >
                        Open on Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center shrink-0 border border-secondary/10">
                      <Phone className="text-secondary" size={20} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-charcoal-dark text-sm uppercase tracking-wider mb-1">
                        Contact Details
                      </h4>
                      <div className="text-charcoal/80 text-sm space-y-1">
                        <p>Phone: <a href={`tel:${storeInfo.phone}`} className="hover:underline font-semibold">{storeInfo.phone}</a></p>
                        <p>WhatsApp: <a href={`https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline font-semibold">{(storeInfo.whatsappNumber || storeInfo.whatsapp || '')}</a></p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center shrink-0 border border-accent/10">
                      <Clock className="text-accent-dark" size={20} />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-charcoal-dark text-sm uppercase tracking-wider mb-1">
                        Opening Hours
                      </h4>
                      <div className="text-charcoal/80 text-sm">
                        {storeInfo.openingHours.map((h, i) => (
                          <p key={i}>
                            <span className="font-semibold text-charcoal-dark">{h.days}</span>
                            <br />
                            {h.time}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-cream-dark flex gap-4">
                <a 
                  href={`tel:${storeInfo.phone}`}
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-cream font-bold text-sm shadow transition-colors"
                >
                  <Phone size={14} className="text-accent" />
                  <span>Call Store</span>
                </a>
                
                <a 
                  href={`https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(storeInfo.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-cream-dark text-charcoal-dark font-bold text-sm border border-cream-dark shadow-sm transition-colors"
                >
                  <MessageSquare size={14} className="text-[#25D366] fill-[#25D366]/10" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
            
            {/* Map Embed */}
            <div className="lg:col-span-7 h-96 sm:h-[450px] rounded-2xl overflow-hidden border border-cream-dark shadow-lg">
              <iframe 
                src={storeInfo.mapUrl || storeInfo.googleMapsEmbedUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="DailyMart Store Location Map"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-dark/90 p-4 sm:p-6 md:p-10">
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>
          
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img 
              src={lightboxImage.image} 
              alt={lightboxImage.title} 
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
            />
            <div className="mt-4 text-center max-w-xl">
              <h3 className="font-display font-bold text-white text-lg sm:text-xl">
                {lightboxImage.title}
              </h3>
              <p className="text-cream-light/70 text-xs sm:text-sm mt-1">
                {lightboxImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
