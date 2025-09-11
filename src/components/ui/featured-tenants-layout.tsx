// src/components/ui/featured-tenants-layout.tsx
// Created: Ultra-modern layout with revolutionary viewport-optimized presentation

import React from 'react';
import { FeaturedTenantCard } from './featured-tenant-card';
import { cn } from '@/lib/utils';
import type { FeaturedTenant } from '@/lib/supabase';

interface FeaturedTenantsLayoutProps {
  items: FeaturedTenant[];
  className?: string;
}

/**
 * Revolutionary layout component with physics-based animations
 * Optimized for perfect viewport fitting and cutting-edge UX
 */
export const FeaturedTenantsLayout: React.FC<FeaturedTenantsLayoutProps> = ({
  items,
  className,
}) => {
  const count = items.length;

  if (count === 0) {
    return null;
  }

  // Staggered animation delays for cascade effect
  const getAnimationDelay = (index: number) => `${index * 100}ms`;

  // One tenant: Spectacular centered presentation
  if (count === 1) {
    return (
      <div className={cn(
        'flex justify-center',
        'motion-safe:animate-[fadeInScale_0.8s_ease-out]',
        className
      )}>
        <div className="w-full lg:w-2/3 max-w-2xl">
          <FeaturedTenantCard
            tenant={items[0]}
            size="large"
            className="w-full"
          />
        </div>
      </div>
    );
  }

  // Two tenants: Synchronized dual presentation
  if (count === 2) {
    return (
      <div className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto',
        'motion-safe:animate-[slideUpStagger_0.9s_ease-out]',
        className
      )}>
        {items.map((tenant, index) => (
          <div
            key={tenant.id}
            style={{ animationDelay: getAnimationDelay(index) }}
            className="motion-safe:animate-[slideUpStagger_0.6s_ease-out_both]"
          >
            <FeaturedTenantCard
              tenant={tenant}
              size="medium"
              className="w-full h-full"
            />
          </div>
        ))}
      </div>
    );
  }

  // Three tenants: Asymmetrical mastery layout
  if (count === 3) {
    return (
      <div className={cn(
        'grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto',
        'motion-safe:animate-[slideUpStagger_1s_ease-out]',
        className
      )}>
        {/* Hero card spans 3 columns */}
        <div 
          className="lg:col-span-3"
          style={{ animationDelay: '0ms' }}
        >
          <FeaturedTenantCard
            tenant={items[0]}
            size="large"
            className="w-full h-full"
          />
        </div>

        {/* Two companion cards in right column */}
        <div className="lg:col-span-2 grid grid-cols-1 gap-6">
          {items.slice(1).map((tenant, index) => (
            <div
              key={tenant.id}
              style={{ animationDelay: getAnimationDelay(index + 1) }}
              className="motion-safe:animate-[slideUpStagger_0.6s_ease-out_both]"
            >
              <FeaturedTenantCard
                tenant={tenant}
                size="medium"
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Four or Five tenants: Perfect viewport-fitting grid on desktop, horizontal scroll on mobile
  if (count <= 5) {
    return (
      <div className={cn(
        'max-w-7xl mx-auto',
        'motion-safe:animate-[slideUpStagger_1.2s_ease-out]',
        className
      )}>
        {/* Mobile: Horizontal scroll */}
        <div className="block lg:hidden">
          <div 
            className={cn(
              'overflow-x-auto overflow-y-hidden pb-6',
              'scroll-smooth scrollbar-hide',
              'motion-safe:[scroll-behavior:smooth]'
            )}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex gap-4 px-4">
              {items.map((tenant, index) => (
                <div
                  key={tenant.id}
                  style={{ animationDelay: getAnimationDelay(index) }}
                  className="motion-safe:animate-[slideInFromRight_0.6s_ease-out_both] flex-shrink-0"
                >
                  <FeaturedTenantCard
                    tenant={tenant}
                    size="small"
                    className="w-[280px]" // Fixed width for consistent mobile experience
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile scroll indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {items.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-1.5 h-1.5 rounded-full bg-accent/30',
                  'transition-all duration-300 ease-out'
                )}
                style={{ animationDelay: getAnimationDelay(index + items.length) }}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6">
          {items.map((tenant, index) => (
            <div
              key={tenant.id}
              style={{ animationDelay: getAnimationDelay(index) }}
              className={cn(
                'motion-safe:animate-[slideUpStagger_0.6s_ease-out_both]',
                // Responsive column spanning for perfect fitting
                count === 4 && index < 2 ? 'lg:col-span-2' : 'lg:col-span-1',
                count === 4 && index >= 2 ? 'lg:col-start-2 lg:col-span-2' : ''
              )}
            >
              <FeaturedTenantCard
                tenant={tenant}
                size="small"
                className="w-full mx-auto"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Six or more tenants: Enhanced carousel with smooth scroll
  return (
    <div className={cn('relative max-w-7xl mx-auto', className)}>
      {/* Revolutionary scroll container with momentum */}
      <div 
        className={cn(
          'overflow-x-auto overflow-y-hidden pb-6',
          'scroll-smooth scrollbar-hide',
          // Physics-based scroll momentum
          'motion-safe:[scroll-behavior:smooth]'
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex gap-6 min-w-max px-4">
          {items.map((tenant, index) => (
            <div
              key={tenant.id}
              style={{ animationDelay: getAnimationDelay(index) }}
              className="motion-safe:animate-[slideInFromRight_0.6s_ease-out_both]"
            >
              <FeaturedTenantCard
                tenant={tenant}
                size="small"
                className="flex-shrink-0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Elegant fade gradient for visual continuation */}
      <div 
        className="absolute right-0 top-0 bottom-6 w-16 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to right, transparent 0%, var(--color-surface-tertiary) 80%)'
        }}
      />
      
      {/* Progressive enhancement: scroll indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {items.slice(0, Math.min(items.length, 8)).map((_, index) => (
          <div
            key={index}
            className={cn(
              'w-1.5 h-1.5 rounded-full bg-accent/30',
              'transition-all duration-300 ease-out',
              'hover:bg-accent hover:scale-125'
            )}
            style={{ animationDelay: getAnimationDelay(index + items.length) }}
          />
        ))}
      </div>
    </div>
  );
};