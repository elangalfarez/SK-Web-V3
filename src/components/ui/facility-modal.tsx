// src/components/ui/facility-modal.tsx
// Modal component for displaying facility details in the Facilities section

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FacilityItem {
  name: string;
  description?: string;
}

export interface FacilityModalContent {
  name: string;
  subtitle?: string;
  Icon: LucideIcon;
  imageUrl: string;
  sections?: {
    title: string;
    items?: FacilityItem[];
    content?: React.ReactNode;
  }[];
  footnote?: string;
}

interface FacilityModalProps {
  content: FacilityModalContent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FacilityModal: React.FC<FacilityModalProps> = ({
  content,
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

  if (!content) return null;

  const IconComponent = content.Icon;

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
            {/* Close Button */}
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

            {/* Image Header */}
            <div className="relative h-48 md:h-56 overflow-hidden rounded-t-2xl">
              <img
                src={content.imageUrl}
                alt={content.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

              {/* Icon Badge */}
              <div className="absolute top-4 left-4">
                <span className={cn(
                  'inline-flex items-center px-3 py-1.5',
                  'text-sm font-semibold',
                  'bg-accent text-text-inverse',
                  'rounded-full shadow-lg'
                )}>
                  <IconComponent className="w-4 h-4 mr-2" />
                  {content.name}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <h2 className={cn(
                'text-2xl md:text-3xl font-bold',
                'text-text-primary mb-2',
                'break-words leading-tight'
              )}>
                {content.name}
              </h2>

              {content.subtitle && (
                <p className="text-text-secondary mb-6">
                  {content.subtitle}
                </p>
              )}

              {/* Sections */}
              {content.sections?.map((section, idx) => (
                <div key={idx} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold text-accent mb-3">
                    {section.title}
                  </h3>

                  {section.content && (
                    <div className="text-text-secondary">
                      {section.content}
                    </div>
                  )}

                  {section.items && section.items.length > 0 && (
                    <ul className="space-y-2">
                      {section.items.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg',
                            'bg-surface-secondary/50',
                            'transition-colors hover:bg-surface-secondary'
                          )}
                        >
                          <div className="w-2 h-2 mt-2 rounded-full bg-accent flex-shrink-0" />
                          <div>
                            <span className="text-text-primary font-medium">
                              {item.name}
                            </span>
                            {item.description && (
                              <p className="text-text-secondary text-sm mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Footnote */}
              {content.footnote && (
                <div className={cn(
                  'mt-6 pt-4 border-t border-border-primary',
                  'text-xs text-text-tertiary italic'
                )}>
                  {content.footnote}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
