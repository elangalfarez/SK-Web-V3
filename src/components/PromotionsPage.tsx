// src/components/PromotionsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, RotateCcw } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { supabase, PromotionWithTenant, TenantCategory } from '@/lib/supabase';
import { SearchInput } from '@/components/ui/search-input';
import { CategoryPill } from '@/components/ui/category-pill';
import { PromotionCard } from '@/components/ui/promotion-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner, PageLoader, InlineLoader } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

  // UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch promotions with tenant info using the view
      const { data: promotionsData, error: promotionsError } = await supabase
        .from('v_promotions_full')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (promotionsError) throw promotionsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('tenant_categories')
        .select('*')
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      setPromotions(promotionsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  // Filter promotions based on current filters - only active promotions
  const filteredPromotions = useMemo(() => {
    return promotions.filter(promotion => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          promotion.title.toLowerCase().includes(searchTerm) ||
          promotion.tenant_name.toLowerCase().includes(searchTerm) ||
          (promotion.full_description && promotion.full_description.toLowerCase().includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.categoryId) {
        // If F&B category is selected, search within that category scope
        if (promotion.tenant_category_id !== filters.categoryId) return false;
      }

      return true;
    });
  }, [promotions, filters]);

  // Separate featured and regular promotions
  const featuredPromotions = useMemo(() => {
    // Get first few promotions as featured, or promotions with specific criteria
    return filteredPromotions.slice(0, FEATURED_LIMIT);
  }, [filteredPromotions]);

  const regularPromotions = useMemo(() => {
    return filteredPromotions.slice(FEATURED_LIMIT);
  }, [filteredPromotions]);

  // Paginated regular promotions
  const paginatedPromotions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return regularPromotions.slice(0, startIndex + ITEMS_PER_PAGE);
  }, [regularPromotions, currentPage]);

  const hasMorePages = currentPage * ITEMS_PER_PAGE < regularPromotions.length;

  // Get Food & Beverages category for special handling
  const fbCategory = categories.find(cat => cat?.name === 'Food & Beverages');

  // Handle filter changes
  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      categoryId: prev.categoryId === categoryId ? '' : categoryId 
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({ search: '', categoryId: '' });
    setCurrentPage(1);
  };

  const loadMorePromotions = async () => {
    if (!hasMorePages || loadingMore) return;
    
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
    // Could open promotion detail modal or navigate to detail page
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
            onAction={fetchData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header Section */}
      <section className="bg-surface-tertiary py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="heading-primary">What's On</span>{' '}
              <span className="heading-accent">(Promotions)</span>
            </h1>
            <p className="text-lg md:text-xl body-text max-w-2xl mx-auto">
              Discover amazing deals and special offers from our tenants
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section - Moved to top */}
      <section className="py-8 bg-surface-secondary border-y border-border-primary sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Search Bar */}
            <SearchInput
              value={filters.search}
              onChange={handleSearchChange}
              placeholder={
                filters.categoryId && fbCategory?.id === filters.categoryId
                  ? "Search Food & Beverages promotions..."
                  : "Search promotions..."
              }
              className="max-w-xl mx-auto"
            />

            {/* Filter Pills - Mobile-First Design */}
            <div className="flex flex-col gap-4">
              {/* Mobile: Horizontal Scrollable Categories */}
              <div className="md:hidden">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                  {/* Priority categories first for mobile */}
                  {categories
                    .filter(category => category && category.id && category.name)
                    .sort((a, b) => {
                      // Prioritize F&B, Fashion, Electronics for mobile
                      const priority = ['Food & Beverages', 'Fashion & Accessories', 'Gadgets & Electronics'];
                      const aIndex = priority.indexOf(a.name);
                      const bIndex = priority.indexOf(b.name);
                      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                      if (aIndex !== -1) return -1;
                      if (bIndex !== -1) return 1;
                      return 0;
                    })
                    .slice(0, 8) // Show only top 8 on mobile
                    .map((category) => (
                      <CategoryPill
                        key={category.id}
                        id={category.id}
                        name={category.name}
                        displayName={category.display_name || category.name}
                        count={promotions.filter(p => p?.tenant_category_id === category.id).length}
                        icon={category.icon || 'store'}
                        color={category.color || '#5A2E8A'}
                        isActive={filters.categoryId === category.id}
                        isSpecial={category.name === 'Food & Beverages'}
                        onClick={handleCategoryChange}
                      />
                    ))}
                  
                  {/* "More" button for additional categories */}
                  {categories.length > 8 && (
                    <button
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-surface-secondary border border-border-primary text-text-secondary hover:text-accent transition-colors duration-200"
                    >
                      <span className="text-sm font-medium whitespace-nowrap">More</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        showMobileFilters && "rotate-180"
                      )} />
                    </button>
                  )}
                </div>

                {/* Expandable Additional Categories */}
                {showMobileFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="grid grid-cols-2 gap-2 p-4 bg-surface-tertiary rounded-xl">
                      {categories
                        .filter(category => category && category.id && category.name)
                        .slice(8) // Remaining categories
                        .map((category) => (
                          <CategoryPill
                            key={category.id}
                            id={category.id}
                            name={category.name}
                            displayName={category.display_name || category.name}
                            count={promotions.filter(p => p?.tenant_category_id === category.id).length}
                            icon={category.icon || 'store'}
                            color={category.color || '#5A2E8A'}
                            isActive={filters.categoryId === category.id}
                            isSpecial={category.name === 'Food & Beverages'}
                            onClick={handleCategoryChange}
                          />
                        ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Desktop: Full Category Display */}
              <div className="hidden md:flex flex-wrap gap-2">
                {categories.filter(category => category && category.id && category.name).map((category) => (
                  <CategoryPill
                    key={category.id}
                    id={category.id}
                    name={category.name}
                    displayName={category.display_name || category.name}
                    count={promotions.filter(p => p?.tenant_category_id === category.id).length}
                    icon={category.icon || 'store'}
                    color={category.color || '#5A2E8A'}
                    isActive={filters.categoryId === category.id}
                    isSpecial={category.name === 'Food & Beverages'}
                    onClick={handleCategoryChange}
                  />
                ))}
              </div>

              {/* Clear filters */}
              {(filters.search || filters.categoryId) && (
                <div className="flex justify-center md:justify-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-text-muted hover:text-accent"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>

            {/* Active filters summary - Mobile optimized */}
            {(filters.search || filters.categoryId) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-text-muted">
                <span className="font-medium">
                  Showing {filteredPromotions.length} promotion{filteredPromotions.length !== 1 ? 's' : ''}
                </span>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                      "{filters.search}"
                    </Badge>
                  )}
                  {filters.categoryId && (
                    <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                      {categories.find(c => c.id === filters.categoryId)?.display_name}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Promotions Carousel */}
      {featuredPromotions.length > 0 && (
        <section className="py-12 md:py-16 bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold heading-primary">
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
            {filteredPromotions.length === 0 ? (
              <EmptyState 
                type={filters.search ? 'search' : filters.categoryId ? 'filter' : 'no-data'}
                onAction={clearAllFilters}
              />
            ) : (
              <motion.div
                key="promotions-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                {/* Regular Promotions Grid */}
                {paginatedPromotions.length > 0 && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {paginatedPromotions.map((promotion, index) => (
                        <motion.div
                          key={promotion.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <PromotionCard
                            promotion={promotion}
                            onClick={handlePromotionClick}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasMorePages && (
                      <div className="flex justify-center mt-12">
                        <Button
                          onClick={loadMorePromotions}
                          disabled={loadingMore}
                          size="lg"
                          className="px-8"
                        >
                          {loadingMore ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Loading...
                            </>
                          ) : (
                            `Load More Promotions (${regularPromotions.length - paginatedPromotions.length} remaining)`
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Custom Swiper Styles */}
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