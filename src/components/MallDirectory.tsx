// src/components/MallDirectory.tsx  
// Modified: Updated grid to ensure equal card heights using CSS grid auto-rows

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, Filter, X } from 'lucide-react';
import { useTenants } from '@/lib/hooks/useTenants';
import { TenantCard } from './ui/tenant-card';
import { SearchInput } from './ui/search-input';
import { CategoryPillList } from './ui/category-pill-list';
import { CategoryFilterDrawer } from './ui/category-filter-drawer';
import { LoadingSpinner } from './ui/loading-spinner';
import { Button } from './ui/button';
import { TenantGridSkeleton } from './ui/skeletons/tenant-card-skeleton';

export default function MallDirectory() {
  // State management using the useTenants hook
  const {
    tenants,
    categories,
    loading,
    error,
    total,
    hasMore,
    search,
    categoryId: activeCategory,
    setSearch,
    setActiveCategory,
    loadMore,
    refresh,
    clearFilters,
  } = useTenants({
    perPage: 50,
    enableRealtime: false,
    debounceMs: 300,
    initialCategoryId: 'all'
  });

  // UI state
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Transform categories for UI consumption
  const transformedCategories = useMemo(() => {
    const allCategory = { 
      id: 'all', 
      name: 'All Categories', 
      tenant_count: total 
    };
    
    return [allCategory, ...categories.map(cat => ({
      id: cat.id,
      name: cat.display_name || cat.name,
      tenant_count: cat.tenant_count
    }))];
  }, [categories, total]);

  // Load more with loading state
  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setLoadingMore(false);
    }
  }, [loadMore]);

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4 }
    },
    exit: { opacity: 0, scale: 0.95 }
  };

  // Show loading skeleton on initial load
  if (loading && tenants.length === 0) {
    return (
      <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="heading-primary">Mall</span> <span className="heading-accent">Directory</span>
            </h1>
            <p className="text-lg md:text-xl body-text max-w-2xl mx-auto">
              Discover all the amazing stores and dining options at Supermal Karawaci
            </p>
          </div>
          
          <TenantGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Unable to load directory
            </h1>
            <p className="text-text-muted mb-6">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold"
          >
            <span className="heading-primary">Mall</span> <span className="heading-accent">Directory</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl body-text max-w-2xl mx-auto"
          >
            Discover all the amazing stores and dining options at Supermal Karawaci
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search stores, brands, categories..."
            className="w-full"
          />
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          {/* Desktop Category Pills */}
          <div className="hidden md:block">
            <CategoryPillList
              categories={transformedCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Mobile Category Filter Button */}
          <div className="md:hidden flex justify-center">
            <Button
              onClick={() => setShowCategoryDrawer(true)}
              variant="outline"
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {activeCategory === 'all' ? 'All Categories' : 
                transformedCategories.find(c => c.id === activeCategory)?.name || 'Filter'}
              {(search || activeCategory !== 'all') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  className="ml-1 p-0.5 hover:bg-border-secondary rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${search}-${activeCategory}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
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
                  className="space-y-6"
                >
                  {/* UPDATED GRID: Added auto-rows-fr equivalent and h-full on cards for equal heights */}
                  <motion.div 
                    className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    style={{ gridAutoRows: '1fr' }} // Forces equal row heights
                  >
                    {tenants.map((tenant, index) => (
                      <motion.div
                        key={tenant.id}
                        variants={itemVariants}
                        custom={index}
                        className="h-full" // Ensures card stretches to fill grid cell
                      >
                        <TenantCard tenant={tenant} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center">
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        disabled={loadingMore}
                        className="gap-2"
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
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Category Filter Drawer */}
      <CategoryFilterDrawer
        isOpen={showCategoryDrawer}
        onClose={() => setShowCategoryDrawer(false)}
        categories={transformedCategories}
        activeCategory={activeCategory === 'all' ? '' : activeCategory}
        onCategorySelect={(categoryId) => {
          setActiveCategory(categoryId || 'all');
          setShowCategoryDrawer(false);
        }}
      />
    </div>
  );
}