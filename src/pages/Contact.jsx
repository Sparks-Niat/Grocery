import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

export default function Contact({ storeInfo }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    // Build the WhatsApp message content
    const text = `Hello DailyMart, my name is ${formData.name} (${formData.phone}). I have an inquiry: ${formData.message}`;
    const whatsappUrl = `https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
    // Reset form
    setFormData({ name: '', phone: '', message: '' });
  };

  return (
    <div className="pt-24 pb-16 bg-cream min-h-screen">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            Get In Touch
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-primary mt-3 mb-4">
            Contact & Directions
          </h1>
          <p className="text-charcoal/70 text-base sm:text-lg">
            Have questions about product availability or store location? Call us directly, send a text on WhatsApp, or drop a message through our quick form.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-4 text-left space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-cream-dark/65 shadow-sm space-y-6">
              <h2 className="font-display font-bold text-xl text-primary border-b border-cream-dark pb-4">
                Store Directory
              </h2>

              <div className="flex items-start space-x-3 text-sm">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-charcoal-dark uppercase text-[10px] tracking-widest mb-1">
                    Address
                  </h4>
                  <p className="text-charcoal/80 leading-relaxed">{storeInfo.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <Phone size={18} className="text-secondary mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-charcoal-dark uppercase text-[10px] tracking-widest mb-1">
                    Call Directory
                  </h4>
                  <a href={`tel:${storeInfo.phone}`} className="text-primary hover:underline font-semibold leading-relaxed">
                    {storeInfo.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <MessageSquare size={18} className="text-[#25D366] mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-charcoal-dark uppercase text-[10px] tracking-widest mb-1">
                    WhatsApp Chat
                  </h4>
                  <a 
                    href={`https://wa.me/${(storeInfo.whatsappNumber || storeInfo.whatsapp || '').replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline font-semibold leading-relaxed"
                  >
                    {(storeInfo.whatsappNumber || storeInfo.whatsapp || '')}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <Clock size={18} className="text-accent-dark mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-charcoal-dark uppercase text-[10px] tracking-widest mb-1">
                    Opening Hours
                  </h4>
                  <div className="text-charcoal/80 leading-relaxed">
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

            <a
              href={(storeInfo.mapUrl || storeInfo.googleMapsUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-primary hover:bg-primary-dark text-cream font-bold text-sm shadow transition-colors"
            >
              <MapPin size={16} className="text-accent" />
              <span>Get GPS Directions</span>
            </a>
          </div>

          {/* Quick Inquiry Form Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-6 sm:p-8 bg-white rounded-2xl border border-cream-dark/65 shadow-sm text-left">
              <h2 className="font-display font-bold text-xl text-primary mb-2">
                Send a Quick Store Inquiry
              </h2>
              <p className="text-charcoal/60 text-xs sm:text-sm mb-6 leading-relaxed">
                Fill in your details and details of the items you are looking for. Clicking submit compiles the message and launches WhatsApp so you can send it directly to our store manager.
              </p>

              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary-dark text-xs sm:text-sm">
                  <strong>Thank you!</strong> Your message has been prepared. If WhatsApp did not open automatically, please click the button below to complete sending.
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-1">
                      Your Name
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Ramesh Kumar"
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream-light/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-1">
                      Your Contact Number
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., +91 94401 XXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream-light/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/60 uppercase tracking-widest mb-1">
                    Your Message / Items Requested
                  </label>
                  <textarea 
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="e.g., Hi, I need to order a 25kg bag of Sona Masuri Rice and 5 packets of Marie Gold Biscuits. Please let me know if they are available to collect."
                    className="w-full px-4 py-2.5 rounded-xl border border-cream-dark bg-cream-light/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow transition-colors"
                >
                  <MessageCircle size={16} className="fill-white" />
                  <span>Send via WhatsApp</span>
                </button>
              </form>
            </div>

            {/* Map Area */}
            <div className="h-[300px] rounded-2xl overflow-hidden border border-cream-dark shadow-sm">
              <iframe 
                src={storeInfo.mapUrl || storeInfo.googleMapsEmbedUrl}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="DailyMart Google Map Directions"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
