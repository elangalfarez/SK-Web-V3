// src/components/ui/whats-on-modal.tsx
// Created: Item detail modal with accessible focus trap and animations

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, Tag } from 'lucide-react';
import { ResponsiveImage } from './ResponsiveImage';
import { WhatsOnItem } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface WhatsOnModalProps {
  item: WhatsOnItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsOnModal: React.FC<WhatsOnModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // Close modal on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  // Setup event listeners and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTabKey);

    // Focus the close button when modal opens
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown, handleTabKey]);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 }
    },
  };

  const modalVariants = {
    hidden: { 
      opacity: prefersReducedMotion ? 1 : 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : 20,
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: prefersReducedMotion ? 1 : 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : 20,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.2,
        ease: 'easeIn'
      }
    },
  };

  const handleVisitLink = () => {
    if (item?.link_url) {
      if (item.link_url.startsWith('http')) {
        window.open(item.link_url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = item.link_url;
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 bg-accent/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              // Layout and sizing
              'relative w-full max-w-2xl mx-4',
              'max-h-[90vh] overflow-hidden',
              // Styling
              'bg-surface rounded-2xl shadow-2xl',
              'border border-border-primary'
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className={cn(
                'absolute top-4 right-4 z-10',
                'w-10 h-10 rounded-full',
                'bg-surface/80 hover:bg-surface',
                'backdrop-blur-sm border border-border-primary',
                'flex items-center justify-center',
                'text-text-primary hover:text-accent',
                'transition-all duration-200',
                'focus:outline-none focus:ring-4 focus:ring-accent/20'
              )}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className="relative h-64 md:h-80">
              <ResponsiveImage
                src={item.image_url}
                alt={item.title}
                className="rounded-t-2xl"
                aspectRatio="16/9"
                objectFit="cover"
                loading="eager"
                fetchPriority="high"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-accent/30 via-transparent to-transparent" />
              
              {/* Badge */}
              {item.badge_text && (
                <div className="absolute bottom-4 left-4">
                  <span className={cn(
                    'inline-flex items-center gap-2 px-3 py-2',
                    'text-sm font-semibold',
                    'bg-accent text-text-inverse',
                    'rounded-full shadow-lg'
                  )}>
                    <Tag className="w-4 h-4" />
                    {item.badge_text}
                  </span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 space-y-4">
              {/* Title */}
              <h2 
                id="modal-title"
                className={cn(
                  'text-2xl md:text-3xl font-bold',
                  'text-text-primary leading-tight'
                )}
              >
                {item.title}
              </h2>

              {/* Date */}
              {item.date_text && (
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.date_text}</span>
                </div>
              )}

              {/* Description */}
              {item.description && (
                <p 
                  id="modal-description"
                  className={cn(
                    'text-base md:text-lg leading-relaxed',
                    'text-text-secondary'
                  )}
                >
                  {item.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {item.link_url && (
                  <button
                    onClick={handleVisitLink}
                    className={cn(
                      'flex items-center justify-center gap-2',
                      'px-6 py-3 rounded-xl',
                      'bg-accent text-text-inverse font-semibold',
                      'hover:bg-accent-hover',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-4 focus:ring-accent/20'
                    )}
                  >
                    Learn More
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-center gap-2',
                    'px-6 py-3 rounded-xl',
                    'bg-surface-secondary text-text-primary font-semibold',
                    'hover:bg-surface-tertiary border border-border-primary',
                    'transition-colors duration-200',
                    'focus:outline-none focus:ring-4 focus:ring-accent/20'
                  )}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};