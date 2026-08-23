import React from 'react';
import { Phone, MessageCircle, MapPin } from 'lucide-react';

export default function MobileBottomBar({ storeInfo }) {
  const whatsappUrl = `https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(storeInfo.whatsappMessage)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block sm:hidden bg-white/95 backdrop-blur-md border-t border-cream-dark/60 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Call Action */}
        <a 
          href={`tel:${storeInfo.phone}`}
          className="flex flex-col items-center justify-center flex-1 h-full text-charcoal/80 active:text-primary active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mb-0.5">
            <Phone size={18} className="text-primary" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Call Us</span>
        </a>

        {/* WhatsApp Action */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center flex-1 h-full text-charcoal/80 active:text-[#25D366] active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-0.5">
            <MessageCircle size={18} className="text-[#25D366]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
        </a>

        {/* Directions Action */}
        <a 
          href={(storeInfo.mapUrl || storeInfo.googleMapsUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center flex-1 h-full text-charcoal/80 active:text-accent active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-0.5">
            <MapPin size={18} className="text-accent-dark" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Directions</span>
        </a>
      </div>
    </div>
  );
}
