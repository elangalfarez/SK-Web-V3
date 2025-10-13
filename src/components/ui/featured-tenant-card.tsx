// src/components/ui/featured-tenant-card.tsx
// Modified: Applied purple gradient badge matching whats-on-card.tsx style

import React from 'react';
import { Star } from 'lucide-react';
import { ResponsiveImage } from './ResponsiveImage';
import { cn } from '@/lib/utils';
import type { FeaturedTenant } from '@/lib/supabase';

interface FeaturedTenantCardProps {
  tenant: FeaturedTenant;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Revolutionary card component with next-generation animations
 * Features physics-based hover effects and layered micro-interactions
 */
export const FeaturedTenantCard: React.FC<FeaturedTenantCardProps> = ({
  tenant,
  size = 'small',
  className,
}) => {
  // Size-based configurations - optimized for viewport fitting
  const sizeConfig = {
    small: {
      card: 'w-full max-w-[280px] h-[380px]',
      image: 'h-48',
      aspectRatio: '4/3' as const,
      padding: 'p-5',
      title: 'text-lg font-bold',
      category: 'text-sm',
      badge: 'px-3 py-1.5 text-xs'
    },
    medium: {
      card: 'w-full max-w-[320px] h-[420px]',
      image: 'h-52',
      aspectRatio: '4/3' as const,
      padding: 'p-6',
      title: 'text-xl font-bold',
      category: 'text-base',
      badge: 'px-3 py-1.5 text-sm'
    },
    large: {
      card: 'w-full h-[480px]',
      image: 'h-64 lg:h-72',
      aspectRatio: '16/9' as const,
      padding: 'p-8',
      title: 'text-2xl lg:text-3xl font-bold',
      category: 'text-lg',
      badge: 'px-4 py-2 text-base'
    }
  };

  const config = sizeConfig[size];

  // Generate fallback letter for missing images
  const getFallbackLetter = () => {
    return tenant.name?.charAt(0)?.toUpperCase() || 'N';
  };

  // Get display image (prefer logo_url, fallback to banner_url)
  const imageUrl = tenant.logo_url || tenant.banner_url;

  // Get category display text
  const categoryText = tenant.category_display || tenant.category;

  return (
    <div
      className={cn(
        // Base card styling with advanced backdrop effects
        'relative bg-surface-secondary/95 backdrop-blur-xl border border-border-primary/50',
        'rounded-2xl shadow-xl overflow-hidden',
        
        // Revolutionary hover animations - multi-layered transforms
        'transition-all duration-700 ease-out',
        'hover:shadow-2xl hover:shadow-accent/20',
        'hover:-translate-y-3 hover:scale-[1.02]',
        'hover:bg-surface-secondary hover:border-accent/30',
        
        // Advanced transform effects
        'transform-gpu will-change-transform',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent/0 before:to-accent/5',
        'before:opacity-0 before:transition-opacity before:duration-700',
        'hover:before:opacity-100',
        
        // Physics-based rotation on hover
        'hover:rotate-[0.5deg]',
        
        // Remove click outline and make non-focusable
        'outline-none focus:outline-none cursor-default',
        
        config.card,
        className
      )}
      role="article"
      aria-label={`New opening: ${tenant.name}${categoryText ? ` - ${categoryText}` : ''}`}
    >
      {/* Image Container with Layered Effects */}
      <div className={cn('relative overflow-hidden bg-surface-tertiary', config.image)}>
        {imageUrl ? (
          <ResponsiveImage
            src={imageUrl}
            alt={tenant.name}
            className={cn(
              'w-full h-full object-cover',
              'transition-all duration-1000 ease-out',
              'hover:scale-110 hover:brightness-110'
            )}
            aspectRatio={config.aspectRatio}
            objectFit="cover"
            fallbackLetter={getFallbackLetter()}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-tertiary">
            <div className="text-6xl font-bold text-accent/40">{getFallbackLetter()}</div>
          </div>
        )}

        {/* Gradient Overlay with Depth */}
        {imageUrl && (
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
            'opacity-50 transition-opacity duration-700',
            'hover:opacity-30'
          )}>
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className={cn(
                'text-white font-bold text-sm tracking-wider drop-shadow-2xl',
                'transition-all duration-500 ease-out',
                'hover:tracking-widest hover:scale-110'
              )}>
                NOW OPEN
              </span>
            </div>
          </div>
        )}

        {/* Floating New Badge with Purple Gradient */}
        <div 
          className={cn(
            'absolute top-4 right-4 inline-flex items-center gap-2 rounded-full',
            'text-on-colored-surface font-bold purple-glow backdrop-blur-sm',
            
            // Revolutionary badge animations
            'transition-all duration-500 ease-out',
            'hover:scale-110 hover:-rotate-3',
            
            // Floating animation
            'animate-[float_3s_ease-in-out_infinite]',
            
            config.badge
          )}
          style={{
            background: 'linear-gradient(135deg, var(--color-purple-accent-dark) 0%, var(--color-purple-accent) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'float 3s ease-in-out infinite'
          }}
        >
          <Star className={cn(
            'w-4 h-4 fill-current drop-shadow-sm',
            'transition-transform duration-300 hover:rotate-180'
          )} />
          <span className="drop-shadow-sm">New!</span>
        </div>
      </div>

      {/* Content with Staggered Animations */}
      <div className={cn(config.padding, 'flex flex-col flex-1 justify-between')}>
        {/* Title with Advanced Typography Effects */}
        <div className="space-y-3">
          <h3 
            className={cn(
              'text-text-primary line-clamp-2 leading-tight',
              'transition-all duration-500 ease-out',
              'hover:text-accent hover:tracking-wide',
              'transform hover:translate-x-1',
              config.title
            )}
            title={tenant.name}
          >
            {tenant.name}
          </h3>

          {/* Category with Slide Animation */}
          {categoryText && (
            <p className={cn(
              'text-text-secondary font-medium',
              'transition-all duration-400 ease-out delay-100',
              'hover:text-accent-light hover:translate-x-2',
              config.category
            )}>
              {categoryText}
            </p>
          )}
        </div>

        {/* Floor info with Icon Animation */}
        {tenant.main_floor && (
          <div className={cn(
            'flex items-center gap-2 mt-4 pt-4 border-t border-border-secondary/30',
            'transition-all duration-300 ease-out delay-200',
            'hover:border-accent/30'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full bg-accent',
              'transition-all duration-300 ease-out',
              'hover:scale-150 hover:bg-accent-light'
            )} />
            <span className={cn(
              'text-xs text-text-muted font-medium tracking-wide',
              'transition-all duration-300 ease-out',
              'hover:text-accent hover:tracking-wider'
            )}>
              Floor {tenant.main_floor}
            </span>
          </div>
        )}
      </div>

      {/* Animated Border Glow Effect */}
      <div className={cn(
        'absolute inset-0 rounded-2xl pointer-events-none',
        'bg-gradient-to-r from-accent/20 via-accent-light/20 to-accent/20',
        'opacity-0 transition-opacity duration-700',
        'hover:opacity-100',
        'blur-sm'
      )} />
    </div>
  );
};