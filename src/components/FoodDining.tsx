// src/components/FoodDining.tsx
// Purpose: World-class responsive grid layout with proper contrast and spacing
// Files scanned: existing FoodDining.tsx, useFeaturedRestaurants hook, FeaturedRestaurantCard

import { Link } from 'react-router-dom';
import { FeaturedRestaurantCard } from './ui/FeaturedRestaurantCard';
import { useFeaturedRestaurants } from '@/lib/hooks/useFeaturedRestaurants';

const FoodDining = () => {
  const { items, isLoading, error } = useFeaturedRestaurants({ limit: 6 });

  // World-class loading skeleton
  const renderLoadingSkeleton = () => (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-live="polite"
      aria-label="Loading featured restaurants"
    >
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="bg-surface-secondary rounded-2xl shadow-lg overflow-hidden border border-border-primary"
        >
          <div className="h-40 md:h-48 bg-surface-tertiary animate-pulse" />
          <div className="p-4 md:p-6">
            <div className="mb-3">
              <div className="h-6 bg-surface-tertiary rounded animate-pulse" />
            </div>
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-surface-tertiary rounded animate-pulse mr-2" />
              <div className="h-4 bg-surface-tertiary rounded animate-pulse flex-1" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-surface-tertiary rounded animate-pulse" />
              <div className="h-4 bg-surface-tertiary rounded animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Elegant error state
  const renderError = () => (
    <div className="text-center py-16">
      <div className="bg-surface-secondary rounded-2xl p-8 max-w-md mx-auto border border-border-primary shadow-lg">
        <div className="w-16 h-16 bg-accent-subtle rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl font-bold text-accent">!</span>
        </div>
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          Temporarily Unavailable
        </h3>
        <p className="text-text-secondary mb-6 leading-relaxed">
          Our featured restaurants are currently being updated. Please check back shortly.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary py-3 px-6 rounded-lg font-semibold focus:ring-2 focus:ring-accent/20"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Premium empty state
  const renderEmptyState = () => (
    <div className="text-center py-16">
      <div className="bg-surface-secondary rounded-2xl p-12 max-w-lg mx-auto border border-border-primary shadow-lg">
        <div className="w-20 h-20 bg-accent-subtle rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-3xl font-bold text-accent">F</span>
        </div>
        <h3 className="text-2xl font-semibold text-text-primary mb-6">
          Featured Restaurants Coming Soon
        </h3>
        <p className="text-text-secondary leading-relaxed text-lg">
          We're carefully selecting the finest dining experiences to showcase here. 
          Check back soon for our curated restaurant collection.
        </p>
      </div>
    </div>
  );

  return (
    <section className="py-12 md:py-20 bg-surface-tertiary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Premium Typography */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight">
            Culinary <span className="text-accent">Experiences</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            From street snacks to fine dining - savor the best flavors all in one place
          </p>
        </div>
        
        {/* Content States */}
        {isLoading && renderLoadingSkeleton()}

        {error && !isLoading && renderError()}

        {!isLoading && !error && items.length === 0 && renderEmptyState()}

        {/* World-Class Responsive Grid */}
        {!isLoading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {items.map((item) => (
                <FeaturedRestaurantCard
                  key={item.id}
                  item={item}
                  className="h-full"
                />
              ))}
            </div>
            
            {/* Premium CTA with Link to Directory */}
            <div className="text-center">
              <Link 
                to="/directory"
                className="inline-block px-6 md:px-8 py-3 md:py-4 btn-primary font-semibold rounded-full text-sm md:text-base focus:ring-2 focus:ring-accent/20 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                Explore All Restaurants
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FoodDining;