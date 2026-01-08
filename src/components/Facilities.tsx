// src/components/Facilities.tsx
// Modified: Added modal popups for facilities (Parking, Kids Area, d'FoodCourt, ATM, WiFi, Info Center)
// Shopping Area and Cinema remain as navigation links

import { useState } from 'react';
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
import { FacilityModal, FacilityModalContent } from '@/components/ui/facility-modal';

// Define modal content for each facility
const facilityModalContent: Record<string, FacilityModalContent> = {
  parking: {
    name: "Parking Space",
    subtitle: "Spacious and secure parking areas for your convenience",
    Icon: Car,
    imageUrl: "https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/parkir%20knockdown.jpeg",
    sections: [
      {
        title: "Car Parking Rate",
        items: [
          { name: "First 1 hour", description: "Rp 5,000" },
          { name: "Every subsequent hour", description: "Rp 5,000" },
        ],
      },
      {
        title: "Motorcycle Parking Rate",
        items: [
          { name: "First 1 hour", description: "Rp 3,000" },
          { name: "Every subsequent hour", description: "Rp 2,000" },
        ],
      },
    ],
    footnote: "*Tariff is subject to change without prior notice",
  },
  kidsArea: {
    name: "Kids Area",
    subtitle: "Safe and fun entertainment zones for children",
    Icon: Baby,
    imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sections: [
      {
        title: "Entertainment Venues",
        items: [
          { name: "Timezone", description: "Arcade games and entertainment" },
          { name: "Playtopia Playground", description: "Indoor playground for kids" },
          { name: "Playtopia Arcade", description: "Arcade gaming experience" },
          { name: "Playtopia Sports", description: "Sports and active play zone" },
          { name: "DinoxScape", description: "Dinosaur-themed adventure" },
          { name: "Free Kids Playground", description: "Complimentary play area at d'Food Court" },
        ],
      },
    ],
  },
  foodCourt: {
    name: "d'FoodCourt",
    subtitle: "Delicious dining options for every taste",
    Icon: Utensils,
    imageUrl: "https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/dfoodcourt.jpeg",
    sections: [
      {
        title: "About d'FoodCourt",
        content: (
          <p className="text-text-secondary leading-relaxed">
            Our d'FoodCourt offers a wide variety of culinary options from local favorites to international cuisines.
            With numerous food stalls and comfortable seating areas, it's the perfect spot for family meals,
            quick bites, or gathering with friends. Enjoy affordable and delicious meals in a vibrant atmosphere.
          </p>
        ),
      },
    ],
  },
  atm: {
    name: "ATM Center",
    subtitle: "Convenient banking services throughout the mall",
    Icon: CreditCard,
    imageUrl: "https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/atm.jpg",
    sections: [
      {
        title: "ATM Locations",
        items: [
          { name: "East Basement", description: "Multiple ATM machines available" },
          { name: "West Basement", description: "Multiple ATM machines available" },
        ],
      },
      {
        title: "Banking Tenants at First Floor",
        items: [
          { name: "BCA" },
          { name: "Mandiri" },
          { name: "Danamon" },
          { name: "BTN" },
          { name: "CIMB Niaga Digital Lounge" },
        ],
      },
    ],
  },
  wifi: {
    name: "Free WiFi",
    subtitle: "Stay connected throughout your visit",
    Icon: Wifi,
    imageUrl: "https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/wifi.jpg",
    sections: [
      {
        title: "WiFi Service",
        content: (
          <p className="text-text-secondary leading-relaxed">
            Free high-speed WiFi is provided throughout Supermal Karawaci, powered by <strong className="text-text-primary">Linknet</strong>.
            Connect to our network and enjoy seamless internet access while you shop, dine, and explore.
          </p>
        ),
      },
    ],
  },
  infoCenter: {
    name: "Information Center",
    subtitle: "Customer service and mall assistance",
    Icon: Info,
    imageUrl: "https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/CS%20Main%20Lobby%202.jpeg",
    sections: [
      {
        title: "Customer Service Locations",
        items: [
          { name: "CS VIP Counter", description: "VIP membership services and inquiries" },
          { name: "CS North Lobby", description: "Main entrance assistance" },
          { name: "CS South Lobby", description: "South wing customer support" },
          { name: "CS eCenter", description: "Electronics center assistance" },
          { name: "CS West Lobby", description: "West wing information desk" },
        ],
      },
    ],
  },
};

const Facilities = () => {
  const [selectedFacility, setSelectedFacility] = useState<FacilityModalContent | null>(null);

  const handleOpenModal = (facilityKey: string) => {
    setSelectedFacility(facilityModalContent[facilityKey]);
  };

  const handleCloseModal = () => {
    setSelectedFacility(null);
  };

  const facilities = [
    {
      Icon: Store,
      name: "Shopping Area",
      description: "Wide variety of retail stores and boutiques",
      href: "/directory",
      cta: "Explore Stores",
      background: (
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Shopping Area"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/40 to-transparent"></div>
        </div>
      ),
      className: "lg:row-start-1 lg:row-end-3 lg:col-start-1 lg:col-end-2",
    },
    {
      Icon: Car,
      name: "Parking Space",
      description: "Spacious and secure parking areas",
      onClick: () => handleOpenModal('parking'),
      background: (
        <div className="absolute inset-0">
          <img
            src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/parkir%20knockdown.jpeg"
            alt="Parking"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/40 to-transparent"></div>
        </div>
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Utensils,
      name: "d'FoodCourt",
      description: "Various dining options and cuisines",
      onClick: () => handleOpenModal('foodCourt'),
      background: (
        <div className="absolute inset-0">
          <img
            src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/dfoodcourt.jpeg"
            alt="Food Court"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        </div>
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
    },
    {
      Icon: Baby,
      name: "Kids Area",
      description: "Safe and fun playground for children",
      onClick: () => handleOpenModal('kidsArea'),
      background: (
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Kids Area"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        </div>
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
    },
    {
      Icon: Film,
      name: "Cinema",
      description: "Modern movie theaters",
      href: "/movies",
      cta: "View Showtimes",
      background: (
        <div className="absolute inset-0">
          <img
            src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/Tenants%20Photo/XXI%20Cinema.jpg"
            alt="Cinema"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>
        </div>
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3",
    },
    {
      Icon: Wifi,
      name: "Free WiFi",
      description: "High-speed internet access",
      onClick: () => handleOpenModal('wifi'),
      background: (
        <div className="absolute inset-0">
          <img
            src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/wifi.jpg"
            alt="WiFi"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>
        </div>
      ),
      className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: CreditCard,
      name: "ATM Center",
      description: "Multiple ATMs and money changers",
      onClick: () => handleOpenModal('atm'),
      background: (
        <div className="absolute inset-0">
          <img
            src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/atm.jpg"
            alt="ATM Center"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>
        </div>
      ),
      className: "lg:col-start-2 lg:col-end-3 lg:row-start-3 lg:row-end-4",
    },
    {
      Icon: Info,
      name: "Information Center",
      description: "Customer service and mall information",
      onClick: () => handleOpenModal('infoCenter'),
      background: (
        <div className="absolute inset-0">
          <img
            src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/CS%20Main%20Lobby%202.jpeg"
            alt="Information Center"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30"></div>
        </div>
      ),
      className: "lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-4",
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="heading-primary">Our</span> <span className="heading-accent">Facilities</span>
          </h2>
          <p className="text-lg md:text-xl body-text max-w-2xl mx-auto">
            Everything you need for a comfortable shopping experience
          </p>
        </div>

        <BentoGrid className="lg:grid-rows-3">
          {facilities.map((facility) => (
            <BentoCard
              key={facility.name}
              {...facility}
              darkBackground={true}
            />
          ))}
        </BentoGrid>
      </div>

      {/* Facility Detail Modal */}
      <FacilityModal
        content={selectedFacility}
        isOpen={selectedFacility !== null}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Facilities;
