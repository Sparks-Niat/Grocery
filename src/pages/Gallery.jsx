import React, { useState } from 'react';
import { X, ZoomIn, MapPin, Eye } from 'lucide-react';

export default function Gallery({ storeInfo, gallery = [] }) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const displayGallery = gallery.length > 0 ? gallery : (storeInfo?.gallery || []);

  return (
    <div className="pt-24 pb-16 bg-cream min-h-screen">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            Showroom Tour
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-primary mt-3 mb-4">
            Take a Look Inside
          </h1>
          <p className="text-charcoal/70 text-base sm:text-lg">
            Browse through photographs of our store. We maintain high standards of cleanliness, neat product arrangements, and bright lighting to ensure you have a comfortable shopping visit.
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayGallery.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => setLightboxImage(item)}
              className="group relative aspect-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer border border-cream-dark/65 bg-white flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1"
            >
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              
              {/* Hover Dark Card Cover */}
              <div className="absolute inset-0 bg-charcoal-dark/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-3 border border-white/20">
                  <Eye size={20} />
                </div>
                <h3 className="font-display font-bold text-white text-base sm:text-lg leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="text-cream-light/80 text-xs line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-dark/95 p-4 sm:p-6 md:p-10">
          {/* Close Backdrop Trigger */}
          <div className="absolute inset-0 z-0" onClick={() => setLightboxImage(null)} />
          
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Lightbox"
          >
            <X size={24} />
          </button>
          
          <div className="relative z-10 max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img 
              src={lightboxImage.image} 
              alt={lightboxImage.title} 
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
            />
            <div className="mt-4 text-center max-w-xl">
              <h3 className="font-display font-bold text-white text-lg sm:text-xl">
                {lightboxImage.title}
              </h3>
              <p className="text-cream-light/75 text-xs sm:text-sm mt-1">
                {lightboxImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
