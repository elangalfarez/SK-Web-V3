// src/components/ui/contact-success-modal.tsx
// Created: Success modal with focus trap, accessibility, and smooth animations
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSuccessModal: React.FC<ContactSuccessModalProps> = ({
  isOpen,
  onClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);

      // Disable body scroll
      document.body.style.overflow = 'hidden';

      // Add escape key listener
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // Focus trap
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
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

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
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
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              duration: 0.5,
              bounce: 0.3
            }}
            className="relative w-full max-w-md bg-surface border border-border-primary rounded-2xl shadow-2xl overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Close success message"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success Animation Background */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 2, opacity: 0.1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="absolute top-1/2 left-1/2 w-32 h-32 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2"
              />
            </div>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  delay: 0.1, 
                  duration: 0.6,
                  bounce: 0.4
                }}
                className="mx-auto mb-6 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                id="success-modal-title"
                className="text-2xl font-bold text-text-primary mb-4"
              >
                Message Sent Successfully!
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-text-secondary mb-8 leading-relaxed"
              >
                Thank you for contacting us. We've received your message and will get back to you as soon as possible.
              </motion.p>

              {/* Info Cards */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="space-y-4 mb-8"
              >
                <div className="flex items-center justify-center space-x-3 p-4 bg-surface-secondary rounded-xl border border-border-primary">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-text-primary">Response Time</p>
                    <p className="text-xs text-text-muted">Within 24 hours</p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="space-y-3"
              >
                <Button
                  ref={firstFocusableRef}
                  onClick={onClose}
                  className="w-full py-3 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Perfect, Got It!
                </Button>

                <button
                  ref={lastFocusableRef}
                  onClick={() => {
                    onClose();
                    // Optional: scroll to contact form for another message
                  }}
                  className="w-full py-3 px-4 text-sm font-medium text-accent hover:text-accent-hover hover:bg-accent/10 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  <MessageSquare className="w-4 h-4 mr-2 inline" />
                  Send Another Message
                </button>
              </motion.div>

              {/* Additional Info */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="mt-6 text-xs text-text-muted leading-relaxed"
              >
                For urgent matters, please call us at{' '}
                <a 
                  href="tel:+62215466666" 
                  className="text-accent hover:text-accent-hover underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                >
                  +62 21 5466 666
                </a>
              </motion.p>
            </div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent-light to-accent"
            />

            {/* Floating Success Particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 100 - 50
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.random() * 200 - 100,
                  y: Math.random() * -200 - 50
                }}
                transition={{
                  duration: 2,
                  delay: 0.5 + i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute w-2 h-2 bg-accent rounded-full pointer-events-none"
                style={{
                  left: '50%',
                  top: '40%'
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};