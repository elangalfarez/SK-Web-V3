// src/components/ui/whats-on-card.tsx
// Modified: Equal heights, darker glass style, consistent sizing using theme tokens

import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveImage } from './ResponsiveImage';
import { WhatsOnItem } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface WhatsOnCardProps {
  item: WhatsOnItem;
  onClick?: () => void;
  className?: string;
  priority?: boolean;
}

export const WhatsOnCard: React.FC<WhatsOnCardProps> = ({
  item,
  onClick,
  className,
  priority = false,
}) => {
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hoverVariants = {
    rest: { 
      scale: 1,
      y: 0,
    },
    hover: { 
      scale: prefersReducedMotion ? 1 : 1.02,
      y: prefersReducedMotion ? 0 : -4,
      transition: { 
        duration: 0.2,
        ease: 'easeOut'
      }
    },
  };

  return (
    <motion.div
      variants={hoverVariants}
      initial="rest"
      whileHover="hover"
      className={cn(
        // Base card styling with darker glass effect
        'relative rounded-2xl overflow-hidden',
        'bg-surface-secondary/85 backdrop-blur-md',
        'border border-border-primary/40',
        'shadow-lg hover:shadow-xl',
        // Interactive styling
        'cursor-pointer select-none',
        'transition-all duration-300',
        // Consistent full height and flex layout
        'h-full flex flex-col',
        // Remove fixed widths when inside carousel - rely on parent flex-1
        'w-full max-w-[360px]',
        className
      )}
      onClick={onClick}
    >
      {/* Image Container with fixed height and gradient overlay */}
      <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden flex-shrink-0">
        <ResponsiveImage
          src={item.image_url}
          alt={item.title}
          className="rounded-t-2xl"
          aspectRatio="4/3"
          objectFit="cover"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'low'}
        />
        
        {/* Dark gradient overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        
        {/* Badge */}
        {item.badge_text && (
          <div className="absolute top-3 left-3">
            <span className={cn(
              'inline-flex items-center px-3 py-1',
              'text-xs font-semibold',
              'bg-accent text-text-inverse',
              'rounded-full shadow-md'
            )}>
              {item.badge_text}
            </span>
          </div>
        )}
      </div>

      {/* Content Container - uses flex-1 to fill remaining space */}
      <div className="p-4 md:p-6 flex flex-col justify-between flex-1 overflow-hidden">
        {/* Title and Description */}
        <div className="space-y-2 flex-1">
          <h3 className={cn(
            'font-semibold text-base md:text-lg leading-tight',
            'text-text-primary',
            'line-clamp-2'
          )}>
            {item.title}
          </h3>
          
          {item.description && (
            <p className={cn(
              'text-sm leading-relaxed',
              'text-text-secondary',
              'line-clamp-2 overflow-hidden'
            )}>
              {item.description}
            </p>
          )}
        </div>

        {/* Date Text */}
        {item.date_text && (
          <div className="mt-3 pt-2 border-t border-border-muted flex-shrink-0">
            <p className={cn(
              'text-xs md:text-sm font-medium',
              'text-text-muted'
            )}>
              {item.date_text}
            </p>
          </div>
        )}
      </div>

      {/* Hover indicator */}
      <div className={cn(
        'absolute bottom-3 right-3 opacity-0',
        'transition-opacity duration-200',
        'group-hover:opacity-100'
      )}>
        <div className={cn(
          'w-8 h-8 rounded-full',
          'bg-accent text-text-inverse',
          'flex items-center justify-center',
          'shadow-md'
        )}>
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};