// src/components/ui/mega-menu.tsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type MegaMenuItem = {
  id: number;
  label: string;
  subMenus?: {
    title: string;
    items: {
      label: string;
      description: string;
      icon: React.ElementType;
    }[];
  }[];
  link?: string;
};

export interface MegaMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  items: MegaMenuItem[];
  className?: string;
}

const MegaMenu = React.forwardRef<HTMLUListElement, MegaMenuProps>(
  ({ items, className, ...props }, ref) => {
    const [openMenu, setOpenMenu] = React.useState<string | null>(null);
    const [isHover, setIsHover] = React.useState<number | null>(null);

    const handleHover = (menuLabel: string | null) => {
      setOpenMenu(menuLabel);
    };

    return (
      <ul
        ref={ref}
        className={`relative flex items-center space-x-0 ${className || ""}`}
        {...props}
      >
        {items.map((navItem) => (
          <li
            key={navItem.label}
            className="relative"
            onMouseEnter={() => handleHover(navItem.label)}
            onMouseLeave={() => handleHover(null)}
          >
            <button
              className="relative flex cursor-pointer items-center justify-center gap-1 py-1.5 px-4 text-sm text-primary-text transition-colors duration-300 hover:text-dark-purple group font-medium overflow-hidden"
              onMouseEnter={() => setIsHover(navItem.id)}
              onMouseLeave={() => setIsHover(null)}
            >
              {/* Hover background - positioned BEHIND content with proper z-index */}
              {(isHover === navItem.id || openMenu === navItem.label) && (
                <motion.div
                  layoutId="hover-bg"
                  className="absolute inset-0 size-full bg-purple-50 rounded-lg -z-10"
                  style={{
                    borderRadius: 8,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              {/* Text content - positioned ABOVE background with proper z-index */}
              <span className="relative z-10">{navItem.label}</span>
              {navItem.subMenus && (
                <ChevronDown
                  className={`relative z-10 h-4 w-4 transition-transform duration-300 group-hover:rotate-180 ${
                    openMenu === navItem.label ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            <AnimatePresence>
              {openMenu === navItem.label && navItem.subMenus && (
                <div className={`absolute ${navItem.label === 'Contact' ? 
                  'left-0' : navItem.label === 'Directory' ? 
                  'left-0' : 'left-1/2 -translate-x-1/2'} 
                  top-full mt-2 z-50 w-96`}>
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="bg-white rounded-xl shadow-2xl border border-purple-100 overflow-hidden"
                  >
                    <div className="p-6">
                      {navItem.subMenus.map((menu, menuIndex) => (
                        <div key={menuIndex} className="mb-6 last:mb-0">
                          <h3 className="text-sm font-semibold text-primary-text mb-3 uppercase tracking-wide">
                            {menu.title}
                          </h3>
                          <div className="space-y-1">
                            {menu.items.map((item, itemIndex) => (
                              <a
                                key={itemIndex}
                                href="#"
                                className="group flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-purple-50"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-royal-purple group-hover:text-white transition-colors">
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <h4 className="text-sm font-medium text-primary-text group-hover:text-primary-text">
                                    {item.label}
                                  </h4>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2 group-hover:text-gray-600">
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