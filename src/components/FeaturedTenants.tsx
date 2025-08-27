// src/components/FeaturedTenants.tsx
import React from 'react';
import { Star } from 'lucide-react';

const FeaturedTenants = () => {
  const tenants = [
    {
      name: "Gino Mariani",
      category: "Fashion & Lifestyle",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/06/SnapInsta.to_501963295_18515755630054941_33900734510398049_n.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      featured: true
    },
    {
      name: "M&G Life",
      category: "Entertainment",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/06/SnapInsta.to_502247740_18516494998054941_6968524714097791824_n.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      featured: true
    },
    {
      name: "Top Toy",
      category: "Entertainment",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/toppers-toy.jpg",
      featured: true
    },
    {
      name: "Steak 21",
      category: "Food & Beverages",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-02-at-15.38.57_e59ecc65-scaled.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      featured: true
    },
    {
      name: "Diamond & Co",
      category: "Jewellry & Watches",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-02-at-15.39.05_fc5e7514-scaled.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      featured: true
    },
    {
      name: "Nanyang Dashifu",
      category: "Food & Beverages",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-02-at-15.39.08_dbd8bf23-scaled.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      featured: true
    },
    {
      name: "Birkenstock",
      category: "Fashion & Lifestyle",
      image: "https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/WhatsApp-Image-2025-07-02-at-15.39.07_b7a7e03a-scaled.jpg?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      featured: true
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-surface-tertiary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="heading-primary">New</span> <span className="heading-accent">Openings</span>
          </h2>
          <p className="text-lg md:text-xl body-text max-w-2xl mx-auto">
            Discover new tenants at Supermal Karawaci
          </p>
        </div>
        
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 md:space-x-6 pb-4" style={{ width: 'max-content' }}>
            {tenants.map((tenant, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-64 md:w-72 card card-hover group"
              >
                <div className="relative">
                  <img 
                    src={tenant.image}
                    alt={tenant.name}
                    className="w-full h-40 md:h-48 object-cover rounded-t-2xl"
                  />
                  {tenant.featured && (
                    <div className="absolute top-4 right-4 bg-accent text-text-inverse px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-lg">
                      <Star className="w-4 h-4 mr-1" />
                      Now Open!
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-bold heading-primary mb-2">{tenant.name}</h3>
                  <p className="body-text-muted mb-4">{tenant.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTenants;