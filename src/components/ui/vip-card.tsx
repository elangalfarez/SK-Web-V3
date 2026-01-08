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
    'Super VIP Flazz': 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/VIP%20Card/Kartu-BCA-FLAZZ-1024x647.png',
    'Super VIP': 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/VIP%20Card/NEWsuper-vip.png',
    'VIP Platinum': 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/VIP%20Card/NEWvipplatinum.png',
    'Shopping Card': 'https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/VIP%20Card/NEWshopping-card.png'
  };
  
  return imageMap[tierName] || imageMap['Shopping Card'];
};

// Get icon component from Lucide React
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
          'relative group bg-surface-secondary border-2 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer h-full w-full',
          'hover:shadow-2xl hover:border-accent/30 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2'
        )}
        style={{
          '--vip-color': tier.card_color // Use DB color as CSS variable
        } as React.CSSProperties}
        whileHover={!reducedMotion ? { y: -4, scale: 1.01 } : undefined}
        whileTap={!reducedMotion ? { scale: 0.99 } : undefined}
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
        }}
      >
        {/* Tier badge */}
        {badgeInfo && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
            <span
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-full backdrop-blur-sm transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, var(--color-purple-accent-dark) 0%, var(--color-purple-accent) 100%)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 0 20px var(--color-purple-glow), 0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              <badgeInfo.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className="truncate">{badgeInfo.label}</span>
            </span>
          </div>
        )}

        {/* Card image */}
        <div className="relative h-36 sm:h-44 md:h-48 bg-surface-tertiary overflow-hidden">
          <motion.img
            src={cardImageUrl}
            alt={`${tier.name} VIP card`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full object-contain object-center transition-all duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              'group-hover:scale-105'
            )}
            initial={!reducedMotion ? { scale: 1.05, opacity: 0 } : { opacity: 0 }}
            animate={imageLoaded ? { scale: 1, opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
          />

          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-surface-tertiary animate-pulse" />
          )}

          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-3 sm:p-4">
                <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-text-muted mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-text-muted truncate max-w-[120px]">{tier.name}</p>
              </div>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Card content */}
        <div className="p-3 sm:p-4 md:p-5">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1.5 sm:mb-2 group-hover:text-accent transition-colors duration-200 truncate">
            {tier.name}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {tier.description}
          </p>

          {/* Requirement */}
          <div className="mb-3 sm:mb-4">
            <div className="text-[10px] sm:text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
              Requirement
            </div>
            <div className="text-sm sm:text-base font-bold text-accent break-words">
              {requirement}
            </div>
          </div>

          {/* Benefits preview */}
          <div className="mb-3 sm:mb-4">
            <div className="text-[10px] sm:text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5 sm:mb-2">
              Key Benefits
            </div>
            <div className="flex flex-wrap gap-1">
              {benefits.slice(0, 2).map((benefit) => {
                const IconComponent = getIconComponent(benefit.icon);
                return (
                  <div
                    key={benefit.id}
                    className="flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-accent/10 text-accent rounded-full text-[10px] sm:text-xs max-w-full"
                  >
                    <IconComponent className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 flex-shrink-0" />
                    <span className="truncate max-w-[80px] sm:max-w-[100px]">{benefit.name}</span>
                  </div>
                );
              })}
              {benefits.length > 2 && (
                <div className="flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-text-muted/10 text-text-muted rounded-full text-[10px] sm:text-xs">
                  +{benefits.length - 2} more
                </div>
              )}
            </div>
          </div>

          {/* Expand button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:bg-accent group-hover:text-text-inverse group-hover:border-accent transition-all duration-200 min-h-[36px] sm:min-h-[40px]"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
          >
            <span className="text-xs sm:text-sm">View All Benefits</span>
            <ChevronDown className={cn(
              'w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform duration-200 flex-shrink-0',
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
            className="fixed inset-0 z-50 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${tier.id}-modal-title`}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={handleBackdropClick}
              aria-hidden="true"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-4">
              <motion.div
                ref={modalRef}
                initial={!reducedMotion ? { opacity: 0, y: '100%' } : { opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={!reducedMotion ? { opacity: 0, y: '100%' } : { opacity: 0 }}
                transition={{
                  type: "spring",
                  duration: 0.35,
                  bounce: 0.1
                }}
                className="modal-fullscreen relative w-full max-h-[100dvh] sm:max-w-2xl sm:max-h-[90vh] bg-surface border-0 sm:border border-border-primary sm:rounded-2xl shadow-2xl overflow-y-auto overscroll-contain"
                onKeyDown={handleModalKeyDown}
              >
                {/* Close Button */}
                <button
                  ref={closeButtonRef}
                  onClick={onExpand}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 text-white hover:text-accent hover:bg-white/20 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 bg-black/40 backdrop-blur-sm"
                  aria-label="Close VIP card details"
                >
                  <X className="w-5 h-5 sm:w-5 sm:h-5" />
                </button>

                {/* Modal Header */}
                <div className="relative flex-shrink-0">
                  <div className="h-36 sm:h-44 md:h-52 bg-surface-tertiary overflow-hidden">
                    <img
                      src={cardImageUrl}
                      alt={`${tier.name} VIP card`}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 md:p-6 text-white">
                    <h2 id={`${tier.id}-modal-title`} className="text-lg sm:text-xl md:text-2xl font-bold mb-1 pr-8">
                      {tier.name}
                    </h2>
                    <p className="text-white/90 text-xs sm:text-sm line-clamp-2 pr-4">
                      {tier.description}
                    </p>
                  </div>

                  {/* Badge */}
                  {badgeInfo && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                      <Badge variant={badgeInfo.variant} className="px-2 py-1 shadow-lg text-[10px] sm:text-xs">
                        <badgeInfo.icon className="w-3 h-3 mr-1 flex-shrink-0" />
                        {badgeInfo.label}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Modal Content */}
                <div className="p-3 sm:p-5 md:p-6 pb-6 sm:pb-8">
                  {/* Requirements */}
                  <div className="mb-5 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3">
                      Requirements
                    </h3>
                    <div className="p-3 sm:p-4 bg-surface-secondary rounded-lg sm:rounded-xl border border-border-primary">
                      <p className="text-xs sm:text-sm text-text-secondary mb-2 leading-relaxed">{tier.qualification_requirement}</p>
                      <div className="text-base sm:text-xl font-bold text-accent break-words">
                        {requirement}
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-5 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3">
                      Exclusive Benefits
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      {benefits.map((benefit) => {
                        const IconComponent = getIconComponent(benefit.icon);
                        return (
                          <motion.div
                            key={benefit.id}
                            initial={!reducedMotion ? { opacity: 0, x: -10 } : { opacity: 1 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-surface-secondary rounded-lg sm:rounded-xl"
                          >
                            <div className="p-1.5 bg-accent/10 rounded-md sm:rounded-lg flex-shrink-0">
                              <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-text-primary mb-0.5 text-xs sm:text-sm">
                                {benefit.name}
                              </h4>
                              {benefit.description && (
                                <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed">
                                  {benefit.description}
                                </p>
                              )}
                              {benefit.benefit_note && (
                                <p className="text-[10px] sm:text-xs text-text-muted italic mt-0.5">
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
                  <div className="pt-2">
                    <Button
                      className="w-full py-3 text-xs sm:text-sm min-h-[44px]"
                      onClick={() => {
                        console.log(`Register for ${tier.name}`);
                      }}
                    >
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Register at VIP Lounge</span>
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