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
    <footer className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-primary"></div>
      
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gold rounded-full -translate-x-32 -translate-y-32"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <img
                src="https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/LOGO-SK-Tulisan-Putih-scaled.png"
                alt="Supermal Karawaci"
                className="h-12 w-auto mr-3"
              />
              <h3 className="text-xl font-bold text-white">Supermal Karawaci</h3>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              Your premier shopping and lifestyle destination in Tangerang, offering world-class retail, dining, and entertainment experiences.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start text-blue-200">
                <MapPin className="w-4 h-4 mr-3 mt-1 flex-shrink-0 text-gold" />
                <div className="text-sm">
                  <p className="font-medium text-white">Supermal Karawaci</p>
                  <p>Jl. Boulevard Diponegoro No.105</p>
                  <p>Klp. Dua, Tangerang, Banten 15810</p>
                </div>
              </div>
              
              <div className="flex items-center text-blue-200">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0 text-gold" />
                <a href="tel:+62215460123" className="text-sm hover:text-white transition-colors">
                  (021) 546-0123
                </a>
              </div>
              
              <div className="flex items-center text-blue-200">
                <Mail className="w-4 h-4 mr-3 flex-shrink-0 text-gold" />
                <a href="mailto:contact.us@supermalkarawaci.com" className="text-sm hover:text-white transition-colors">
                  contact.us@supermalkarawaci.com
                </a>
              </div>
              
              <div className="flex items-center text-blue-200">
                <Clock className="w-4 h-4 mr-3 flex-shrink-0 text-gold" />
                <span className="text-sm">Daily 10:00 - 22:00</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-blue-200 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services Grid */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-lg font-semibold text-gold mb-6">Our Services</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <div key={service.name} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-gold/20 rounded-lg">
                    <service.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h5 className="text-white font-medium text-sm">{service.name}</h5>
                    <p className="text-blue-200 text-xs">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Newsletter Section */}
        <div className="border-t border-white/10 pt-8 md:pt-12 mb-8 md:mb-12">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Stay Connected</h3>
            <p className="text-blue-200">Subscribe to our newsletter for exclusive offers, events, and updates</p>
          </div>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                required
              />
              <button
                type="submit"
                disabled={isSubmitted}
                className="px-6 py-3 bg-gold text-primary font-semibold rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-gold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isSubmitted ? 'Subscribed!' : 'Subscribe'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4 md:mb-0 text-center sm:text-left">
            <p className="text-blue-200 text-sm">© 2025 Supermal Karawaci. All rights reserved.</p>
            <div className="flex flex-wrap justify-center sm:justify-start space-x-4 text-sm">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-blue-300">•</span>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">Terms of Service</a>
              <span className="text-blue-300">•</span>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span className="text-blue-200 text-sm mr-3">Follow us:</span>
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors group"
              >
                <social.icon className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;