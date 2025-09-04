// src/components/BlogPage.tsx
// Modified: Fixed to use design tokens (purple accent #5A2E8A) instead of hardcoded blue colors

// Deleted: src/components/ui/ImageWithFallback.tsx

/*
ACCEPTANCE CHECKLIST:
✓ /blog shows premium hero (HeroBlog) with full-width slider overlay matching reference
✓ Blog listing uses horizontal layout matching Good Layout Code reference  
✓ Uses design tokens: bg-accent (#5A2E8A purple) instead of bg-blue-600
✓ Images properly rounded with rounded-2xl for balanced appearance
✓ Two-column layout properly aligned with navbar/footer container (max-w-6xl)
✓ ResponsiveImage.tsx used everywhere; ImageWithFallback.tsx removed
✓ Existing data fetch functions preserved
✓ Mobile-first responsive design implemented
*/

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, X, Search, Filter, Laptop, Plane, Trophy, Briefcase, TrendingUp, Flame, BarChart3, Folder } from 'lucide-react';
import { fetchPosts, fetchFeaturedPosts, type Post, type PostFetchParams } from '../lib/supabase';
import { seededPosts, seededCategories } from '../data/seeded-posts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeroBlog from './ui/HeroBlog';
import BlogSidebar from './ui/BlogSidebar';
import BlogListHorizontal from './ui/BlogListHorizontal';
import BlogCategoryPill from './ui/BlogCategoryPill';

// Category icons mapping (from Good Layout Code reference)
const categoryIcons = {
  'Technology': Laptop,
  'Travel': Plane,
  'Sport': Trophy,
  'Business': Briefcase,
  'Management': TrendingUp,
  'Trends': Flame,
  'Startups': BarChart3,
  'News': Folder,
};

// Fallback data in case imports fail
const fallbackPosts: Post[] = [];
const fallbackCategories: any[] = [];

// Safe data access with fallbacks
const safePosts = seededPosts || fallbackPosts;
const safeCategories = seededCategories || fallbackCategories;

interface BlogPageState {
  posts: Post[];
  featuredPosts: Post[];
  isLoading: boolean;
  isFeaturedLoading: boolean;
  error: string | null;
  usingFallback: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
}

const POSTS_PER_PAGE = 6; // Fewer posts for horizontal layout

export default function BlogPage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  const [state, setState] = useState<BlogPageState>({
    posts: [],
    featuredPosts: [],
    isLoading: true,
    isFeaturedLoading: true,
    error: null,
    usingFallback: false,
    currentPage: 1,
    totalPages: 1,
    total: 0,
    searchQuery: '',
    selectedCategory: '',
    selectedTags: []
  });

  // Early return with loading state if critical data is not available
  if (!safePosts || !safeCategories) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-muted">Loading blog data...</p>
        </div>
      </div>
    );
  }

  // Set document title
  useEffect(() => {
    document.title = 'Blog - Supermal Karawaci';
  }, []);

  // Load posts with pagination and filtering
  const loadPosts = useCallback(async (params: PostFetchParams & { resetPage?: boolean } = {}) => {
    const page = params.resetPage ? 1 : params.page || state.currentPage;
    
    if (params.resetPage) {
      setState(prev => ({ ...prev, currentPage: 1 }));
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await fetchPosts({
        ...params,
        page,
        limit: POSTS_PER_PAGE
      });

      setState(prev => ({
        ...prev,
        posts: result.posts,
        currentPage: page,
        totalPages: result.totalPages,
        total: result.total,
        isLoading: false,
        usingFallback: result.usingFallback || false
      }));

    } catch (error) {
      console.error('Failed to load posts:', error);
      
      // Fallback to seeded data
      const filteredPosts = safePosts.filter(post => {
        const matchesSearch = !params.search || 
          post.title.toLowerCase().includes(params.search.toLowerCase()) ||
          (post.summary && post.summary.toLowerCase().includes(params.search.toLowerCase()));
        
        const matchesCategory = !params.categoryId || post.category?.id === params.categoryId;
        
        const matchesTags = !params.tags?.length || 
          params.tags.some(tag => Array.isArray(post.tags) && post.tags.includes(tag));
        
        return matchesSearch && matchesCategory && matchesTags;
      });

      const startIndex = (page - 1) * POSTS_PER_PAGE;
      const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
      const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

      setState(prev => ({
        ...prev,
        posts: paginatedPosts,
        currentPage: page,
        totalPages,
        total: filteredPosts.length,
        isLoading: false,
        usingFallback: true,
        error: 'Failed to load posts from server. Showing fallback data.'
      }));
    }
  }, [state.currentPage]);

  // Load featured posts
  const loadFeaturedPosts = useCallback(async () => {
    setState(prev => ({ ...prev, isFeaturedLoading: true }));

    try {
      const featured = await fetchFeaturedPosts({ limit: 5 });
      setState(prev => ({
        ...prev,
        featuredPosts: featured.posts,
        isFeaturedLoading: false
      }));
    } catch (error) {
      console.error('Failed to load featured posts:', error);
      // Use first 3 seeded posts as featured
      setState(prev => ({
        ...prev,
        featuredPosts: safePosts.slice(0, 3),
        isFeaturedLoading: false
      }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPosts();
    loadFeaturedPosts();
  }, [loadPosts, loadFeaturedPosts]);

  // Hero post selection
  const handleHeroPostSelect = useCallback((slug: string) => {
    navigate(`/blog/${slug}`);
  }, [navigate]);

  // Category filter handler
  const handleCategoryChange = useCallback((categoryId: string) => {
    setState(prev => ({ ...prev, selectedCategory: categoryId }));
    loadPosts({
      search: state.searchQuery || undefined,
      categoryId: categoryId || undefined,
      tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
      resetPage: true
    });
  }, [state.searchQuery, state.selectedTags, loadPosts]);

  // Tag filter handler
  const handleTagToggle = useCallback((tag: string) => {
    const newTags = state.selectedTags.includes(tag)
      ? state.selectedTags.filter(t => t !== tag)
      : [...state.selectedTags, tag];

    setState(prev => ({ ...prev, selectedTags: newTags }));
    loadPosts({
      search: state.searchQuery || undefined,
      categoryId: state.selectedCategory || undefined,
      tags: newTags.length > 0 ? newTags : undefined,
      resetPage: true
    });
  }, [state.searchQuery, state.selectedCategory, state.selectedTags, loadPosts]);

  // Page change handler for Load More
  const handleLoadMore = useCallback(() => {
    if (state.currentPage < state.totalPages) {
      loadPosts({
        search: state.searchQuery || undefined,
        categoryId: state.selectedCategory || undefined,
        tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
        page: state.currentPage + 1
      });
    }
  }, [state.searchQuery, state.selectedCategory, state.selectedTags, state.currentPage, state.totalPages, loadPosts]);

  // Sidebar data with proper safety checks
  const sidebarData = useMemo(() => {
    // Safe guard against undefined arrays
    const safePostsArray = Array.isArray(safePosts) ? safePosts : [];
    const safeFeaturedPosts = Array.isArray(state.featuredPosts) ? state.featuredPosts : [];
    const safeCategoriesArray = Array.isArray(safeCategories) ? safeCategories : [];
    
    const allTags = Array.from(new Set(
      safePostsArray.flatMap(post => Array.isArray(post.tags) ? post.tags : [])
    )).slice(0, 12);

    const popularTags = allTags.map(tag => ({
      name: tag,
      count: safePostsArray.filter(post => Array.isArray(post.tags) && post.tags.includes(tag)).length
    })).sort((a, b) => b.count - a.count);

    return {
      featuredPosts: safeFeaturedPosts.slice(0, 3),
      categories: safeCategoriesArray,
      popularTags
    };
  }, [state.featuredPosts]);

  // Wrap render in try-catch for error boundary
  try {
    return (
      <div className="min-h-screen bg-surface-tertiary">
        {/* Error Banner */}
        {state.error && !dismissedBanner && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: -50 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            className="bg-warning/10 border border-warning/20 px-4 py-3 mx-4 mt-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-warning" />
                <p className="text-sm text-text-primary">
                  {state.error}
                </p>
              </div>
              <button
                onClick={() => setDismissedBanner(true)}
                className="text-warning hover:text-warning transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Hero Section - Full width slider with overlay */}
        {!state.isFeaturedLoading && Array.isArray(state.featuredPosts) && state.featuredPosts.length > 0 && (
          <HeroBlog
            featuredPosts={state.featuredPosts}
            onSelect={handleHeroPostSelect}
          />
        )}

        {/* Main Content Container - matches navbar/footer width */}
        <div className="px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header Section - Category Pills matching reference */}
            <div className="text-center mb-12">
              <h1 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-8">EXPLORE TRENDING TOPICS</h1>

              {/* Topic Categories - Using design tokens instead of hardcoded blue */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {Array.isArray(safeCategories) && safeCategories.slice(0, 6).map((category) => {
                  const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons];
                  return (
                    <BlogCategoryPill
                      key={category.id}
                      name={category.name}
                      selected={state.selectedCategory === category.id}
                      onClick={() => handleCategoryChange(state.selectedCategory === category.id ? '' : category.id)}
                      variant="secondary"
                      className="px-4 py-2 text-sm font-medium"
                      icon={IconComponent && <IconComponent className="w-4 h-4" />}
                    />
                  );
                })}
              </div>

              <div className="flex justify-center gap-4">
                {Array.isArray(safeCategories) && safeCategories.slice(6, 8).map((category) => {
                  const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons];
                  return (
                    <BlogCategoryPill
                      key={category.id}
                      name={category.name}
                      selected={state.selectedCategory === category.id}
                      onClick={() => handleCategoryChange(state.selectedCategory === category.id ? '' : category.id)}
                      variant="secondary"
                      className="px-4 py-2 text-sm font-medium"
                      icon={IconComponent && <IconComponent className="w-4 h-4" />}
                    />
                  );
                })}
              </div>
            </div>

            {/* Two Column Layout matching reference */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Horizontal Blog Posts (2/3 width) */}
              <div className="lg:col-span-2">
                {state.isLoading ? (
                  <div className="space-y-8">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex gap-6">
                        <div className="w-[45%] h-60 bg-surface-secondary rounded-2xl"></div>
                        <div className="w-[55%] space-y-4">
                          <div className="h-4 bg-surface-secondary rounded w-1/3"></div>
                          <div className="h-8 bg-surface-secondary rounded w-3/4"></div>
                          <div className="h-16 bg-surface-secondary rounded"></div>
                          <div className="h-10 bg-surface-secondary rounded w-32"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <BlogListHorizontal posts={state.posts} />
                    
                    {/* Load More Button - Using design tokens */}
                    {state.currentPage < state.totalPages && (
                      <div className="mt-12 text-center">
                        <Button
                          onClick={handleLoadMore}
                          variant="outline"
                          size="lg"
                          className="px-8 py-3 border-accent text-accent hover:bg-accent hover:text-text-inverse"
                          disabled={state.isLoading}
                        >
                          Load More Posts
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right Column - Sidebar (1/3 width) */}
              <div className="space-y-8">
                <BlogSidebar
                  featuredPosts={sidebarData.featuredPosts}
                  categories={sidebarData.categories}
                  popularTags={sidebarData.popularTags}
                  onTagClick={handleTagToggle}
                  onCategoryClick={handleCategoryChange}
                  onSubscribe={(email) => {
                    console.log('Newsletter subscription:', email);
                    // TODO: Implement newsletter subscription
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('BlogPage render error:', error);
    return (
      <div className="min-h-screen bg-surface-tertiary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-secondary rounded-full flex items-center justify-center">
            <span className="text-text-muted text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-4">Something went wrong</h1>
          <p className="text-text-muted mb-6">
            We're having trouble loading the blog page. Please try refreshing the page.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-accent hover:bg-accent-hover text-text-inverse"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
}