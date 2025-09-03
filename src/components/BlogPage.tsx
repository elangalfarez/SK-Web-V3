// src/components/BlogPage.tsx
// Created: Blog listing page with server-side fetch and fallback to local seeded posts

/*
ACCEPTANCE CHECKLIST:
✓ Visiting /blog shows featured scroller + paginated posts listing
✓ Search by title/summary filters posts (server-side)
✓ Clicking a post navigates to /blog/:slug and shows title, date, image, sanitized body HTML, related posts, and share buttons
✓ src/lib/supabase.ts exports fetchPosts, fetchPostBySlug, fetchFeaturedPosts, searchPosts and the Post/Category types
✓ All UI uses Tailwind tokens and CSS var fallback for DB-provided accent colors (no hardcoded hex values)
✓ Keyboard navigation & aria attributes present for cards, filters, FAQ
✓ prefers-reduced-motion respected
✓ If Supabase is unreachable, UI falls back to seeded-posts.ts and shows a small banner "Showing cached posts — live data unavailable"
✓ SQL migrations create the tables and RLS policies described; sample data inserts successfully
*/

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { fetchPosts, fetchFeaturedPosts, type Post, type PostFetchParams } from '../lib/supabase';
import { seededPosts } from '../data/seeded-posts';
import Hero from './ui/Hero';
import BlogCard from './ui/blog-card';
import BlogList from './ui/blog-list';
import BlogFilters from './ui/blog-filters';
import BlogFAQ from './ui/blog-faq';
import { Button } from './ui/Button';

interface BlogPageState {
  posts: Post[];
  featuredPosts: Post[];
  isLoading: boolean;
  isFeaturedLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  usingFallback: boolean;
  currentPage: number;
  hasMore: boolean;
  total: number;
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  featuredOnly: boolean;
}

const POSTS_PER_PAGE = 12;

export default function BlogPage() {
  const shouldReduceMotion = useReducedMotion();
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const [state, setState] = useState<BlogPageState>({
    posts: [],
    featuredPosts: [],
    isLoading: true,
    isFeaturedLoading: true,
    isLoadingMore: false,
    error: null,
    usingFallback: false,
    currentPage: 1,
    hasMore: false,
    total: 0,
    searchQuery: '',
    selectedCategory: '',
    selectedTags: [],
    featuredOnly: false
  });

  // Set document title
  useEffect(() => {
    document.title = 'Blog — Supermal Karawaci';
  }, []);

  // Debounced search effect
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        searchQuery: query, 
        currentPage: 1, 
        posts: [], 
        isLoading: true 
      }));
    }, 300);
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  // Fetch featured posts
  const loadFeaturedPosts = useCallback(async () => {
    setState(prev => ({ ...prev, isFeaturedLoading: true }));
    
    try {
      const featured = await fetchFeaturedPosts(6);
      setState(prev => ({ 
        ...prev, 
        featuredPosts: featured, 
        isFeaturedLoading: false,
        usingFallback: false 
      }));
    } catch (error) {
      console.warn('Failed to fetch featured posts, using seeded data');
      const featuredSeeded = seededPosts.filter(post => post.is_featured).slice(0, 6);
      setState(prev => ({ 
        ...prev, 
        featuredPosts: featuredSeeded, 
        isFeaturedLoading: false,
        usingFallback: true 
      }));
    }
  }, []);

  // Fetch posts with current filters
  const loadPosts = useCallback(async (isLoadMore: boolean = false) => {
    const params: PostFetchParams = {
      page: isLoadMore ? state.currentPage + 1 : 1,
      perPage: POSTS_PER_PAGE,
      search: state.searchQuery || undefined,
      categoryId: state.selectedCategory || undefined,
      tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
      isFeatured: state.featuredOnly || undefined
    };

    setState(prev => ({ 
      ...prev, 
      [isLoadMore ? 'isLoadingMore' : 'isLoading']: true,
      error: null
    }));

    try {
      const result = await fetchPosts(params);
      setState(prev => ({
        ...prev,
        posts: isLoadMore ? [...prev.posts, ...result.posts] : result.posts,
        currentPage: result.page,
        hasMore: result.hasMore,
        total: result.total,
        [isLoadMore ? 'isLoadingMore' : 'isLoading']: false,
        usingFallback: false
      }));
    } catch (error) {
      console.warn('Failed to fetch posts, using seeded data');
      const filteredSeeded = seededPosts.filter(post => {
        if (state.searchQuery) {
          const searchLower = state.searchQuery.toLowerCase();
          if (!post.title.toLowerCase().includes(searchLower) && 
              !post.summary?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        if (state.selectedCategory && post.category_id !== state.selectedCategory) {
          return false;
        }
        if (state.selectedTags.length > 0) {
          if (!state.selectedTags.some(tag => post.tags.includes(tag))) {
            return false;
          }
        }
        if (state.featuredOnly && !post.is_featured) {
          return false;
        }
        return true;
      });

      setState(prev => ({
        ...prev,
        posts: isLoadMore ? [...prev.posts, ...filteredSeeded] : filteredSeeded,
        total: filteredSeeded.length,
        hasMore: false,
        [isLoadMore ? 'isLoadingMore' : 'isLoading']: false,
        usingFallback: true,
        error: 'Unable to connect to live data'
      }));
    }
  }, [state.searchQuery, state.selectedCategory, state.selectedTags, state.featuredOnly, state.currentPage]);

  // Load initial data
  useEffect(() => {
    loadFeaturedPosts();
  }, [loadFeaturedPosts]);

  useEffect(() => {
    loadPosts();
  }, [state.searchQuery, state.selectedCategory, state.selectedTags, state.featuredOnly]);

  const handleLoadMore = () => {
    loadPosts(true);
  };

  const handleFiltersChange = (filters: {
    search: string;
    category: string;
    tags: string[];
    featuredOnly: boolean;
  }) => {
    setState(prev => ({
      ...prev,
      selectedCategory: filters.category,
      selectedTags: filters.tags,
      featuredOnly: filters.featuredOnly,
      currentPage: 1,
      posts: []
    }));
    debouncedSearch(filters.search);
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      selectedCategory: '',
      selectedTags: [],
      featuredOnly: false,
      currentPage: 1,
      posts: [],
      isLoading: true
    }));
  };

  // Memoized featured posts scroller
  const featuredSection = useMemo(() => {
    if (state.featuredPosts.length === 0) return null;

    return (
      <section aria-labelledby="featured-heading" className="mb-12">
        <h2 id="featured-heading" className="text-2xl font-bold text-primary mb-6">
          Featured Posts
        </h2>
        <div 
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin' }}
        >
          {state.featuredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              className="flex-none w-80 snap-start"
              initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }, [state.featuredPosts, shouldReduceMotion]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-surface-secondary rounded-lg h-48 mb-4"></div>
          <div className="bg-surface-secondary rounded h-6 w-3/4 mb-2"></div>
          <div className="bg-surface-secondary rounded h-4 w-1/2"></div>
        </div>
      ))}
    </div>
  );
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero
        title="Blog"
        subtitle="Stay updated with the latest news, events, and stories from Supermal Karawaci"
        className="mb-16"
      />

      {/* Fallback Banner */}
      {state.usingFallback && !dismissedBanner && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-amber-800 text-sm font-medium">
                Showing cached posts — live data unavailable
              </p>
              <p className="text-amber-700 text-sm mt-1">
                Some content may not be current. We're working to restore the connection.
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Featured Posts Scroller */}
        {state.isFeaturedLoading ? (
          <div className="mb-12">
            <div className="bg-surface-secondary rounded h-8 w-48 mb-6 animate-pulse"></div>
            <div className="flex gap-6 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex-none w-80">
                  <div className="bg-surface-secondary rounded-lg h-64 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : featuredSection}

        {/* Filters */}
        <BlogFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          searchQuery={state.searchQuery}
          selectedCategory={state.selectedCategory}
          selectedTags={state.selectedTags}
          featuredOnly={state.featuredOnly}
          className="mb-8"
        />

        {/* Posts Grid */}
        <section aria-labelledby="posts-heading" className="mb-12">
          <h2 id="posts-heading" className="sr-only">Blog Posts</h2>
          
          {state.isLoading ? (
            <LoadingSkeleton />
          ) : state.posts.length > 0 ? (
            <>
              <BlogList posts={state.posts} />
              
              {/* Load More Button */}
              {state.hasMore && (
                <div className="text-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={state.isLoadingMore}
                    variant="outline"
                    size="lg"
                    className="min-w-[140px]"
                  >
                    {state.isLoadingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}

              {/* Results count */}
              <div className="text-center mt-8">
                <p className="text-sm text-muted-foreground">
                  Showing {state.posts.length} of {state.total} posts
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No posts found</p>
              <p className="text-sm text-muted-foreground mb-6">
                Try adjusting your search criteria or clear filters to see all posts.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          )}
        </section>
        {/* FAQ Section */}
        <BlogFAQ />
      </main>
    </div>
  );
}