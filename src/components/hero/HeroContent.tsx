// src/components/hero/HeroContent.tsx
// Version 3: Fixed layout with wider container, removed button, added scroll indicator

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WhatsOnModal } from '../ui/whats-on-modal';
import { WhatsOnCarousel } from '../ui/whats-on-carousel';
import { HeroModels } from '../ui/hero-models';
import { useWhatsOn } from '@/lib/hooks/useWhatsOn';
import { WhatsOnItem } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface HeroContentProps {
  title?: React.ReactNode;
  subtitle?: string;
  onDiscover?: () => void;
  className?: string;
}

// Scroll indicator component
const ScrollIndicator: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center',
        'w-10 h-12 rounded-full',
        'bg-surface-secondary/20 backdrop-blur-sm',
        'border border-border-primary/40',
        'text-white hover:text-accent',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent/20'
      )}
      aria-label="Scroll down"
      whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
    >
      <motion.div
        className="w-1 h-1 rounded-full bg-current"
        animate={prefersReducedMotion ? {} : {
          y: [0, 4, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className="w-3 h-6 rounded-full border border-current mt-1" />
    </motion.button>
  );
};

export const HeroContent: React.FC<HeroContentProps> = ({
  title = (
    <>
      Welcome to<br />
      <span className="text-accent">Supermal Karawaci</span>
    </>
  ),
  subtitle = "Your Shopping, Culinary, & Entertainment Destination",
  onDiscover,
  className,
}) => {
  const { items, isLoading } = useWhatsOn({ limit: 6 });
  const [selectedItem, setSelectedItem] = useState<WhatsOnItem | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.8,
        staggerChildren: prefersReducedMotion ? 0 : 0.2,
      }
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: prefersReducedMotion ? 1 : 0, 
      y: prefersReducedMotion ? 0 : 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.8,
        ease: 'easeOut'
      }
    },
  };

  const handleCardClick = (item: WhatsOnItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handleScrollDown = () => {
    if (onDiscover) {
      onDiscover();
    } else {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          // Wider container for better balance with building facade
          'absolute inset-0 z-20',
          'max-w-8xl mx-auto px-4 sm:px-6 lg:px-8',
          // Mobile flex column for proper ordering
          'h-full flex flex-col',
          className
        )}
      >
        {/* TOP: Hero Title and Subtitle Section */}
        <div className="flex-shrink-0 pt-20 lg:pt-24 max-w-3xl order-1">
          <motion.h1 
            variants={itemVariants}
            className={cn(
              'text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
              'font-bold leading-tight',
              'text-white mb-4 md:mb-6',
              'text-balance'
            )}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p 
              variants={itemVariants}
              className={cn(
                'text-lg md:text-xl lg:text-2xl',
                'leading-relaxed',
                'text-white/90 mb-8 md:mb-10',
                'max-w-xl lg:max-w-2xl'
              )}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* MIDDLE: What's On Section */}
        <motion.div 
          variants={itemVariants}
          className="flex-1 flex flex-col justify-end max-w-5xl order-2 md:order-2"
        >
          <h2 className={cn(
            'text-2xl md:text-3xl font-bold',
            'text-white mb-4 md:mb-6'
          )}>
            What's On
          </h2>

          {!isLoading && items.length > 0 && (
            <WhatsOnCarousel
              items={items}
              onCardClick={handleCardClick}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              showNavigation={true}
              showDots={true}
            />
          )}
        </motion.div>

        {/* MOBILE ONLY: Models positioned below What's On */}
        <div className="block md:hidden order-3 mt-8 mb-4">
          <HeroModels />
        </div>

        {/* BOTTOM: Scroll Indicator */}
        <motion.div 
          variants={itemVariants}
          className="flex-shrink-0 pb-8 flex justify-center order-4"
        >
          <ScrollIndicator onClick={handleScrollDown} />
        </motion.div>
      </motion.div>

      {/* What's On Detail Modal */}
      <WhatsOnModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={handleCloseModal}
      />
    </>
  );
};