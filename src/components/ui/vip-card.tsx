// src/components/ui/vip-card.tsx
// Created: Reusable VIP card with expand modal, selection, accessibility, and mobile-first design
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Badge as BadgeIcon, 
  ChevronDown, 
  Sparkles,
  Crown,
  CreditCard
} from 'lucide-react';
import * as Icons from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VipTier, VipBenefitWithNote } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface VipCardProps {
  tier: VipTier;
  benefits: VipBenefitWithNote[];
  isExpanded: boolean;
  onExpand: () => void;
  usingFallback?: boolean;
}

// Get card image URL based on tier name
const getCardImageUrl = (tierName: string): string => {
  const imageMap: Record<string, string> = {
    'Super VIP Flazz': 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Kartu-BCA-FLAZZ-1024x647.png',
    'Super VIP': 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/NEWsuper-vip.png',
    'VIP Platinum': 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/NEWvipplatinum.png',
    'Shopping Card': 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/NEWshopping-card.png'
  };
  
  return imageMap[tierName] || imageMap['Shopping Card'];
};

// Get icon component from Lucide React
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'star': Icons.Star,
    'percent': Icons.Percent,
    'crown': Icons.Crown,
    'door-open': Icons.DoorOpen,
    'car': Icons.Car,
    'credit-card': Icons.CreditCard,
    'gift': Icons.Gift,
    'sparkles': Icons.Sparkles,
    'badge': BadgeIcon,
  };
  
  return iconMap[iconName] || Icons.Star;
};

// Format currency in Indonesian Rupiah
const formatCurrency = (amount: number): string => {
  if (amount === 0) return 'Free';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Get tier badge info
const getTierBadgeInfo = (tier: VipTier) => {
  if (tier.tier_level === 1) return { label: 'Premium', variant: 'default' as const, icon: Crown };
  if (tier.tier_level === 2) return { label: 'Featured', variant: 'default' as const, icon: Star };
  if (tier.tier_level === 3) return { label: 'Popular', variant: 'default' as const, icon: Sparkles };
  return null;
};

// Check if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const VipCard: React.FC<VipCardProps> = ({
  tier,
  benefits,
  isExpanded,
  onExpand,
  usingFallback = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  const reducedMotion = prefersReducedMotion();
  const cardImageUrl = getCardImageUrl(tier.name);
  const badgeInfo = getTierBadgeInfo(tier);

  // Focus management for expanded modal
  useEffect(() => {
    if (isExpanded) {
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);

      // Disable body scroll
      document.body.style.overflow = 'hidden';

      // Handle escape key
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onExpand();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isExpanded, onExpand]);

  // Focus trap for modal
  const handleModalKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab' && isExpanded) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  // Handle backdrop click to close modal
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onExpand();
    }
  };

  const requirement = tier.minimum_receipt_amount 
    ? `${formatCurrency(tier.minimum_receipt_amount)} in one receipt`
    : `${formatCurrency(tier.minimum_spend_amount)} monthly spend`;

  return (
    <>
      {/* Main Card */}
      <motion.div
        ref={cardRef}
        className={cn(
          'relative group bg-surface-secondary border-2 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer h-full',
          'hover:shadow-2xl hover:border-accent/30 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2'
        )}
        style={{ 
          '--vip-color': tier.card_color // Use DB color as CSS variable
        } as React.CSSProperties}
        whileHover={!reducedMotion ? { y: -8, scale: 1.02 } : undefined}
        whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
        onClick={onExpand}
        tabIndex={0}
        role="button"
        aria-expanded={isExpanded}
        aria-label={`${tier.name} VIP card. Click to view details.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onExpand();
          }
        }        }
      >
        {/* Tier badge */}
        {badgeInfo && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant={badgeInfo.variant} className="px-2 py-1 text-xs shadow-lg">
              <badgeInfo.icon className="w-3 h-3 mr-1" />
              {badgeInfo.label}
            </Badge>
          </div>
        )}

        {/* Card image */}
        <div className="relative h-40 sm:h-48 md:h-52 bg-surface-tertiary overflow-hidden">
          <motion.img
            src={cardImageUrl}
            alt={`${tier.name} VIP card`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full object-contain object-center transition-all duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              'group-hover:scale-110'
            )}
            initial={!reducedMotion ? { scale: 1.1, opacity: 0 } : { opacity: 0 }}
            animate={imageLoaded ? { scale: 1, opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
          
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-surface-tertiary animate-pulse" />
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <CreditCard className="w-12 h-12 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">{tier.name}</p>
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card content */}
        <div className="p-4 sm:p-6">
          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors duration-200 line-clamp-1">
            {tier.name}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed">
            {tier.description}
          </p>

          {/* Requirement */}
          <div className="mb-4">
            <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
              Requirement
            </div>
            <div className="text-base sm:text-lg font-bold text-accent line-clamp-2">
              {requirement}
            </div>
          </div>

          {/* Benefits preview */}
          <div className="mb-4">
            <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
              Key Benefits
            </div>
            <div className="flex flex-wrap gap-1">
              {benefits.slice(0, 2).map((benefit) => {
                const IconComponent = getIconComponent(benefit.icon);
                return (
                  <div
                    key={benefit.id}
                    className="flex items-center px-2 py-1 bg-accent/10 text-accent rounded-full text-xs"
                  >
                    <IconComponent className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{benefit.name}</span>
                  </div>
                );
              })}
              {benefits.length > 2 && (
                <div className="flex items-center px-2 py-1 bg-text-muted/10 text-text-muted rounded-full text-xs">
                  +{benefits.length - 2} more
                </div>
              )}
            </div>
          </div>

          {/* Expand button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:bg-accent group-hover:text-text-inverse group-hover:border-accent transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
          >
            <span className="text-xs sm:text-sm">View All Benefits</span>
            <ChevronDown className={cn(
              'w-4 h-4 ml-2 transition-transform duration-200 flex-shrink-0',
              isExpanded && 'rotate-180'
            )} />
          </Button>
        </div>

        {/* Fallback data indicator */}
        {usingFallback && (
          <div className="absolute bottom-2 right-2">
            <div className="w-2 h-2 bg-warning rounded-full animate-pulse" 
                 title="Using cached data" />
          </div>
        )}
      </motion.div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <div 
            className="fixed inset-0 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${tier.id}-modal-title`}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleBackdropClick}
              aria-hidden="true"
            />

            {/* Modal Container */}
            <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div
                ref={modalRef}
                initial={!reducedMotion ? { opacity: 0, scale: 0.9, y: 20 } : { opacity: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={!reducedMotion ? { opacity: 0, scale: 0.9, y: 20 } : { opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  duration: 0.5,
                  bounce: 0.3
                }}
                className="relative w-full max-w-2xl bg-surface border border-border-primary sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
                onKeyDown={handleModalKeyDown}
              >
                {/* Close Button */}
                <button
                  ref={closeButtonRef}
                  onClick={onExpand}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-black/20 backdrop-blur-sm"
                  aria-label="Close VIP card details"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>

                {/* Modal Header */}
                <div className="relative">
                  <div className="h-48 sm:h-56 bg-surface-tertiary overflow-hidden">
                    <img
                      src={cardImageUrl}
                      alt={`${tier.name} VIP card`}
                      className="w-full h-full object-contain object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                    <h2 id={`${tier.id}-modal-title`} className="text-2xl sm:text-3xl font-bold mb-2">
                      {tier.name}
                    </h2>
                    <p className="text-white/90 text-sm sm:text-base">
                      {tier.description}
                    </p>
                  </div>

                  {/* Badge */}
                  {badgeInfo && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <Badge variant={badgeInfo.variant} className="px-2 sm:px-3 py-1 shadow-lg text-xs">
                        <badgeInfo.icon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        {badgeInfo.label}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Modal Content */}
                <div className="p-4 sm:p-6 md:p-8">
                  {/* Requirements */}
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">
                      Requirements
                    </h3>
                    <div className="p-3 sm:p-4 bg-surface-secondary rounded-xl border border-border-primary">
                      <p className="text-sm sm:text-base text-text-secondary mb-2 leading-relaxed">{tier.qualification_requirement}</p>
                      <div className="text-xl sm:text-2xl font-bold text-accent">
                        {requirement}
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">
                      Exclusive Benefits
                    </h3>
                    <div className="space-y-3">
                      {benefits.map((benefit) => {
                        const IconComponent = getIconComponent(benefit.icon);
                        return (
                          <motion.div
                            key={benefit.id}
                            initial={!reducedMotion ? { opacity: 0, x: -20 } : { opacity: 1 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-colors duration-200"
                          >
                            <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg flex-shrink-0">
                              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-text-primary mb-1 text-sm sm:text-base">
                                {benefit.name}
                              </h4>
                              {benefit.description && (
                                <p className="text-xs sm:text-sm text-text-secondary mb-1 leading-relaxed">
                                  {benefit.description}
                                </p>
                              )}
                              {benefit.benefit_note && (
                                <p className="text-xs text-text-muted italic">
                                  {benefit.benefit_note}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    <Button 
                      className="w-full py-3 sm:py-4 text-sm sm:text-base"
                      onClick={() => {
                        // Could trigger registration flow
                        console.log(`Register for ${tier.name}`);
                      }}
                    >
                      <Star className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Register for {tier.name} at VIP Lounge Supermal Karawaci</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};