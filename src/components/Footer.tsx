// src/components/Footer.tsx
import React, { useState } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock, Car, Wifi, Shield, User, Gift, CreditCard } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  const quickLinks = [
    { name: "Store Directory", href: "#" },
    { name: "Dining Guide", href: "#" },
    { name: "Events Calendar", href: "#" },
    { name: "Promotions", href: "#" },
    { name: "Gift Cards", href: "#" },
    { name: "Career Opportunities", href: "#" }
  ];

  const services = [
    { 
      name: "Spacious Parking", 
      description: "3000+ spaces",
      icon: Car
    },
    { 
      name: "Free WiFi", 
      description: "High-speed internet",
      icon: Wifi
    },
    { 
      name: "Multiple Payment", 
      description: "Cash, card, e-wallet",
      icon: CreditCard
    },
    { 
      name: "24/7 Security", 
      description: "Safe & secure",
      icon: Shield
    },
    { 
      name: "Gift Wrapping", 
      description: "Complimentary service",
      icon: Gift
    },
    { 
      name: "Customer Service", 
      description: "Always ready to help",
      icon: User
    }
  ];

  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" }
  ];

  return (
    <footer className="relative overflow-hidden bg-white">
      {/* Purple accent background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-50"></div>
      
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-royal-purple rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-royal-purple rounded-full translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-royal-purple rounded-full -translate-x-32 -translate-y-32"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-16 text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <img
              src="https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/LOGO-SK-Tulisan-Putih-scaled.png"
              alt="Supermal Karawaci"
              className="h-16 md:h-20 w-auto mx-auto md:mx-0 filter invert"
            />
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="text-center">
              <MapPin className="w-6 h-6 text-royal-purple mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">Tangerang</p>
            </div>
            <div className="text-center">
              <Phone className="w-6 h-6 text-royal-purple mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">+62 21 5466666</p>
            </div>
            <div className="text-center">
              <Clock className="w-6 h-6 text-royal-purple mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">10 AM - 10 PM</p>
            </div>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-royal-purple mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-600 hover:text-royal-purple transition-colors text-sm font-medium">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services Grid */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-lg font-semibold text-royal-purple mb-6">Our Services</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.name} className="flex items-start space-x-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100">
                  <div className="p-2 bg-royal-purple/10 rounded-lg">
                    <service.icon className="w-5 h-5 text-royal-purple" />
                  </div>
                  <div>
                    <h5 className="text-primary-text font-medium text-sm">{service.name}</h5>
                    <p className="text-gray-600 text-xs">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-royal-purple mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-royal-purple mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Jl. Boulevard Diponegoro No. 105<br />
                    Klp. Dua, Kec. Karawaci<br />
                    Kota Tangerang, Banten 15115
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-royal-purple flex-shrink-0" />
                <p className="text-sm text-gray-700">contact.us@supermalkarawaci.com</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="border-t border-purple-200 pt-8 md:pt-12 mb-8 md:mb-12">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-primary-text mb-2">Stay Connected</h3>
            <p className="text-gray-600">Subscribe to our newsletter for exclusive offers, events, and updates</p>
          </div>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-purple-50 border border-purple-200 text-primary-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-purple focus:border-transparent transition-all"
                required
              />
              <button
                type="submit"
                disabled={isSubmitted}
                className="px-6 py-3 bg-royal-purple text-white font-semibold rounded-lg hover:bg-dark-purple focus:outline-none focus:ring-2 focus:ring-royal-purple transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitted ? 'Subscribed!' : 'Subscribe'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-purple-200 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4 md:mb-0 text-center sm:text-left">
            <p className="text-gray-600 text-sm">© 2025 Supermal Karawaci. All rights reserved.</p>
            <div className="flex flex-wrap justify-center sm:justify-start space-x-4 text-sm">
              <a href="#" className="text-gray-600 hover:text-royal-purple transition-colors">Privacy Policy</a>
              <span className="text-gray-400">•</span>
              <a href="#" className="text-gray-600 hover:text-royal-purple transition-colors">Terms of Service</a>
              <span className="text-gray-400">•</span>
              <a href="#" className="text-gray-600 hover:text-royal-purple transition-colors">Cookie Policy</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span className="text-gray-600 text-sm mr-3">Follow us:</span>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-full flex items-center justify-center hover:bg-royal-purple hover:border-royal-purple hover:text-white transition-colors group"
              >
                <social.icon className="w-5 h-5 text-royal-purple group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;