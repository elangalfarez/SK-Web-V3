// src/components/ui/tenant-card.tsx
// Modified: Consistent heights, golden ratio typography, mobile image fixes, truncation, modal expansion

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

import React, { useState, useCallback, useReducer } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Clock, Star, Sparkles } from 'lucide-react';
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
  const handleCardActivation = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
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
        onClick={handleCardActivation}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${fullTitle}`}
        className={`
          h-full flex flex-col
          bg-surface-secondary rounded-2xl overflow-hidden shadow-lg hover:shadow-xl
          transition-all duration-300 border border-border-primary
          hover:border-accent/20 group relative cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface
        `}
      >
        {/* Header with Logo/Image - Fixed aspect ratio for consistent heights */}
        <div className="relative aspect-[4/3] bg-surface-tertiary overflow-hidden flex-shrink-0">
          <ResponsiveImage
            src={tenant.logo_url}
            alt={fullTitle}
            className="w-full h-full"
            objectFit="cover"
            aspectRatio="4/3"
            fallbackLetter={(tenant.name || tenant.brand_name || 'S').charAt(0)}
          />

          {/* Badges - positioned in header corner */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {tenant.is_new_tenant && (
              <motion.div
                initial={!shouldReduceMotion ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={!shouldReduceMotion ? { type: "spring", delay: 0.2 } : { duration: 0 }}
                className="bg-accent text-text-inverse px-2 py-1 rounded-full text-xs font-semibold
                  flex items-center gap-1 shadow-lg"
              >
                <Sparkles className="h-3 w-3" />
                New
              </motion.div>
            )}
            
            {tenant.is_featured && (
              <motion.div
                initial={!shouldReduceMotion ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={!shouldReduceMotion ? { type: "spring", delay: 0.3 } : { duration: 0 }}
                className="bg-primary text-text-inverse px-2 py-1 rounded-full text-xs font-semibold
                  flex items-center gap-1 shadow-lg"
              >
                <Star className="h-3 w-3 fill-current" />
                Featured
              </motion.div>
            )}
          </div>

          {/* Gradient Overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 ${!shouldReduceMotion ? 'group-hover:opacity-100' : ''}`} />
        </div>

        {/* Content Area - flex-1 to fill remaining space, flex column with justify-between for consistent heights */}
        <div className="flex-1 flex flex-col justify-between p-4 min-h-0">
          {/* Main Content - takes available space */}
          <div className="flex-1 space-y-3 min-h-0">
            {/* Store Name - Golden ratio typography: ~1.125rem (18px) */}
            <div>
              <h3 
                className={`font-bold text-[1.125rem] text-text-primary leading-tight line-clamp-2 transition-colors duration-200 ${!shouldReduceMotion ? 'group-hover:text-accent' : ''}`}
                title={fullTitle}
                aria-label={fullTitle}
              >
                {fullTitle}
              </h3>
            </div>

            {/* Category - Slightly smaller: ~0.9375rem (15px) */}
            {categoryName && (
              <div className="flex items-center gap-1">
                <span className="text-[0.9375rem] font-medium text-accent leading-tight">
                  {categoryName}
                </span>
              </div>
            )}

            {/* Description - Fixed height with line clamping to prevent layout shifts */}
            {fullDescription && (
              <div className="min-h-[2.5rem]"> {/* Fixed height container */}
                <p 
                  className="text-sm text-text-secondary leading-relaxed line-clamp-2"
                  title={fullDescription}
                  aria-label={`Description: ${fullDescription}`}
                >
                  {fullDescription}
                </p>
              </div>
            )}
          </div>

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