// src/components/VisitorInfo.tsx
import React from 'react';
import { MapPin, Clock, Phone, Mail, Car, Info as InfoIcon, Accessibility, Wifi } from 'lucide-react';

const VisitorInfo = () => {
  const infoCards = [
    {
      icon: Clock,
      title: "Opening Hours",
      content: "Daily: 10:00 AM - 10:00 PM",
      description: "Extended hours during holidays",
      action: "View Holiday Hours"
    },
    {
      icon: MapPin,
      title: "Location & Directions",
      content: "105 Boulevard Diponegoro #00-00, Tangerang",
      description: "Easy access via toll road and public transport",
      action: "Get Directions"
    },
    {
      icon: Car,
      title: "Parking Information",
      content: "3000+ spaces available",
      description: "Valet parking and EV charging stations",
      action: "Find Parking"
    },
    {
      icon: Wifi,
      title: "Free WiFi",
      content: "SupermalFreeWiFi",
      description: "High-speed internet throughout the mall",
      action: "Connect Now"
    },
    {
      icon: Accessibility,
      title: "Accessibility",
      content: "Wheelchair accessible",
      description: "Elevators, ramps, and accessible restrooms",
      action: "Learn More"
    },
    {
      icon: InfoIcon,
      title: "Customer Service VIP",
      content: "Ground Floor, Main Lobby",
      description: "Lost & found, information, and assistance",
      action: "Contact Us"
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "+62 21 5466 666",
      href: "tel:+62215460666"
    },
    {
      icon: Mail,
      label: "Email",
      value: "contact.us@supermalkarawaci.com",
      href: "mailto:contact.us@supermalkarawaci.com"
    },
    {
      icon: MapPin,
      label: "Address",
      value: "Supermal Karawaci, 105 Boulevard Diponegoro #00-00",
      href: "#"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Visitor <span className="text-royal-purple">Information</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know for your perfect visit
          </p>
        </div>
        
        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {infoCards.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <item.icon className="w-6 h-6 text-royal-purple" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-900 font-medium mb-2">{item.content}</p>
                <p className="text-gray-500 text-sm">{item.description}</p>
              </div>
              
              {item.action && (
                <button className="text-royal-purple hover:text-dark-purple hover:bg-purple-50 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg">
                  {item.action}
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">Contact Information</h3>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {contactInfo.map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-purple-50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-2 bg-purple-100 rounded-full group-hover:bg-royal-purple group-hover:text-white transition-colors">
                  <contact.icon className="w-5 h-5 text-royal-purple group-hover:text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-900">{contact.label}</p>
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