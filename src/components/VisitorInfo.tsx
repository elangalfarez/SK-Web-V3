import React from 'react';
import { MapPin, Clock, Car, Phone, Mail, Navigation } from 'lucide-react';

const VisitorInfo = () => {
  const infoItems = [
    {
      icon: MapPin,
      title: "Location & Map",
      details: [
        "Jl. Boulevard Diponegoro No. 105",
        "Klp. Dua, Kec. Karawaci",
        "Kota Tangerang, Banten 15115"
      ],
      action: "Get Directions"
    },
    {
      icon: Clock,
      title: "Opening Hours",
      details: [
        "Monday - Sunday / Public Holiday: 10:00 AM - 10:00 PM",
      ],
    },
    {
      icon: Car,
      title: "Parking Information",
      details: [
        "3,000+ parking spaces available",
        "Valet parking service available"
      ],
      action: "Parking Rates"
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+62 21 5466666",
      href: "tel:+62215466666"
    },
    {
      icon: Mail,
      label: "Email",
      value: "contact.us@supermalkarawaci.com",
      href: "mailto:contact.us@supermalkarawaci.com"
    },
    {
      icon: Navigation,
      label: "Customer Service VIP",
      value: "Ground Floor, Main Lobby",
      href: "#"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-onyx-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Visitor <span className="text-gold">Information</span>
          </h2>
          <p className="text-lg md:text-xl text-white-600 max-w-2xl mx-auto">
            Everything you need to know for a perfect visit
          </p>
        </div>
        
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {infoItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-royal-purple/20 rounded-full group-hover:bg-gold/30 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary ml-4">{item.title}</h3>
              </div>
              
              <div className="space-y-2 mb-4 md:mb-6">
                {item.details.map((detail, detailIndex) => (
                  <p key={detailIndex} className="text-gray-600 text-sm leading-relaxed">
                    {detail}
                  </p>
                ))}
              </div>
              
              {item.action && (
                <button className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-royal-purple hover:shadow-lg transition-all duration-300">
                  {item.action}
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-primary mb-6 text-center">Contact Information</h3>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {contactInfo.map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="p-2 bg-royal-purple/20 rounded-full group-hover:bg-gold/30 transition-colors">
                  <contact.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-primary">{contact.label}</p>
                  <p className="text-sm text-gray-600">{contact.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitorInfo;