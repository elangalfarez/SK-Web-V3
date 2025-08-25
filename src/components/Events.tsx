import React from 'react';
import { CardCarousel } from '@/components/ui/card-carousel';

const Events = () => {
  const events = [
    {
      id: 1,
      title: "Baba Lili Tata Beach Party",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/WhatsApp-Image-2025-06-28-at-15.10.14_4261ce1f-scaled.jpg",
      date: "12 June - 13 Jul 2025",
      time: "10:00 AM - 10:00 PM",
      location: "Ground Floor, Grand Atrium",
      description: "Baba Lili Tata 1st Live Show in Jabodetabek. Join us for an exciting beach-themed party with live performances, games, and entertainment for the whole family.",
      category: "Kids Entertainment"
    },
    {
      id: 2,
      title: "Gramedia Back to School",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/WhatsApp-Image-2025-06-17-at-16.11.23_8471f426-scaled.jpg",
      date: "17 June - 13 July 2025",
      time: "10:00 AM - 10:00 PM",
      location: "Upper Ground, Kids Atrium",
      description: "Get ready for the new school year with our comprehensive back-to-school collection. Find everything from stationeries, books, and school supplies for your kids.",
      category: "Shopping"
    },
    {
      id: 3,
      title: "Gramedia Big Sale",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-02-at-14.42.40_d70e7702-scaled.jpg",
      date: "1 - 27 July 2025",
      time: "10:00 AM - 10:00 PM",
      location: "First Floor, East Dome",
      description: "Don't miss our biggest sale of the year! Get up to 70% discount on stationery and book supplies. Perfect time to stock up on your favorite items.",
      category: "Sale"
    },
    {
      id: 4,
      title: "Pets Nation Festival Vol. 2",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "15 - 20 August 2025",
      time: "2:00 PM - 9:00 PM",
      location: "Upper Ground, Kids Atrium",
      description: "Pets Nation Fest Vol 2.",
      category: "Fashion"
    },
    {
      id: 5,
      title: "Food Festival Extravaganza",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "25 - 30 August 2025",
      time: "11:00 AM - 11:00 PM",
      location: "Ground Floor, Central Court",
      description: "Taste the best of Indonesian and international cuisine. Food trucks, cooking demonstrations, and special discounts from our restaurant partners.",
      category: "Food & Beverage"
    },
    {
      id: 6,
      title: "Tech Innovation Expo",
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "5 - 10 September 2025",
      time: "10:00 AM - 8:00 PM",
      location: "Third Floor, Tech Hub",
      description: "Explore the latest technology trends, gadgets, and innovations. Interactive demos, workshops, and exclusive product launches.",
      category: "Technology"
    },
    {
      id: 7,
      title: "Art & Culture Festival",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "15 - 22 September 2025",
      time: "9:00 AM - 9:00 PM",
      location: "First Floor, Cultural Wing",
      description: "Celebrate Indonesian art and culture with exhibitions, performances, and workshops. Local artists showcase their talents in various mediums.",
      category: "Culture"
    },
    {
      id: 8,
      title: "Holiday Shopping Carnival",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "1 - 31 December 2025",
      time: "10:00 AM - 10:00 PM",
      location: "All Floors",
      description: "Get ready for the holiday season with amazing discounts, gift wrapping services, and special holiday decorations throughout the mall.",
      category: "Holiday Special"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Current <span className="text-gold">Events</span>
          </h2>
          <p className="text-lg md:text-xl text-white-600 max-w-2xl mx-auto">
            Don't miss out on our exciting events and exclusive promotions
          </p>
        </div>
        
        <CardCarousel
          events={events}
          autoplayDelay={3000}
          showPagination={true}
          showNavigation={true}
        />
      </div>
    </section>
  );
};

export default Events;