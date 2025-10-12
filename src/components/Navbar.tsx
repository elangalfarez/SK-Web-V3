// src/components/Navbar.tsx
// Modified: Fixed theme toggle placement - now beside hamburger menu, not inside mobile menu

import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { 
  Store, 
  MapPin, 
  FileText, 
  Calendar, 
  Gift,  
  Phone, 
  Heart
} from 'lucide-react';
import MegaMenu from '@/components/ui/mega-menu';
import ThemeToggle from '@/components/ui/theme-toggle';
import { useTheme } from '@/lib/theme-config';
import type { MegaMenuItem } from '@/components/ui/mega-menu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { currentTheme, isLoading } = useTheme();

  // Theme-specific logo URLs with lazy loading
  const logoConfig = {
    light: {
      src: 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Logo/Logo%20SK%20Hitam-Compress.png',
      alt: 'Supermal Karawaci - Black Logo'
    },
    dark: {
      src: 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Logo/Logo%20SK%20Putih-Compress.png', 
      alt: 'Supermal Karawaci - White Logo'
    }
  };

  const currentLogo = logoConfig[currentTheme] || logoConfig.light;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Preload both logo images for instant switching
    const preloadLogos = () => {
      Object.values(logoConfig).forEach(logo => {
        const img = new Image();
        img.src = logo.src;
      });
    };
    
    preloadLogos();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const megaMenuItems: MegaMenuItem[] = [
    { id: 1, label: 'Home', link: '/' },
    {
      id: 2,
      label: 'Directory',
      subMenus: [
        {
          title: 'Browse',
          items: [
            {
              label: 'Mall Directory',
              description: 'Complete list of all stores and services',
              icon: Store,
              href: '/directory',
            },
            {
              label: 'Floor Plan',
              description: 'Interactive mall map and navigation',
              icon: MapPin,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      label: "What's On",
      subMenus: [
        {
          title: 'Current',
          items: [
            {
              label: 'Promotions',
              description: 'Latest deals and special offers',
              icon: Gift,
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
              icon: FileText,
              href: '/blog',
            },
          ],
        },
      ],
    },
    { id: 4, label: 'VIP Card', link: '/vip-cards' },
    {
      id: 6,
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
              icon: Heart,
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'backdrop-blur-md shadow-xl'
            : 'shadow-lg'
        }`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border-primary)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="flex items-center group">
                <img
                  key={`logo-${currentTheme}`} // Force re-render on theme change
                  src={currentLogo.src}
                  alt={currentLogo.alt}
                  className="h-16 w-auto transition-all duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to light theme logo if image fails to load
                    const target = e.target as HTMLImageElement;
                    if (target.src !== logoConfig.light.src) {
                      target.src = logoConfig.light.src;
                    }
                  }}
                />
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <MegaMenu items={megaMenuItems} className="font-medium" />
            </div>

            {/* Actions - Desktop and Mobile */}
            <div className="flex items-center space-x-3">
              {/* Desktop Theme Toggle */}
              <div className="hidden lg:block">
                {/* <ThemeToggle variant="default" />*/}
              </div>

              {/* Mobile Actions - Theme Toggle + Hamburger Menu */}
              <div className="lg:hidden flex items-center space-x-3">
                {/* Mobile Theme Toggle - Beside hamburger menu */}
                 {/* <ThemeToggle variant="compact" />*/}
                
                {/* Mobile Hamburger Menu Button */}
                <button
                  className="p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  onClick={toggleMobileMenu}
                  aria-label="Toggle mobile menu"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-primary)',
                  }}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu - NO theme toggle inside */}
          <div
            className={`lg:hidden transition-all duration-300 overflow-hidden ${
              isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div 
              className="py-4 space-y-2 border-t mx-4 mb-4 rounded-b-xl"
              style={{
                borderTopColor: 'var(--color-border-primary)',
                backgroundColor: 'var(--color-surface-secondary)',
              }}
            >
              {/* Mobile Menu Items - Theme toggle removed from here */}
              {mobileMenuItems.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => handleDropdownToggle(item.name)}
                        className="flex items-center justify-between w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                        style={{
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            activeDropdown === item.name ? 'rotate-180' : ''
                          }`}
                          style={{
                            color: activeDropdown === item.name ? 'var(--color-accent)' : 'currentColor'
                          }}
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
                            className="block px-4 py-2 text-sm rounded-lg transition-colors duration-200"
                            style={{
                              color: 'var(--color-text-muted)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-accent-subtle)';
                              e.currentTarget.style.color = 'var(--color-accent)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'var(--color-text-muted)';
                            }}
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
                      className="block px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                      style={{
                        color: 'var(--color-text-primary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
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

      {/* Accent decorative lines */}
      <div className="fixed top-20 left-0 right-0 z-40">
        <div 
          className="h-1 shadow-sm"
          style={{
            background: 'linear-gradient(to right, var(--color-accent), var(--color-accent), var(--color-accent))',
          }}
        ></div>
        <div 
          className="h-0.5"
          style={{
            backgroundColor: 'var(--color-accent)',
            opacity: '0.6',
          }}
        ></div>
      </div>
    </>
  );
};

export default Navbar;