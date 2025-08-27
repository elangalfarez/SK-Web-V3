// src/components/ui/mega-menu.tsx
'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface MegaMenuItem {
  id: number;
  label: string;
  link?: string;
  subMenus?: {
    title: string;
    items: {
      label: string;
      description: string;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

interface MegaMenuProps {
  items: MegaMenuItem[];
  className?: string;
}

const MegaMenu = forwardRef<HTMLUListElement, MegaMenuProps>(
  ({ items, className = '' }, ref) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout>();

    const handleMenuEnter = (label: string) => {
      // Clear any pending close timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }

      // Immediately set this as the active menu (clears all other hover states)
      setActiveMenu(label);
      
      // If this menu has submenus, open the dropdown
      const hasSubmenus = items.find(item => item.label === label)?.subMenus;
      if (hasSubmenus) {
        setOpenDropdown(label);
      } else {
        setOpenDropdown(null);
      }
    };

    const handleMenuLeave = () => {
      // Clear active menu immediately for visual feedback
      setActiveMenu(null);
      
      // Set timeout to close dropdown (allows moving to submenu)
      closeTimeoutRef.current = setTimeout(() => {
        setOpenDropdown(null);
      }, 150);
    };

    const handleDropdownEnter = () => {
      // Cancel close when entering dropdown
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }
    };

    const handleDropdownLeave = () => {
      // Immediately close everything when leaving dropdown
      setActiveMenu(null);
      setOpenDropdown(null);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = undefined;
      }
    };

    useEffect(() => {
      return () => {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
      };
    }, []);

    return (
      <ul ref={ref} className={`flex items-center space-x-8 ${className}`}>
        {items.map((navItem) => (
          <li key={navItem.id} className="relative">
            <button
              className={`nav-link flex items-center space-x-1 py-3 px-4 font-medium rounded-xl transition-all duration-200 hover:bg-accent-subtle hover:shadow-md transform hover:-translate-y-0.5 ${
                activeMenu === navItem.label 
                  ? 'bg-accent-subtle shadow-md -translate-y-0.5' 
                  : ''
              }`}
              onClick={() => navItem.link && (window.location.href = navItem.link)}
              onMouseEnter={() => handleMenuEnter(navItem.label)}
              onMouseLeave={handleMenuLeave}
            >
              <span>{navItem.label}</span>
              {navItem.subMenus && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openDropdown === navItem.label ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            <AnimatePresence>
              {openDropdown === navItem.label && navItem.subMenus && (
                <div className={`absolute ${navItem.label === 'Contact' ? 
                  'left-0' : navItem.label === 'Directory' ? 
                  'left-0' : 'left-1/2 -translate-x-1/2'} 
                  top-full mt-2 z-50 w-96`}>
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="card shadow-2xl overflow-hidden"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="p-6">
                      {navItem.subMenus.map((menu, menuIndex) => (
                        <div key={menuIndex} className="mb-6 last:mb-0">
                          <h3 className="text-sm font-semibold heading-primary mb-3 uppercase tracking-wide">
                            {menu.title}
                          </h3>
                          <div className="space-y-1">
                            {menu.items.map((item, itemIndex) => (
                              <a
                                key={itemIndex}
                                href="#"
                                className="group flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-accent-subtle"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-accent-subtle rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-text-inverse transition-colors">
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h4 className="text-sm font-medium heading-primary group-hover:heading-primary">
                                    {item.label}
                                  </h4>
                                  <p className="text-xs body-text-muted mt-1 line-clamp-2 group-hover:body-text-muted">
                                    {item.description}
                                  </p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>
    );
  }
);

MegaMenu.displayName = "MegaMenu";

export default MegaMenu;