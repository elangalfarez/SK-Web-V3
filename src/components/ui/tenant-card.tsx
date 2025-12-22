// src/components/ui/tenant-card.tsx
// Modified: World-class redesign with full-width images, Featured/New badges, premium UI

import React, { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Clock, Sparkles, Crown } from 'lucide-react';
import { parseOperatingHours } from '@/lib/supabase';
import { Tenant } from '@/lib/supabase';
import { ResponsiveImage } from './ResponsiveImage';
import { TenantCardModal } from './TenantCardModal';

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
      case 'UG': return 'Upper Ground';
      case 'GF': return 'Ground Floor';
      default: return floor || 'Floor TBD';
    }
  }, []);

  const operatingHours = parseOperatingHours(tenant.operating_hours);
  const categoryName = tenant.category_display || tenant.category_name || tenant.category;

  const handleCardActivation = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      setShowModal(true);
    }
  }, [onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardActivation();
    }
  }, [handleCardActivation]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const fullTitle = tenant.name || tenant.brand_name || 'Unnamed Store';
  const fullDescription = tenant.description || '';

  // Determine which badges to show
  const showFeatured = tenant.is_featured;
  const showNew = tenant.is_new_tenant;

  return (
    <>
      <motion.div
        whileHover={!shouldReduceMotion ? { y: -8, scale: 1.02 } : undefined}
        whileTap={!shouldReduceMotion ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={handleCardActivation}
        onKeyDown={handleKeyDown}
        className="group relative bg-surface-secondary rounded-2xl overflow-hidden border border-border-secondary hover:border-border-primary/50 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background h-full flex flex-col"
        role="button"
        tabIndex={0}
        aria-label={`View details for ${fullTitle}`}
      >
        {/* Image Section - Full width, taller, more prominent */}
        <div className="relative h-44 sm:h-48 bg-surface-tertiary overflow-hidden flex-shrink-0">
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-secondary/60 via-transparent to-transparent z-[1]" />

          {tenant.logo_url || tenant.banner_url ? (
            <ResponsiveImage
              src={tenant.banner_url || tenant.logo_url || ''}
              alt={`${fullTitle}`}
              className="w-full h-full"
              aspectRatio="16/9"
              objectFit="cover"
              loading="lazy"
            />
          ) : (
            // Premium fallback with gradient background
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/10 via-surface-tertiary to-accent/5">
              <div className="w-20 h-20 rounded-2xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center backdrop-blur-sm">
                <span className="text-3xl font-bold text-accent">
                  {fullTitle.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Badges Container - Top right, stacked vertically if both present */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            {/* Featured Badge */}
            {showFeatured && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent shadow-md">
                <Crown className="h-3 w-3 text-white" />
                <span className="text-[11px] font-semibold text-white">Featured</span>
              </div>
            )}

            {/* New Badge */}
            {showNew && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-accent shadow-md">
                <Sparkles className="h-3 w-3 text-white" />
                <span className="text-[11px] font-semibold text-white">New</span>
              </div>
            )}
          </div>

          {/* Hover overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[2]" />
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1">
          {/* Title */}
          <div className="mb-2 min-h-[3rem]">
            <h3
              className={`text-lg font-bold text-text-primary leading-tight line-clamp-2 transition-colors duration-200 ${!shouldReduceMotion ? 'group-hover:text-accent' : ''}`}
              title={fullTitle}
            >
              {fullTitle}
            </h3>
          </div>

          {/* Category */}
          {categoryName && (
            <div className="mb-3">
              <span className="text-sm font-semibold text-accent">
                {categoryName}
              </span>
            </div>
          )}

          {/* Description */}
          {fullDescription && (
            <div className="min-h-[2.5rem] mb-4">
              <p
                className="text-sm text-text-secondary leading-relaxed line-clamp-2"
                title={fullDescription}
              >
                {fullDescription}
              </p>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border-secondary/50 flex-shrink-0">
            {tenant.main_floor && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-xs text-text-secondary font-medium">
                  {formatFloor(tenant.main_floor)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="text-xs text-text-secondary font-medium truncate max-w-[8rem]">
                {operatingHours}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <TenantCardModal
        tenant={tenant}
        isOpen={showModal}
        onClose={closeModal}
      />
    </>
  );
};

export default TenantCard;