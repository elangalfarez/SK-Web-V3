// src/components/MallDirectory.tsx
// Modified: replaced mock data with useTenants hook, added server pagination, Load More, and ErrorBoundary
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Sparkles } from 'lucide-react';
import { CategoryPillList, Category } from './ui/category-pill-list';
import { CategoryFilterDrawer } from './ui/category-filter-drawer';
import { TenantCard } from './ui/tenant-card';
import { Button } from './ui/button';
import { LoadingSpinner } from './ui/loading-spinner';
import { MallDirectorySkeleton, TenantGridSkeleton } from './ui/skeletons/tenant-card-skeleton';
import { ErrorBoundary } from './ui/error-boundary';
import { useTenants } from '@/lib/hooks/useTenants';
import { cn } from '@/lib/utils';

// Types - updated to match real database schema
export interface Tenant {
  id: string;
  name: string;
  brand_name: string;
  category_id: string;
  category_name?: string;
  main_floor: string;
  logo_url?: string;
  is_featured: boolean;
  is_new_tenant: boolean;
  description?: string;
  operating_hours?: any;
}

interface MallDirectoryProps {
  className?: string;
}

const MallDirectory: React.FC<MallDirectoryProps> = ({ className }) => {
  // Use the custom hook for data management
  const {
    tenants,
    categories,
    loading,
    error,
    total,
    hasMore,
    search,
    setSearch,
    categoryId: activeCategory,
    setActiveCategory,
    loadMore,
    refresh,
    clearFilters
  } = useTenants({
    perPage: 50,
    enableRealtime: false, // Can be enabled if needed
    debounceMs: 300
  });

  // UI state
  const [showCategoryDrawer, setShowCategoryDrawer] = React.useState(false);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);

  // Transform categories to match CategoryPillList interface
  const transformedCategories = useMemo((): Category[] => {
    return categories.map(category => ({
      id: category.id,
      name: category.display_name || category.name,
      count: category.tenant_count,
      icon: category.icon || 'store'
    }));
  }, [categories]);

  // Handle load more with loading state
  const handleLoadMore = async () => {
    if (loadingMore || loading || !hasMore) return;
    
    setLoadingMore(true);
    try {
      await loadMore();
    } catch (error) {
      console.error('Error loading more tenants:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Loading skeleton on initial load
  if (loading && tenants.length === 0) {
    return <MallDirectorySkeleton />;
  }

  // Error state
  if (error && tenants.length === 0) {
    return (
      <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-surface-tertiary rounded-full flex items-center justify-center">
                  <Search className="h-10 w-10 text-text-muted" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Failed to load directory
              </h3>
              <p className="text-text-secondary mb-6">{error}</p>
              <Button onClick={refresh} className="px-6 py-3">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe animation variants that don't conflict with data
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 10
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "tween",
        duration: 0.3
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className={cn("min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8", className)}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Mall <span className="text-accent">Directory</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Discover all the amazing brands and experiences waiting for you at Supermal Karawaci
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mb-8"
          >
            <div className={cn(
              'relative transition-all duration-300',
              isSearchFocused && 'transform scale-[1.02]'
            )}>
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className={cn(
                  'h-5 w-5 transition-colors duration-200',
                  isSearchFocused ? 'text-accent' : 'text-text-muted'
                )} />
              </div>
              <input
                type="text"
                placeholder="Search for stores, brands, or categories..."
                value={search || ''}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  'w-full pl-14 pr-6 py-4 bg-surface-secondary border-2 rounded-2xl text-lg',
                  'placeholder:text-text-muted text-text-primary transition-all duration-200',
                  'focus:outline-none focus:border-accent focus:bg-surface focus:shadow-lg',
                  isSearchFocused 
                    ? 'border-accent shadow-lg' 
                    : 'border-border-primary hover:border-border-secondary'
                )}
              />
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <CategoryPillList
              categories={transformedCategories}
              activeCategory={activeCategory || 'all'}
              onCategoryChange={setActiveCategory}
              onFilterClick={() => setShowCategoryDrawer(true)}
              maxVisibleMobile={5}
              showFilterButton={true}
              pillSize="md"
              showCounts={true}
            />
          </motion.div>

          {/* Results Count & Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-6 flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-text-secondary">
                {tenants.length > 0 ? (
                  <>
                    Showing <span className="font-semibold text-text-primary">{tenants.length}</span> 
                    {total > tenants.length && (
                      <span> of <span className="font-semibold text-text-primary">{total}</span></span>
                    )}
                    {' '}{tenants.length === 1 ? 'store' : 'stores'}
                    {search && (
                      <span> for "<span className="font-semibold text-accent">{search}</span>"</span>
                    )}
                    {activeCategory && activeCategory !== 'all' && (
                      <span> in <span className="font-semibold text-accent">
                        {transformedCategories.find(c => c.id === activeCategory)?.name}
                      </span></span>
                    )}
                  </>
                ) : (
                  'No results found'
                )}
              </p>
              
              {/* Clear filters button */}
              {(search || (activeCategory && activeCategory !== 'all')) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-accent hover:text-accent-hover underline transition-colors duration-200"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            {tenants.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-text-muted text-sm">
                <Building2 className="h-4 w-4" />
                <span>Floor Guide Available</span>
              </div>
            )}
          </motion.div>

          {/* Tenant Grid */}
          <AnimatePresence mode="wait">
            {tenants.length > 0 ? (
              <motion.div
                key="tenant-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-8"
              >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tenants.map((tenant, index) => {
                  // Validate tenant data before rendering
                  if (!tenant || !tenant.id) {
                    console.warn('Skipping invalid tenant:', tenant);
                    return null;
                  }

                  return (
                    <ErrorBoundary key={tenant.id}>
                      <motion.div variants={itemVariants}>
                        <TenantCard tenant={tenant} />
                      </motion.div>
                    </ErrorBoundary>
                  );
                })}
              </div>

                {/* Load More Section */}
                {hasMore && (
                  <div className="flex flex-col items-center gap-4 pt-8">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore || loading}
                      size="lg"
                      className="px-8 py-3"
                    >
                      {loadingMore ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Loading more stores...
                        </>
                      ) : (
                        <>
                          Load More Stores
                          <span className="ml-2 text-sm opacity-75">
                            ({total - tenants.length} remaining)
                          </span>
                        </>
                      )}
                    </Button>
                    
                    {/* Loading skeleton for additional items */}
                    {loadingMore && (
                      <div className="w-full">
                        <TenantGridSkeleton count={8} />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="text-center py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="mb-6 relative">
                    <div className="w-24 h-24 mx-auto bg-surface-tertiary rounded-full flex items-center justify-center">
                      <Search className="h-10 w-10 text-text-muted" />
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute top-0 right-1/2 transform translate-x-8 -translate-y-2"
                    >
                      <Sparkles className="h-6 w-6 text-accent opacity-60" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    No stores found
                  </h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">
                    {search ? (
                      <>
                        We couldn't find any stores matching "<span className="font-semibold text-accent">{search}</span>".
                        <br />Try adjusting your search or browse by category.
                      </>
                    ) : (
                      'No stores available in this category at the moment.'
                    )}
                  </p>
                  {search && (
                    <div className="space-y-3">
                      <Button
                        onClick={clearFilters}
                        className="px-6 py-3"
                      >
                        Clear search & show all stores
                      </Button>
                      <div className="text-sm text-text-muted">
                        or try searching for: fashion, food, entertainment, electronics
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Filter Drawer - Mobile */}
          <CategoryFilterDrawer
            isOpen={showCategoryDrawer}
            onClose={() => setShowCategoryDrawer(false)}
            categories={transformedCategories}
            activeCategory={activeCategory || 'all'}
            onCategoryChange={setActiveCategory}
            searchPlaceholder="Search store categories..."
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MallDirectory;