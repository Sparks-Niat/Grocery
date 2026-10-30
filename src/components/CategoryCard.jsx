import React from 'react';
import * as Icons from 'lucide-react';

export default function CategoryCard({ category, onClick }) {
  // Dynamically resolve Lucide Icon
  const IconComponent = Icons[category.iconName] || Icons.ShoppingBasket;

  return (
    <div 
      onClick={onClick}
      className="group relative h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-xl cursor-pointer select-none transition-all duration-300 transform hover:-translate-y-1 border border-cream-dark/50"
    >
      {/* Background Image */}
      <img 
        src={category.image} 
        alt={category.name} 
        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark/90 via-charcoal-dark/50 to-transparent group-hover:via-charcoal-dark/40 transition-colors duration-300" />

      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-end text-left">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/35 flex items-center justify-center text-accent">
            <IconComponent size={18} />
          </div>
          <h3 className="font-display font-bold text-white text-lg leading-tight group-hover:text-accent smooth-transition">
            {category.name}
          </h3>
        </div>
        
        <p className="text-cream-light/75 text-xs line-clamp-2 mb-4 group-hover:text-cream-light smooth-transition">
          {category.description}
        </p>
        
        <div className="flex items-center text-xs font-bold text-accent group-hover:translate-x-1 transition-transform duration-300">
          <span>View Products</span>
          <Icons.ArrowRight size={12} className="ml-1" />
        </div>
      </div>
    </div>
  );
}
