// src/components/ui/FeaturedRestaurantCard.tsx
// Purpose: World-class card component with proper contrast and responsive design
// Files scanned: ui/ResponsiveImage.tsx, tailwind.config.js, src/index.css

import React, { useState } from 'react';
import { ResponsiveImage } from './ResponsiveImage';
import { Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EnrichedFeaturedRestaurant } from '@/lib/hooks/useFeaturedRestaurants';

interface FeaturedRestaurantCardProps {
  item: EnrichedFeaturedRestaurant;
  onClick?: () => void;
  className?: string;
}

export const FeaturedRestaurantCard: React.FC<FeaturedRestaurantCardProps> = ({
  item,
  onClick,
  className = '',
}) => {
  const [supportsReducedMotion, setSupportsReducedMotion] = useState(false);
  
  React.useEffect(() => {
    setSupportsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  
  const fallbackLetter = item.title.charAt(0).toUpperCase();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      onClick={handleClick}
      className={cn(
        'group bg-surface-secondary rounded-2xl shadow-lg overflow-hidden cursor-pointer',
        'border border-border-primary',
        'transition-all duration-300 ease-out',
        !supportsReducedMotion && 'hover:shadow-xl hover:-translate-y-2',
        'focus:outline-none focus:ring-2 focus:ring-accent/20',
        'h-full flex flex-col',
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-labelledby={`restaurant-title-${item.id}`}
    >
      {/* Image Container */}
      <div className="relative">
        <ResponsiveImage
          src={item.imageUrl}
          alt={item.imageAlt}
          className="w-full h-40 md:h-48 object-cover"
          aspectRatio="4/3"
          objectFit="cover"
          loading="lazy"
          fallbackLetter={fallbackLetter}
        />
      {/* Feature Badge - Top Left Only */}
      {item.highlight && (
        <div className="absolute top-4 left-4">
          <span 
            className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--color-purple-accent-dark) 0%, var(--color-purple-accent) 100%)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 0 20px var(--color-purple-glow), 0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            {item.highlight}
          </span>
          <span className="sr-only">Featured badge: {item.highlight}</span>
        </div>
      )}
      </div>
      
      {/* Content - High Contrast with Proper Spacing */}
      <div className="flex-1 flex flex-col p-4 md:p-6">
        {/* Title Only - No Price */}
        <div className="mb-3">
          <h3 
            id={`restaurant-title-${item.id}`}
            className="text-lg md:text-xl font-bold text-text-primary line-clamp-1"
          >
            {item.title}
          </h3>
        </div>
        
        {/* Category with Food Icon */}
        <div className="flex items-center text-text-secondary mb-4">
          <Utensils className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{item.subtitle}</span>
        </div>
        
        {/* Description - Better Contrast */}
        {item.description && (
          <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
};