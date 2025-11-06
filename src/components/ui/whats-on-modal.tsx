// src/components/ui/whats-on-modal.tsx
// Fixed: Removed non-existent WhatsOnItem properties and corrected JSX syntax

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag } from 'lucide-react';
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

  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleTabKey);

    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown, handleTabKey]);

  if (!item) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.95, y: prefersReducedMotion ? 0 : 20 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            className={cn(
              'relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl',
              'max-h-[90vh] overflow-y-auto'
            )}
            onClick={(e) => e.stopPropagation()}
          >
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              
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

            <div className="p-6 md:p-8">
              <h2 className={cn(
                'text-2xl md:text-3xl lg:text-4xl font-bold',
                'text-text-primary mb-4',
                'break-words leading-tight'
              )}>
                {item.title}
              </h2>

              {item.date_text && (
                <div className="flex items-center text-text-secondary mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm md:text-base">{item.date_text}</span>
                </div>
              )}

              {item.description && (
                <div className="prose prose-sm md:prose-base max-w-none">
                  <p className="text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};