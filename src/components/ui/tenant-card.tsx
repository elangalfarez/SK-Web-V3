// src/components/ui/tenant-card.tsx
// Modified: Fixed ResponsiveImage props and removed unused imports

/*
ACCEPTANCE CHECKLIST - Test these after applying changes:

1. CARD HEIGHTS: All cards have equal height across grid rows (desktop + mobile)
2. MOBILE IMAGES: Images that failed on Android now load or show letter-avatar fallback
   - Test problematic URLs: Instagram HEIC, fragile CDN images
   - Chrome DevTools > Device Mode > Android emulation
3. TYPOGRAPHY: Titles are larger (golden ratio scale ~1.125rem), visually prominent
4. TRUNCATION: Long titles/descriptions don't break layout (line-clamp-2 enforced)
5. ACCESSIBILITY: Full text available via title attributes and modal expansion
6. ANIMATIONS: Hover effects respect prefers-reduced-motion
7. NO HEX COLORS: Only design tokens used (bg-surface-*, text-text-*, bg-accent)

ORIGINAL BUGS TO REPRODUCE:
- Android Chrome: Images display on desktop but not mobile (blank header areas)
- Mixed card heights: Some cards taller due to long descriptions
- Typography hierarchy: Titles too small, poor visual hierarchy

TESTING COMMANDS:
- npm run dev
- Open Chrome DevTools > Device toolbar
- Test Android mobile view with example tenant data
- Verify keyboard navigation (Tab through cards, Enter to open modal)
- Test prefers-reduced-motion in DevTools > Rendering
*/

import React, { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Clock, Sparkles } from 'lucide-react';
import { parseOperatingHours } from '@/lib/supabase';
import { Tenant } from '@/lib/supabase';
import { ResponsiveImage } from './ResponsiveImage';
import { TenantCardModal } from './TenantCardModal';

/*
GOLDEN RATIO TYPOGRAPHY SCALE (Base: 16px):
- Base: 16px (1rem)
- Title: 18px (~1.125rem) - slightly larger for prominence 
- Category: 15px (~0.9375rem)  
- Body: 14px (0.875rem)
- Small: 13px (~0.8125rem)
Ratio approximation: ~1.118 (close to golden ratio 1.618 scaled appropriately)
*/

interface TenantCardProps {
  tenant: Tenant;
  onClick?: () => void;
}

export const TenantCard: React.FC<TenantCardProps> = ({ tenant, onClick }) => {
  const [showModal, setShowModal] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const formatFloor = useCallback((floor: string): string => {
    switch (floor?.toUpperCase()) {
      case 'FF': return 'First Floor';
      case 'SF': return 'Second Floor';
      case 'TF': return 'Third Floor';
      case 'UG': return 'Upper Ground'; // Corrected UG mapping
      case 'GF': return 'Ground Floor';
      default: return floor || 'Floor TBD';
    }
  }, []);

  // Use the safe parsing function from supabase client
  const operatingHours = parseOperatingHours(tenant.operating_hours);
  
  // Get category name with fallback priority: category_display > category_name > category
  const categoryName = tenant.category_display || tenant.category_name || tenant.category;

  // Handle card click/keyboard activation
  const handleCardActivation = useCallback((_e: React.MouseEvent | React.KeyboardEvent) => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: open modal for expanded view
      setShowModal(true);
    }
  }, [onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardActivation(e);
    }
  }, [handleCardActivation]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  // Generate full display text for accessibility
  const fullTitle = tenant.name || tenant.brand_name || 'Unnamed Store';
  const fullDescription = tenant.description || '';

  return (
    <>
      <motion.div
        whileHover={!shouldReduceMotion ? { y: -6, scale: 1.02 } : undefined}
        whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={handleCardActivation}
        onKeyDown={handleKeyDown}
        className="group relative bg-surface-secondary rounded-2xl overflow-hidden border border-border-primary hover:border-accent/50 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background h-full flex flex-col"
        role="button"
        tabIndex={0}
        aria-label={`View details for ${fullTitle}`}
      >
        {/* Header with Image/Logo - Fixed height to prevent layout shifts */}
        <div className="relative h-32 bg-surface-tertiary overflow-hidden flex-shrink-0">
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
          
          {tenant.logo_url || tenant.banner_url ? (
            <ResponsiveImage
              src={tenant.logo_url || tenant.banner_url || ''}
              alt={`${fullTitle} logo`}
              className="w-full h-full object-contain p-4"
              aspectRatio="16/9"
              objectFit="contain"
              loading="lazy"
            />
          ) : (
            // Fallback letter-based avatar
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent">
                  {fullTitle.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* New/Featured Badge */}
          {tenant.is_new_tenant && (
            <div className="absolute top-2 right-2 z-10">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/90 backdrop-blur-sm border border-white/20 shadow-lg">
                <Sparkles className="h-3.5 w-3.5 text-white" />
                <span className="text-xs font-bold text-white">New</span>
              </div>
            </div>
          )}

          {/* Hover overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-secondary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content - Grows to fill available space */}
        <div className="p-6 flex flex-col flex-1">
          {/* Title area - Fixed height with truncation */}
          <div className="mb-2 min-h-[3.5rem]">
            <h3 
              className={`text-[1.125rem] font-bold text-text-primary leading-tight line-clamp-2 transition-colors duration-200 ${!shouldReduceMotion ? 'group-hover:text-accent' : ''}`}
              title={fullTitle}
              aria-label={fullTitle}
            >
              {fullTitle}
            </h3>
          </div>

          {/* Category - Slightly smaller: ~0.9375rem (15px) */}
          {categoryName && (
            <div className="flex items-center gap-1 mb-3">
              <span className="text-[0.9375rem] font-medium text-accent leading-tight">
                {categoryName}
              </span>
            </div>
          )}

          {/* Description - Fixed height with line clamping to prevent layout shifts */}
          {fullDescription && (
            <div className="min-h-[2.5rem] mb-4"> {/* Fixed height container */}
              <p 
                className="text-sm text-text-secondary leading-relaxed line-clamp-2"
                title={fullDescription}
                aria-label={`Description: ${fullDescription}`}
              >
                {fullDescription}
              </p>
            </div>
          )}

          {/* Spacer to push footer to bottom */}
          <div className="flex-1" />

          {/* Footer Info - Fixed at bottom */}
          <div className="flex items-center justify-between pt-3 border-t border-border-secondary/50 flex-shrink-0">
            {/* Location */}
            {tenant.main_floor && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-xs text-text-secondary font-medium">
                  {formatFloor(tenant.main_floor)}
                </span>
              </div>
            )}

            {/* Operating Hours */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="text-xs text-text-secondary font-medium truncate max-w-[8rem]">
                {operatingHours}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded View Modal */}
      <TenantCardModal
        tenant={tenant}
        isOpen={showModal}
        onClose={closeModal}
      />
    </>
  );
};

export default TenantCard;