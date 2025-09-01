// src/components/MallDirectory.tsx
// Modified: removed local Tenant interface, import from lib/supabase
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
import { SearchInput } from './ui/search-input';
import { Hero } from './ui/Hero';
import { useTenants } from '@/lib/hooks/useTenants';
import { Tenant } from '@/lib/supabase'; // Import Tenant type from supabase
import { cn } from '@/lib/utils';

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
  const [loadingMore, setLoadingMore] = React.useState(false);

  // Transform categories to match CategoryPillList interface (filter out synthetic "All Categories")
  const transformedCategories = useMemo((): Category[] => {
    return categories
      .filter(category => category.id !== 'all') // Remove synthetic "All Categories" 
      .map(category => ({
        id: category.id,
        name: category.display_name || category.name,
        count: category.tenant_count,
        icon: category.icon || 'store'
      }));
  }, [categories]);

  // Custom category change handler with toggle logic (like PromotionsPage)
  const handleCategoryChange = (categoryId: string) => {
    if (activeCategory === categoryId) {
      // If clicking the same category, deselect it (show all)
      setActiveCategory('all');
    } else {
      // Select the new category
      setActiveCategory(categoryId);
    }
  };

  // Dynamic placeholder based on active category
  const searchPlaceholder = useMemo(() => {
    if (activeCategory && activeCategory !== 'all') {
      const categoryName = transformedCategories.find(c => c.id === activeCategory)?.name;
      return categoryName ? `Search in ${categoryName}...` : 'Search stores and brands...';
    }
    return 'Search stores and brands...';
  }, [activeCategory, transformedCategories]);

  // Handle load more with loading state
  const handleLoadMore = async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const emptyStateVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: 0.2 
      }
    }
  };

  if (loading && tenants.length === 0) {
    return (
      <div className={cn('min-h-screen bg-surface', className)}>
        <Hero
          title="Mall Directory"
          subtitle="Discover all the amazing stores and services at Supermal Karawaci"
          backgroundImage="/images/mall-directory-hero.jpg"
          className="mb-12"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <MallDirectorySkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-surface', className)}>
      {/* Hero Section */}
      <Hero
        title="Mall Directory"
        subtitle="Discover all the amazing stores and services at Supermal Karawaci"
        backgroundImage="/images/mall-directory-hero.jpg"
        className="mb-12"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="space-y-8">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={searchPlaceholder}
                icon={Search}
                className="w-full"
              />
            </div>

            {/* Category Pills - Desktop */}
            <div className="hidden lg:block">
              <CategoryPillList
                categories={transformedCategories}
                activeCategory={activeCategory === 'all' ? null : activeCategory}
                onCategoryChange={handleCategoryChange}
                showAll={true}
                className="justify-center"
              />
            </div>

            {/* Category Filter Button - Mobile */}
            <div className="lg:hidden flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowCategoryDrawer(true)}
                className="flex items-center gap-2 px-6 py-3"
              >
                <Building2 className="h-4 w-4" />
                Filter Categories
                {activeCategory && activeCategory !== 'all' && (
                  <span className="ml-1 bg-accent text-white px-2 py-0.5 rounded-full text-xs">
                    {transformedCategories.find(c => c.id === activeCategory)?.name}
                  </span>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-warning/10 border border-warning/20 rounded-xl p-4 text-center"
            >
              <p className="text-sm text-warning-600">
                {error.includes('cached') ? (
                  <>
                    <Sparkles className="inline h-4 w-4 mr-1" />
                    {error} - Data may not reflect the latest changes.
                  </>
                ) : (
                  error
                )}
              </p>
            </motion.div>
          )}

          {/* Results Summary & Filters */}
          <AnimatePresence mode="wait">
            <motion.div
              key="results-header"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4"
            >
              <div className="space-y-1">
                <p className="text-sm text-text-muted">
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
                          <>Load More Stores</>
                        )}
                      </Button>
                      
                      {total > tenants.length && (
                        <p className="text-sm text-text-muted text-center">
                          {tenants.length} of {total} stores shown
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  variants={emptyStateVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="text-center py-16 space-y-6"
                >
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 bg-surface-tertiary rounded-full flex items-center justify-center">
                      <Search className="h-10 w-10 text-text-muted" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-text-primary mb-3">
                      No stores found
                    </h3>
                    
                    <p className="text-text-muted mb-6 leading-relaxed">
                      {search || activeCategory !== 'all' ? (
                        <>We couldn't find any stores matching your current search criteria. Try adjusting your filters or search terms.</>
                      ) : (
                        <>Sorry, there are no stores available right now. Please check back later.</>
                      )}
                    </p>

                    {(search || activeCategory !== 'all') && (
                      <div className="space-y-3">
                        <Button
                          onClick={clearFilters}
                          variant="outline"
                          className="mr-3"
                        >
                          Clear Filters
                        </Button>
                        <Button
                          onClick={refresh}
                          variant="default"
                        >
                          Refresh
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Category Filter Drawer */}
      <CategoryFilterDrawer
        isOpen={showCategoryDrawer}
        onClose={() => setShowCategoryDrawer(false)}
        categories={transformedCategories}
        activeCategory={activeCategory === 'all' ? null : activeCategory}
        onCategoryChange={(categoryId) => {
          handleCategoryChange(categoryId);
          setShowCategoryDrawer(false);
        }}
      />
    </div>
  );
};

export default MallDirectory;