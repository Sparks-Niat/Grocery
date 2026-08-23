import React from 'react';
import { Sparkles, Heart, Compass, ShieldCheck, MapPin } from 'lucide-react';

export default function About({ storeInfo }) {
  const values = [
    {
      title: "Fresh & Quality Standards",
      description: "We work carefully to stack high-quality food brands and fresh local produce, ensuring your kitchen gets only the best.",
      icon: <Sparkles className="text-primary w-6 h-6" />
    },
    {
      title: "Community First",
      description: "We are deeply rooted in Nandigama. We treat our shoppers as friends and neighbors, not numbers.",
      icon: <Heart className="text-accent-dark w-6 h-6" />
    },
    {
      title: "Everyday Convenience",
      description: "Opening early and closing late, we are here to support your regular routine and last-minute needs.",
      icon: <Compass className="text-secondary w-6 h-6" />
    },
    {
      title: "Fair Pricing & Trust",
      description: "Honest and competitive pricing on all items, ensuring excellent value for every rupee spent.",
      icon: <ShieldCheck className="text-charcoal w-6 h-6" />
    }
  ];

  return (
    <div className="pt-24 pb-16 bg-cream text-charcoal">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            Our Story
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-primary mt-3 mb-4">
            Serving Our Community with Pride
          </h1>
          <p className="text-charcoal/70 text-base sm:text-lg">
            DailyMart General Store was founded with a simple goal: to make everyday shopping a pleasant, convenient, and reliable experience for families in Nandigama.
          </p>
        </div>
      </div>

      {/* Intro Story Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-cream-dark shadow-md aspect-[4/3]">
            <img 
              src="/images/hero-store.jpg" 
              alt="Inside DailyMart General Store" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="lg:col-span-6 text-left space-y-5">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-primary">
              Your Complete Neighbourhood Pantry
            </h2>
            <div className="text-charcoal/80 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {storeInfo.aboutText || "We understand that running a household requires keeping track of dozens of small items. Whether it is premium tea powder to kickstart your morning, fresh dal and spices for lunch, notebook registers for your child's class, or simple kitchen paper plates — searching multiple shops is a chore.\n\nThat is why DailyMart General Store brings together a wide selection of groceries, kitchen staples, snacks, cool drinks, stationery, and small household cleaning items in one modern, organized space."}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-cream-dark/40 border-y border-cream-dark py-20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
              Our Values
            </span>
            <h2 className="font-display font-extrabold text-3xl text-primary mt-3">
              What Guides DailyMart
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="flex space-x-4 p-6 bg-white rounded-2xl border border-cream-dark/65 shadow-sm text-left">
                <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
                  {val.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-charcoal-dark text-lg mb-2">
                    {val.title}
                  </h3>
                  <p className="text-charcoal/70 text-sm leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Location CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <MapPin className="text-primary w-12 h-12 mx-auto mb-4" />
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-primary mb-4">
            Conveniently Located on Main Road
          </h2>
          <p className="text-charcoal/70 text-sm sm:text-base mb-8">
            Our store is situated near the landmark Gandhi Center in Nandigama. We have dedicated parking spaces for customer two-wheelers, making your quick grocery run stress-free.
          </p>
          <a
            href={(storeInfo.mapUrl || storeInfo.googleMapsUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-cream font-bold text-sm shadow transition-colors"
          >
            <span>Get Directions on Google Maps</span>
          </a>
        </div>
      </section>
    </div>
  );
}
