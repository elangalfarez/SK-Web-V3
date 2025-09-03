// src/components/ui/TenantCardModal.tsx
// Created: Accessible modal for expanded tenant card view with focus trap

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Star, Sparkles, Phone, Globe } from 'lucide-react';
import { Tenant, parseOperatingHours } from '@/lib/supabase';
import { ResponsiveImage } from './ResponsiveImage';
import { Badge } from './badge';

interface TenantCardModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TenantCardModal: React.FC<TenantCardModalProps> = ({
  tenant,
  isOpen,
  onClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Format floor display
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

  // Close modal on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  // Focus trap implementation
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (!modalRef.current || e.key !== 'Tab') return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  }, []);

  // Setup event listeners and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTabKey);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element after animation completes
    setTimeout(() => {
      firstFocusableRef.current?.focus() || closeButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown, handleTabKey]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!tenant) return null;

  const operatingHours = parseOperatingHours(tenant.operating_hours);
  const categoryName = tenant.category_display || tenant.category_name || tenant.category;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            initial={!prefersReducedMotion ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={!prefersReducedMotion ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-surface-secondary rounded-2xl shadow-2xl overflow-hidden border border-border-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-surface-secondary/80 backdrop-blur-sm rounded-full hover:bg-surface-tertiary transition-colors border border-border-primary"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-text-primary" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header Image */}
              <div className="relative h-64 bg-surface-tertiary">
                <ResponsiveImage
                  src={tenant.logo_url}
                  alt={tenant.name || 'Store logo'}
                  className="w-full h-full"
                  objectFit="cover"
                  aspectRatio="16/9"
                  fallbackLetter={(tenant.name || tenant.brand_name || 'S').charAt(0)}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {tenant.is_new_tenant && (
                    <Badge variant="secondary" className="bg-accent text-text-inverse shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  )}
                  
                  {tenant.is_featured && (
                    <Badge variant="warning" className="shadow-lg">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Title & Category */}
                <div>
                  <h2 id="modal-title" className="text-2xl font-bold text-text-primary mb-2 leading-tight">
                    {tenant.name || tenant.brand_name}
                  </h2>
                  
                  {categoryName && (
                    <p className="text-accent font-medium text-lg">
                      {categoryName}
                    </p>
                  )}
                </div>

                {/* Description */}
                {tenant.description && (
                  <div id="modal-description">
                    <h3 className="font-semibold text-text-primary mb-2">About</h3>
                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {tenant.description}
                    </p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  {tenant.main_floor && (
                    <div className="flex items-start gap-3 p-3 bg-surface-tertiary rounded-lg">
                      <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-text-primary">Location</p>
                        <p className="text-text-secondary text-sm">
                          {formatFloor(tenant.main_floor)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Operating Hours */}
                  <div className="flex items-start gap-3 p-3 bg-surface-tertiary rounded-lg">
                    <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-text-primary">Hours</p>
                      <p className="text-text-secondary text-sm">
                        {operatingHours}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  {tenant.phone && (
                    <div className="flex items-start gap-3 p-3 bg-surface-tertiary rounded-lg">
                      <Phone className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-text-primary">Phone</p>
                        <a 
                          href={`tel:${tenant.phone}`}
                          className="text-text-secondary text-sm hover:text-accent transition-colors"
                        >
                          {tenant.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {tenant.website && (
                    <div className="flex items-start gap-3 p-3 bg-surface-tertiary rounded-lg">
                      <Globe className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-text-primary">Website</p>
                        <a 
                          href={tenant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-secondary text-sm hover:text-accent transition-colors break-all"
                        >
                          Visit Site
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-border-secondary">
                  <button
                    ref={firstFocusableRef}
                    onClick={onClose}
                    className="w-full py-3 px-6 bg-accent text-text-inverse rounded-lg font-medium hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TenantCardModal;