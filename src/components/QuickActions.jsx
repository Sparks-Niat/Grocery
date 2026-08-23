import React from 'react';
import { Phone, MessageSquare, MapPin, Clock } from 'lucide-react';
import { storeInfo } from '../data/store';

export default function QuickActions() {
  const actions = [
    {
      title: "Call Us",
      description: "Have questions? Ring us directly",
      icon: <Phone className="text-primary w-6 h-6 group-hover:text-accent smooth-transition" />,
      link: `tel:${storeInfo.phone}`,
      actionText: storeInfo.phone
    },
    {
      title: "WhatsApp Us",
      description: "Chat with us for inquiries",
      icon: <MessageSquare className="text-secondary w-6 h-6 group-hover:text-accent smooth-transition" />,
      link: `https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(storeInfo.whatsappMessage)}`,
      actionText: "Send Message"
    },
    {
      title: "Get Directions",
      description: "Find us in Nandigama",
      icon: <MapPin className="text-accent w-6 h-6 group-hover:text-primary smooth-transition" />,
      link: (storeInfo.mapUrl || storeInfo.googleMapsUrl),
      actionText: "Open Map"
    },
    {
      title: "Opening Hours",
      description: "Mon - Sun: 7:00 AM - 9:30 PM",
      icon: <Clock className="text-charcoal w-6 h-6 group-hover:text-primary smooth-transition" />,
      link: "#store-contact-info", // Scroll to contact details
      actionText: "Daily Schedule"
    }
  ];

  return (
    <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {actions.map((act, idx) => {
          const isLink = act.link.startsWith('http') || act.link.startsWith('tel');
          const CardContent = (
            <div className="flex flex-col h-full p-4 sm:p-6 bg-white/95 rounded-2xl shadow-lg border border-cream-dark/40 hover:border-primary/25 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group select-none text-left cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-cream-dark/60 flex items-center justify-center mb-4 group-hover:bg-primary/5 smooth-transition">
                {act.icon}
              </div>
              <h3 className="font-display font-bold text-charcoal-dark text-base sm:text-lg mb-1 group-hover:text-primary smooth-transition">
                {act.title}
              </h3>
              <p className="text-charcoal/70 text-xs sm:text-sm mb-4 flex-1">
                {act.description}
              </p>
              <span className="inline-flex items-center text-xs font-bold text-primary group-hover:text-accent uppercase tracking-wider smooth-transition">
                {act.actionText} →
              </span>
            </div>
          );

          if (isLink) {
            return (
              <a 
                key={idx} 
                href={act.link} 
                target={act.link.startsWith('http') ? "_blank" : undefined}
                rel={act.link.startsWith('http') ? "noopener noreferrer" : undefined}
                className="block"
              >
                {CardContent}
              </a>
            );
          }

          return (
            <div 
              key={idx}
              onClick={() => {
                const el = document.getElementById('store-contact-info');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
