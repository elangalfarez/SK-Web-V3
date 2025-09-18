// src/components/Navbar.tsx
// Updated: More suitable icons for each submenu and removed CSR menu

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { 
  Store, 
  Map, 
  Tag, 
  Calendar, 
  BookOpen,
  Phone, 
  MessageCircle
} from 'lucide-react';
import MegaMenu from './ui/mega-menu';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const megaMenuItems = [
    {
      label: 'Home',
      link: '/',
    },
    {
      label: 'Directory',
      subMenus: [
        {
          title: 'Explore Our Mall',
          items: [
            {
              label: 'Mall Directory',
              description: 'Find all stores, restaurants, and services',
              icon: Store,
              href: '/directory',
            },
            {
              label: 'Floor Plan',
              description: 'Interactive mall map and navigation',
              icon: Map,
              href: '#',
            },
          ],
        },
      ],
    },
    {
      label: "What's On",
      subMenus: [
        {
          title: 'Current Happenings',
          items: [
            {
              label: 'Promotions',
              description: 'Latest deals and special offers',
              icon: Tag,
              href: '/promotions',
            },
            {
              label: 'Events',
              description: 'Upcoming activities and entertainment',
              icon: Calendar,
              href: '/event',
            },
            {
              label: 'Blog',
              description: 'Latest articles and insights',
              icon: BookOpen,
              href: '/blog',
            },
          ],
        },
      ],
    },
    {
      label: 'VIP Card',
      link: '/vip-cards',
    },
    {
      label: 'Contact',
      subMenus: [
        {
          title: 'Get in Touch',
          items: [
            {
              label: 'Contact Us',
              description: 'Send us a message or find our contact details',
              icon: Phone,
              href: '/contact',
            },
            {
              label: 'Feedback',
              description: 'Share your experience with us',
              icon: MessageCircle,
              href: '/contact',
            },
          ],
        },
      ],
    },
  ];

  const mobileMenuItems = [
    { name: 'Home', href: '/' },
    {
      name: 'Directory',
      href: '/directory',
      submenu: [
        { name: 'Mall Directory', href: '/directory' },
        { name: 'Floor Plan', href: '#' }
      ]
    },
    {
      name: "What's On",
      href: '#',
      submenu: [
        { name: 'Promotions', href: '/promotions' },
        { name: 'Events', href: '/event' },
        { name: 'Blog', href: '/blog' }
      ]
    },
    { name: 'VIP Card', href: '/vip-cards' },
    { name: 'Contact', href: '/contact' }
  ];

  const handleDropdownToggle = (itemName: string) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-surface shadow-lg border-b border-border-primary'
            : 'bg-surface shadow-sm border-b border-border-secondary'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="flex items-center">
                <img
                  src="https://supermalkarawaci.co.id/core/wp-content/uploads/2025/07/LOGO-SK-Tulisan-Putih-scaled.png"
                  alt="Supermal Karawaci"
                  className="h-16 w-auto"
                />
              </a>
            </div>

            {/* Desktop Mega Menu */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <MegaMenu items={megaMenuItems} className="font-medium" />
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex justify-end">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="nav-link"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden transition-all duration-300 overflow-hidden ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-4 space-y-2 border-t border-border-primary">
              {mobileMenuItems.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => handleDropdownToggle(item.name)}
                        className="flex items-center justify-between w-full text-left px-4 py-2 nav-link rounded-lg"
                      >
                        {item.name}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            activeDropdown === item.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      {/* Mobile Submenu */}
                      <div
                        className={`ml-4 mt-1 space-y-1 transition-all duration-200 ${
                          activeDropdown === item.name
                            ? 'max-h-32 opacity-100'
                            : 'max-h-0 opacity-0 overflow-hidden'
                        }`}
                      >
                        {item.submenu.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            onClick={handleMobileMenuClose}
                            className="block px-4 py-2 text-sm body-text-muted hover:bg-accent-subtle hover:text-accent transition-colors duration-200 rounded-lg"
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      onClick={handleMobileMenuClose}
                      className="block px-4 py-2 nav-link rounded-lg"
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Accent decorative lines under navbar */}
      <div className="fixed top-20 left-0 right-0 z-40">
        <div className="h-1 bg-gradient-to-r from-accent via-accent to-accent"></div>
        <div className="h-0.5 bg-accent/60"></div>
      </div>
    </>
  );
};

export default Navbar;