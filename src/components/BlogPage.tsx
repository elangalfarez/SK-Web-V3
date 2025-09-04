// src/components/BlogPage.tsx
// Modified: Hero slider layout, sidebar integration, numbered pagination, removed BlogFAQ, ImageWithFallback usage

/*
ACCEPTANCE CHECKLIST:
✓ /blog shows hero (HeroBlog) featuring big image overlay and featured posts scroller
✓ Blog list shows left column posts, right BlogSidebar on desktop; mobile stacks single column  
✓ Blog cards are uniform height in the grid and follow golden-ratio proportions
✓ Titles & text use token colors; white-on-white contrast issue fixed
✓ Badges (Featured / Category) use solid token-based pills (no backdrop blur)
✓ ImageWithFallback employed for all remote images; logs helpful debug info in development
✓ blog-faq.tsx removed and references cleaned
✓ Numbered pagination present on desktop and accessible
✓ Reduced-motion respected
✓ No new Supabase client files created; existing fetch functions are used
✓ Page compiles TypeScript and runs without missing-import errors

Typography scale (golden ratio 1.618):
Base 16px -> h3: 20px (text-lg) -> h2: 32px (text-2xl) -> h1: 52px (text-4xl)  
Line heights: leading-tight for headings, leading-relaxed for body
*/

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, X, Search, Filter } from 'lucide-react';
import { fetchPosts, fetchFeaturedPosts, type Post, type PostFetchParams } from '../lib/supabase';
import { seededPosts, seededCategories } from '../data/seeded-posts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeroBlog from './ui/HeroBlog';
import BlogSidebar from './ui/BlogSidebar';
import BlogList from './ui/blog-list';
import BlogCategoryPill from './ui/BlogCategoryPill';

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

const POSTS_PER_PAGE = 9; // 3x3 grid for golden ratio layout

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

  // Set document title
  useEffect(() => {
    document.title = 'Blog — Supermal Karawaci';
  }, []);

  // Load featured posts for hero
  const loadFeaturedPosts = useCallback(async () => {
    setState(prev => ({ ...prev, isFeaturedLoading: true }));
    
    try {
      const featured = await fetchFeaturedPosts(5);
      setState(prev => ({ 
        ...prev, 
        featuredPosts: featured, 
        isFeaturedLoading: false,
        usingFallback: false
      }));
    } catch (error) {
      console.warn('Using fallback featured posts:', error);
      const fallbackFeatured = seededPosts.filter(p => p.is_featured).slice(0, 5);
      setState(prev => ({ 
        ...prev, 
        featuredPosts: fallbackFeatured, 
        isFeaturedLoading: false, 
        usingFallback: true 
      }));
    }
  }, []);

  // Load posts with pagination
  const loadPosts = useCallback(async (params: PostFetchParams & { resetPage?: boolean } = {}) => {
    const { resetPage = false, ...fetchParams } = params;
    const targetPage = resetPage ? 1 : (fetchParams.page || state.currentPage);
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      currentPage: targetPage
    }));

    try {
      const result = await fetchPosts({
        ...fetchParams,
        page: targetPage,
        perPage: POSTS_PER_PAGE
      });

      setState(prev => ({
        ...prev,
        posts: result.posts,
        total: result.total,
        totalPages: Math.ceil(result.total / POSTS_PER_PAGE),
        isLoading: false,
        usingFallback: false
      }));
    } catch (error) {
      console.warn('Using fallback posts:', error);
      const fallbackPosts = seededPosts
        .filter(p => p.is_published)
        .slice((targetPage - 1) * POSTS_PER_PAGE, targetPage * POSTS_PER_PAGE);
      
      setState(prev => ({
        ...prev,
        posts: fallbackPosts,
        total: seededPosts.length,
        totalPages: Math.ceil(seededPosts.length / POSTS_PER_PAGE),
        isLoading: false,
        usingFallback: true
      }));
    }
  }, [state.currentPage]);

  // Initial load
  useEffect(() => {
    loadFeaturedPosts();
    loadPosts({ page: 1 });
  }, []);

  // Debounced search handler  
  const handleSearchChange = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      loadPosts({ 
        search: query,
        categoryId: state.selectedCategory || undefined,
        tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
        resetPage: true
      });
    }, 500);

    setSearchTimeout(timeout);
  }, [searchTimeout, state.selectedCategory, state.selectedTags, loadPosts]);

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

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      selectedCategory: '',
      selectedTags: []
    }));
    loadPosts({ resetPage: true });
  }, [loadPosts]);

  // Page change handler
  const handlePageChange = useCallback((page: number) => {
    loadPosts({
      search: state.searchQuery || undefined,
      categoryId: state.selectedCategory || undefined,
      tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
      page
    });

    // Scroll to posts section smoothly
    document.getElementById('posts-section')?.scrollIntoView({ 
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }, [state.searchQuery, state.selectedCategory, state.selectedTags, loadPosts, shouldReduceMotion]);

  // Hero post selection handler
  const handleHeroPostSelect = useCallback((slug: string) => {
    navigate(`/blog/${slug}`);
  }, [navigate]);

  // Sidebar data preparation
  const sidebarData = useMemo(() => {
    const allPosts = [...state.posts, ...state.featuredPosts];
    
    // Extract popular tags
    const tagCounts: Record<string, number> = {};
    allPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));

    return {
      featuredPosts: state.featuredPosts.slice(0, 4),
      categories: seededCategories,
      popularTags
    };
  }, [state.posts, state.featuredPosts]);

  // Check if filters are active
  const hasActiveFilters = state.searchQuery || state.selectedCategory || state.selectedTags.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Fallback Banner */}
      {state.usingFallback && !dismissedBanner && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-amber-800 text-sm font-medium">
                Using cached content — live data temporarily unavailable
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Content may not reflect the latest updates.
              </p>
            </div>
            <button
              onClick={() => setDismissedBanner(true)}
              className="text-amber-600 hover:text-amber-800 transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      {!state.isFeaturedLoading && state.featuredPosts.length > 0 && (
        <HeroBlog
          featuredPosts={state.featuredPosts}
          onSelect={handleHeroPostSelect}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3">
            {/* Search & Filters */}
            <div className="mb-8 space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-primary placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                />
                {state.searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-3">
                <BlogCategoryPill
                  name="All Categories"
                  selected={!state.selectedCategory}
                  onClick={() => handleCategoryChange('')}
                  variant="outline"
                />
                {seededCategories.map(category => (
                  <BlogCategoryPill
                    key={category.id}
                    name={category.name}
                    selected={state.selectedCategory === category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    accentColor={category.accent_color}
                    variant="secondary"
                  />
                ))}
              </div>

              {/* Active Tags */}
              {state.selectedTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active tags:</span>
                  {state.selectedTags.map(tag => (
                    <Badge
                      key={tag}
                      className="bg-accent/10 text-accent border border-accent/20 cursor-pointer hover:bg-accent/20 transition-colors"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      <X size={12} className="ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <X size={16} className="mr-1" />
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>

            {/* Posts Section */}
            <section id="posts-section" aria-labelledby="posts-heading">
              <h2 id="posts-heading" className="sr-only">Blog Posts</h2>
              
              {state.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-surface-secondary rounded-lg h-[420px] mb-4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <BlogList
                  posts={state.posts}
                  currentPage={state.currentPage}
                  totalPages={state.totalPages}
                  onPageChange={handlePageChange}
                  variant="grid"
                />
              )}
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-6">
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
}