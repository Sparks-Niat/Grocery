import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton({ storeInfo }) {
  const whatsappUrl = `https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(storeInfo.whatsappMessage || '')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={28} className="fill-white" />
      
      {/* Tooltip */}
      <span className="absolute right-16 bg-charcoal text-cream-light text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md border border-charcoal/20">
        WhatsApp Shop
      </span>
      
      {/* Notification Pulse */}
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent border border-white"></span>
      </span>
    </a>
  );
}
