// src/components/ui/whats-on-modal.tsx
// Modified: Fixed modal responsiveness & close button contrast

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
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: prefersReducedMotion ? 1 : 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : 20,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeIn'
      }
    },
  };

  if (!item) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl',
              'max-h-[90vh] overflow-y-auto'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button with better contrast */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className={cn(
                'absolute top-4 right-4 z-20',
                'w-10 h-10 rounded-full',
                'bg-surface-secondary/90 text-text-primary',
                'shadow-md flex items-center justify-center',
                'hover:bg-surface-secondary transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-accent/20'
              )}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
              <ResponsiveImage
                src={item.image_url}
                alt={item.title}
                className="rounded-t-2xl"
                aspectRatio="16/9"
                objectFit="cover"
                loading="eager"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Badge */}
              {item.badge_text && (
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    'inline-flex items-center px-3 py-1',
                    'text-sm font-semibold',
                    'bg-accent text-text-inverse',
                    'rounded-full shadow-lg'
                  )}>
                    <Tag className="w-3 h-3 mr-1" />
                    {item.badge_text}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Title - responsive with break-words */}
              <h2 className={cn(
                'text-2xl md:text-3xl lg:text-4xl font-bold',
                'text-text-primary mb-4',
                'break-words leading-tight'
              )}>
                {item.title}
              </h2>

              {/* Date */}
              {item.date_text && (
                <div className="flex items-center text-text-secondary mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm md:text-base">{item.date_text}</span>
                </div>
              )}

              {/* Description */}
              {item.description && (
                <div className="prose prose-sm md:prose-base max-w-none mb-6">
                  <p className="text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Location */}
              {item.location && (
                <div className="bg-surface-tertiary rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-text-primary mb-2">Location</h3>
                  <p className="text-text-secondary text-sm md:text-base">{item.location}</p>
                </div>
              )}

              {/* Learn More Button */}
              {item.learn_more_url && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={item.learn_more_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center justify-center',
                      'px-6 py-3 rounded-xl',
                      'bg-accent text-text-inverse font-semibold',
                      'hover:bg-accent-hover transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-accent/20'
                    )}
                  >
                    Learn More
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                  
                  {item.directions_url && (
                    <a
                      href={item.directions_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'inline-flex items-center justify-center',
                        'px-6 py-3 rounded-xl',
                        'bg-surface-secondary text-text-primary font-semibold border border-border-primary',
                        'hover:bg-surface-tertiary transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-accent/20'
                      )}
                    >
                      Get Directions
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};