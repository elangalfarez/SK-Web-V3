// src/components/ui/hero-models.tsx
// Modified: Larger on desktop with translate-x-8, visible on mobile with order-last

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroModelsProps {
  className?: string;
}

export const HeroModels: React.FC<HeroModelsProps> = ({ className }) => {
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animationVariants = {
    hidden: { 
      opacity: prefersReducedMotion ? 1 : 0,
      x: prefersReducedMotion ? 0 : 20,
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: { 
        duration: prefersReducedMotion ? 0 : 1.2,
        ease: 'easeOut',
        delay: prefersReducedMotion ? 0 : 0.5,
      }
    },
  };

  return (
    <motion.div
      variants={animationVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        // Desktop: absolute positioning at bottom right, overlapping hero
        'md:absolute md:bottom-0 md:right-0 md:transform md:translate-x-8',
        // Mobile: block element for natural flow, centered, last in order
        'block md:absolute flex justify-center order-last',
        className
      )}
    >
      {/* Models Image - responsive sizing */}
      <img
        src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/Model%202%20Rev1.png"
        alt=""
        className={cn(
          'object-cover object-bottom',
          // Mobile: smaller, centered block
          'h-[240px] sm:h-[300px]',
          // Desktop: much larger, overlapping right edge
          'md:h-[600px] lg:h-[760px] xl:h-[820px]',
          'w-auto max-h-[90vh]'
        )}
        loading="lazy"
        draggable={false}
      />
    </motion.div>
  );
};