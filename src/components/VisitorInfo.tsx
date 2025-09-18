// src/components/VisitorInfo.tsx
// Fixed: Replaced all hardcoded colors with theme-aware CSS variables and semantic tokens

import React from 'react';
import { MapPin, Clock, Phone, Mail, Car, Info as InfoIcon, Accessibility, Wifi } from 'lucide-react';

const VisitorInfo = () => {
  const infoCards = [
    {
      icon: Clock,
      title: "Opening Hours",
      content: "Daily: 10:00 AM - 10:00 PM",
      description: "Including public holidays",
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
      description: "Valet parking and EV charging stations are also available",
    },
    {
      icon: Wifi,
      title: "Free WiFi",
      content: "SK Linknet Free WIFI",
      description: "High-speed internet throughout the mall",
    },
    {
      icon: Accessibility,
      title: "Accessibility",
      content: "Wheelchair & Stroller available",
      description: "We have wheelchairs and strollers available at each lobby",
    },
    {
      icon: InfoIcon,
      title: "Customer Service VIP",
      content: "Ground Floor, Main Lobby",
      description: "VIP Member, lost & found, information, and assistance",
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
    <section className="py-12 md:py-20 bg-surface-tertiary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="heading-primary">Visitor</span> <span className="heading-accent">Information</span>
          </h2>
          <p className="text-lg md:text-xl body-text max-w-2xl mx-auto">
            Everything you need to know for your perfect visit
          </p>
        </div>
        
        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {infoCards.map((item, index) => (
            <div key={index} className="card card-hover p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-accent-subtle rounded-xl">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-text-primary font-medium mb-2">{item.content}</p>
                <p className="text-text-muted text-sm">{item.description}</p>
              </div>
              
              {item.action && (
                <button className="text-accent hover:text-accent-hover hover:bg-accent-subtle py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg">
                  {item.action}
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Contact Information */}
        <div className="card p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-6 text-center">Contact Information</h3>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {contactInfo.map((contact, index) => (
              <a
                key={index}
                href={contact.href}
                className="flex items-center p-4 bg-surface-tertiary rounded-lg hover:bg-accent-subtle hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-2 bg-accent-subtle rounded-full group-hover:bg-accent group-hover:text-text-inverse transition-colors">
                  <contact.icon className="w-5 h-5 text-accent group-hover:text-text-inverse" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-text-primary">{contact.label}</p>
                  <p className="text-sm text-text-secondary">{contact.value}</p>
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