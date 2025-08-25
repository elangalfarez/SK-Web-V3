import React from 'react';
import { 
  Store, 
  Car, 
  Utensils, 
  Baby, 
  Film, 
  Wifi, 
  CreditCard, 
  Info 
} from 'lucide-react';
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const Facilities = () => {
  const facilities = [
    {
      Icon: Store,
      name: "Shopping Area",
      description: "Wide variety of retail stores and boutiques",
      href: "#",
      cta: "Explore Stores",
      background: (
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Shopping Area"
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent"></div>
        </div>
      ),
      className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2",
    },
    {
      Icon: Car,
      name: "Parking Space",
      description: "Spacious and secure parking areas",
      href: "#",
      cta: "View Rates",
      background: (
        <div className="absolute inset-0">
          <img 
            src="https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/images.jpeg?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Parking"
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent"></div>
        </div>
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Utensils,
      name: "d'FoodCourt",
      description: "Various dining options and cuisines",
      href: "#",
      cta: "See Restaurants",
      background: (
        <div className="absolute inset-0">
          <img 
            src="https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/karawaci-supermall-food-court-corner-area-simple-tangerang-indonesia-july-karawaci-supermall-food-court-corner-area-327678437.webp?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Food Court"
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent"></div>
        </div>
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Baby,
      name: "Kids Area",
      description: "Safe and fun playground for children",
      href: "#",
      cta: "Learn More",
      background: (
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Kids Area"
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent"></div>
        </div>
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3",
    },
    {
      Icon: Film,
      name: "Cinema",
      description: "Modern movie theaters",
      href: "#",
      cta: "Check Showtimes",
      background: (
        <div className="absolute inset-0">
          <img 
            src="https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/supermal-karawaci-xxi-tangerang_430x280.webp?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Cinema"
            className="w-full h-full object-cover opacity-40" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent"></div>
        </div>
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
    },
    {
      Icon: Wifi,
      name: "Free WiFi",
      description: "High-speed internet access",
      href: "#",
      cta: "Connect Now",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-gold/20" />
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: CreditCard,
      name: "ATM Center",
      description: "Multiple ATMs and money changers",
      href: "#",
      cta: "Find Location",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-primary/60" />
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: Info,
      name: "Information Center",
      description: "Customer service and mall information",
      href: "#",
      cta: "Get Help",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-gold/20" />
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4",
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Our <span className="text-gold">Facilities</span>
          </h2>
          <p className="text-lg md:text-xl text-white-600 max-w-2xl mx-auto">
            Everything you need for a comfortable shopping experience
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <BentoGrid className="lg:grid-rows-3">
            {facilities.map((facility) => (
              <BentoCard key={facility.name} {...facility} />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
};

export default Facilities;