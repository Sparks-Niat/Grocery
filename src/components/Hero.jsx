import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { storeInfo } from '../data/store';

export default function Hero({ onExploreClick, onDirectionsClick }) {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-16 sm:py-20">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-store.jpg" 
          alt={`${storeInfo.name} Interior`} 
          className="w-full h-full object-cover object-center transform scale-105 animate-[pulse_10s_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark/90 via-charcoal-dark/75 to-transparent md:to-charcoal/20" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left">
        <div className="max-w-2xl">
          {/* Small Label */}
          <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold tracking-widest uppercase mb-4 border border-accent/30">
            {storeInfo.tagline}
          </span>

          {/* Heading */}
          <h1 className="font-display font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight mb-6">
            Everything You Need, <br />
            <span className="text-accent">All in One Place</span>
          </h1>

          {/* Description */}
          <p className="text-cream-light/95 text-base sm:text-lg lg:text-xl font-normal leading-relaxed mb-10 max-w-xl">
            From everyday groceries and kitchen essentials to snacks, beverages, stationery, and household needs — discover your daily essentials at your trusted local store in Kanchikacherla.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-light text-cream font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>Explore Products</span>
              <ArrowRight size={18} className="text-accent" />
            </button>
            
            <a
              href={storeInfo.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/35 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <MapPin size={18} className="text-accent" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-y-4 gap-x-8 text-cream-light/80 text-xs sm:text-sm font-medium">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Everyday Essentials</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Convenient Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Friendly Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
