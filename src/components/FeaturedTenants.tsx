// src/components/FeaturedTenants.tsx
// Refactored: Database-driven featured tenants section with responsive layouts

import React from 'react';
import { FeaturedTenantsLayout } from './ui/featured-tenants-layout';
import { FeaturedTenantCard } from './ui/featured-tenant-card';
import { useNewTenants } from '@/lib/hooks/useNewTenants';
import { cn } from '@/lib/utils';

const FeaturedTenants: React.FC = () => {
  const { items, isLoading, error, refetch } = useNewTenants({ limit: 5 });

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-surface-secondary border border-border-primary rounded-xl overflow-hidden animate-pulse"
        >
          <div className="bg-surface-tertiary h-40" />
          <div className="p-4 space-y-3">
            <div className="bg-surface-tertiary h-5 rounded w-3/4" />
            <div className="bg-surface-tertiary h-4 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  // Fallback component for no items
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <FeaturedTenantCard
            tenant={{
              id: 'placeholder',
              tenant_code: 'PLACEHOLDER',
              name: 'Coming Soon',
              description: 'New exciting stores are coming to Supermal Karawaci',
              category_display: 'Various Categories',
              main_floor: 'Multiple Floors',
              is_new_tenant: true,
            }}
            size="medium"
            className="mx-auto"
          />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          New Stores Coming Soon
        </h3>
        <p className="text-text-secondary mb-4">
          We're constantly adding new and exciting stores to our mall. Check back soon for updates!
        </p>
        <button
          onClick={() => window.location.href = '/directory'}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-accent border border-accent rounded-lg hover:bg-accent hover:text-text-inverse transition-colors duration-200"
          aria-label="Explore current stores in mall directory"
        >
          Explore Current Stores
        </button>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Unable to Load New Openings
        </h3>
        <p className="text-text-secondary mb-4">
          {error || 'We couldn\'t load the latest store information. Please try again.'}
        </p>
        <button
          onClick={refetch}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-accent border border-accent rounded-lg hover:bg-accent hover:text-text-inverse transition-colors duration-200"
          aria-label="Retry loading new store openings"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <section 
      className="py-12 md:py-20 bg-surface-tertiary"
      aria-labelledby="featured-tenants-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 
            id="featured-tenants-heading"
            className={cn(
              'text-3xl md:text-4xl lg:text-5xl font-bold mb-4',
              'heading-primary'
            )}
          >
            <span className="heading-primary">New</span>{' '}
            <span className="heading-accent">Openings</span>
          </h2>
          <p className="text-lg md:text-xl body-text max-w-2xl mx-auto">
            Discover new tenants at Supermal Karawaci
          </p>
        </div>

        {/* Content */}
        <div className="relative">

          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <FeaturedTenantsLayout 
              items={items}
              className="motion-safe:animate-fade-in"
            />
          )}
        </div>

        {/* Optional refresh button for development/debugging */}
      </div>
    </section>
  );
};

export default FeaturedTenants;