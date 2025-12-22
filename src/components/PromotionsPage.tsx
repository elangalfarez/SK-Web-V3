// src/components/PromotionsPage.tsx
// Modified: removed sticky search section, added standard segregating section with full-width search
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import {
  fetchPromotions,
  fetchFeaturedPromotions,
  fetchTenantCategories,
  PromotionWithTenant,
  TenantCategory,
  PromotionFetchParams
} from '@/lib/supabase';
import { useSEO } from '@/lib/hooks/useSEO';
import { PAGE_SEO } from '@/lib/seo/page-seo';
import { SearchInput } from '@/components/ui/search-input';
import { CategoryPillList, Category } from '@/components/ui/category-pill-list';
import { CategoryFilterDrawer } from '@/components/ui/category-filter-drawer';
import { PromotionCard } from '@/components/ui/promotion-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner, PageLoader } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hero } from '@/components/ui/Hero';

// Types for filters - simplified since we only show active promotions
interface FilterState {
  search: string;
  categoryId: string;
}

// Pagination constants
const ITEMS_PER_PAGE = 12;
const FEATURED_LIMIT = 6;

const PromotionsPage: React.FC = () => {
  // Data state
  const [promotions, setPromotions] = useState<PromotionWithTenant[]>([]);
  const [featuredPromotions, setFeaturedPromotions] = useState<PromotionWithTenant[]>([]);
  const [categories, setCategories] = useState<TenantCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state - simplified for active promotions only
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categoryId: ''
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [, setTotalPromotions] = useState(0);
  const [hasMorePromotions, setHasMorePromotions] = useState(false);

  // UI state
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);

  // SEO
  useSEO(
    PAGE_SEO.promotions,
    [
      { name: 'Home', url: '/' },
      { name: 'Promotions', url: '/promotions' },
    ]
  );

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    if (loading) return; // Skip if initial load
    fetchFilteredData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Load more data when page changes
  useEffect(() => {
    if (currentPage === 1 || loading) return; // Skip first page and initial load
    loadMoreData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [promotionsResult, featuredResult, categoriesData] = await Promise.all([
        fetchPromotions({ 
          page: 1, 
          perPage: ITEMS_PER_PAGE,
          status: 'published'
        }),
        fetchFeaturedPromotions(FEATURED_LIMIT),
        fetchTenantCategories()
      ]);

      setPromotions(promotionsResult.data);
      setTotalPromotions(promotionsResult.total);
      setHasMorePromotions(promotionsResult.hasMore);
      setFeaturedPromotions(featuredResult);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredData = async () => {
    try {
      setError(null);
      setCurrentPage(1);

      const params: PromotionFetchParams = {
        page: 1,
        perPage: ITEMS_PER_PAGE,
        status: 'published'
      };

      if (filters.search) params.search = filters.search;
      if (filters.categoryId) params.categoryId = filters.categoryId;

      const result = await fetchPromotions(params);
      
      setPromotions(result.data);
      setTotalPromotions(result.total);
      setHasMorePromotions(result.hasMore);
    } catch (err) {
      console.error('Error fetching filtered data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load promotions');
    }
  };

  const loadMoreData = async () => {
    if (!hasMorePromotions || loadingMore) return;
    
    try {
      setLoadingMore(true);
      
      const params: PromotionFetchParams = {
        page: currentPage,
        perPage: ITEMS_PER_PAGE,
        status: 'published'
      };

      if (filters.search) params.search = filters.search;
      if (filters.categoryId) params.categoryId = filters.categoryId;

      const result = await fetchPromotions(params);
      
      setPromotions(prev => [...prev, ...result.data]);
      setHasMorePromotions(result.hasMore);
    } catch (err) {
      console.error('Error loading more data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more promotions');
    } finally {
      setLoadingMore(false);
    }
  };

  // Transform categories to match our Category interface (no synthetic "All Categories" pill)
  const transformedCategories = useMemo((): Category[] => {
    return categories
      .filter(category => category && category.id && category.name)
      .map(category => ({
        id: category.id,
        name: category.display_name || category.name,
        count: 0, // We'll let the server handle filtering, so count isn't needed
        icon: category.icon || 'store'
      }));
  }, [categories]);

  // Dynamic placeholder based on active category
  const searchPlaceholder = useMemo(() => {
    if (filters.categoryId) {
      const categoryName = transformedCategories.find(c => c.id === filters.categoryId)?.name;
      return categoryName ? `Search in ${categoryName} promotions...` : 'Search promotions...';
    }
    return 'Search promotions...';
  }, [filters.categoryId, transformedCategories]);

  // Handle filter changes
  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      categoryId: prev.categoryId === categoryId ? '' : categoryId 
    }));
  };

  const clearAllFilters = () => {
    setFilters({ search: '', categoryId: '' });
  };

  const loadMorePromotions = async () => {
    if (!hasMorePromotions || loadingMore) return;
    
    setLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentPage(prev => prev + 1);
    setLoadingMore(false);
  };

  // Handle promotion click (could open modal, navigate, etc.)
  const handlePromotionClick = (promotion: PromotionWithTenant) => {
    // For now, just log - could implement modal or navigation
    console.log('Clicked promotion:', promotion);
  };

  if (loading) {
    return <PageLoader message="Loading promotions..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState 
            type="error" 
            title="Failed to load promotions"
            description={error}
            actionLabel="Try Again"
            onAction={fetchInitialData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header Section - Using reusable Hero component */}
      <Hero
        title={<>What's On <span className="text-accent">(Promotions)</span></>}
        subtitle="Discover amazing deals and special offers from our tenants"
        variant="default"
        bgPattern="soft-circles"
      />

      {/* Search & Filter Section - Standard segregating section with full-width search */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Full-Width Search Bar */}
            <SearchInput
              value={filters.search}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              debounceMs={300}
            />

            {/* Category Filter Pills */}
            <CategoryPillList
              categories={transformedCategories}
              activeCategory={filters.categoryId}
              onCategoryChange={handleCategoryChange}
              onFilterClick={() => setShowCategoryDrawer(true)}
            />

            {/* Clear Filters Button */}
            {(filters.search || filters.categoryId) && (
              <div className="flex justify-center">
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Promotions Section */}
      {featuredPromotions.length > 0 && (
        <section className="py-12 md:py-16 bg-surface-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                  Featured Promotions
                </h2>
                <Badge variant="secondary">
                  {featuredPromotions.length} Featured
                </Badge>
              </div>

              <div className="relative">
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  spaceBetween={24}
                  slidesPerView={1}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true
                  }}
                  navigation
                  loop={featuredPromotions.length > 1}
                  breakpoints={{
                    640: {
                      slidesPerView: 2,
                    },
                    1024: {
                      slidesPerView: 3,
                    },
                    1280: {
                      slidesPerView: 4,
                    }
                  }}
                  className="featured-promotions-swiper"
                >
                  {featuredPromotions.map((promotion) => (
                    <SwiperSlide key={promotion.id}>
                      <PromotionCard
                        promotion={promotion}
                        isFeatured
                        onClick={handlePromotionClick}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Promotions Grid */}
      <section className="py-12 md:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {promotions.length === 0 ? (
              <EmptyState 
                type={filters.search ? 'search' : filters.categoryId ? 'filter' : 'no-data'}
                title={
                  filters.search ? 'No promotions found' :
                  filters.categoryId ? 'No promotions in this category' : 
                  'No promotions available'
                }
                description={
                  filters.search ? `Try adjusting your search terms or browse all promotions.` :
                  filters.categoryId ? 'Try selecting a different category or browse all promotions.' :
                  'Check back soon for amazing deals and offers from our tenants.'
                }
                actionLabel={filters.search || filters.categoryId ? 'Clear Filters' : 'Refresh'}
                onAction={filters.search || filters.categoryId ? clearAllFilters : fetchInitialData}
              />
            ) : (
              <motion.div
                key="promotions-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {promotions.map((promotion, index) => (
                    <motion.div
                      key={promotion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <PromotionCard
                        promotion={promotion}
                        onClick={handlePromotionClick}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMorePromotions && (
                  <div className="mt-12 text-center">
                    <Button
                      onClick={loadMorePromotions}
                      variant="outline"
                      size="lg"
                      disabled={loadingMore}
                      className="gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Loading...
                        </>
                      ) : (
                        `Load More Promotions`
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Category Filter Drawer - Mobile */}
      <CategoryFilterDrawer
        isOpen={showCategoryDrawer}
        onClose={() => setShowCategoryDrawer(false)}
        categories={transformedCategories}
        activeCategory={filters.categoryId}
        onCategoryChange={handleCategoryChange}
        searchPlaceholder="Search promotion categories..."
      />

      {/* Custom Swiper Styles - using semantic tokens */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .featured-promotions-swiper {
            padding-bottom: 50px !important;
          }
          
          .featured-promotions-swiper .swiper-pagination {
            bottom: 0 !important;
          }
          
          .featured-promotions-swiper .swiper-pagination-bullet {
            background: var(--color-accent) !important;
            opacity: 0.3;
          }
          
          .featured-promotions-swiper .swiper-pagination-bullet-active {
            opacity: 1;
          }
          
          .featured-promotions-swiper .swiper-button-next,
          .featured-promotions-swiper .swiper-button-prev {
            color: var(--color-accent) !important;
            font-weight: bold;
          }
        `
      }} />
    </div>
  );
};

export default PromotionsPage;