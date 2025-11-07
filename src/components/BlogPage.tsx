// src/components/BlogPage.tsx
// Modified: Two-column layout, numerical pagination, proper hero integration, contrast fixes

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, X, Laptop, Plane, Trophy, Briefcase, TrendingUp, Flame, BarChart3, Folder } from 'lucide-react';
import { fetchPosts, fetchFeaturedPosts, type Post, type PostFetchParams } from '../lib/supabase';
import { seededPosts, seededCategories } from '../data/seeded-posts';
import HeroBlog from './ui/HeroBlog';
import BlogSidebar from './ui/BlogSidebar';
import BlogListHorizontal from './ui/BlogListHorizontal';
import BlogCategoryPill from './ui/BlogCategoryPill';

// Category icons mapping
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
const fallbackCategories: { id: string; name: string; slug?: string }[] = [];

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

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [dismissedBanner, setDismissedBanner] = useState(false);

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

  // Fetch posts with pagination
  const fetchPostsData = useCallback(async (params: PostFetchParams = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await fetchPosts({
        page: state.currentPage,
        perPage: POSTS_PER_PAGE,
        search: state.searchQuery || undefined,
        categoryId: state.selectedCategory || undefined,
        tags: state.selectedTags.length > 0 ? state.selectedTags : undefined,
        ...params
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
      console.warn('Failed to fetch posts, using fallback data:', error);
      
      // Filter seeded posts based on current filters
      let filteredPosts = [...safePosts];
      
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(query) ||
          post.summary?.toLowerCase().includes(query)
        );
      }
      
      if (state.selectedCategory) {
        filteredPosts = filteredPosts.filter(post => 
          post.category?.id === state.selectedCategory
        );
      }
      
      const total = filteredPosts.length;
      const startIndex = (state.currentPage - 1) * POSTS_PER_PAGE;
      const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
      
      setState(prev => ({
        ...prev,
        posts: paginatedPosts,
        total: total,
        totalPages: Math.ceil(total / POSTS_PER_PAGE),
        isLoading: false,
        usingFallback: true,
        error: 'Using offline data. Some features may be limited.'
      }));
    }
  }, [state.currentPage, state.searchQuery, state.selectedCategory, state.selectedTags]);

  // Fetch featured posts
  const fetchFeaturedData = useCallback(async () => {
    setState(prev => ({ ...prev, isFeaturedLoading: true }));
    
    try {
      const featured = await fetchFeaturedPosts(3);
      setState(prev => ({
        ...prev,
        featuredPosts: featured,
        isFeaturedLoading: false
      }));
    } catch (error) {
      console.warn('Failed to fetch featured posts, using fallback:', error);
      const featuredFallback = safePosts.filter(post => post.is_featured).slice(0, 3);
      setState(prev => ({
        ...prev,
        featuredPosts: featuredFallback,
        isFeaturedLoading: false
      }));
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchPostsData();
    fetchFeaturedData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (state.currentPage !== 1) {
      setState(prev => ({ ...prev, currentPage: 1 }));
    } else {
      fetchPostsData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.searchQuery, state.selectedCategory, state.selectedTags]);

  // Handle category filter change
  const handleCategoryChange = useCallback((categoryId: string) => {
    setState(prev => ({
      ...prev,
      selectedCategory: categoryId,
      currentPage: 1
    }));
  }, []);

  // Handle search - removed unused function

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
    // Scroll to top of blog content
    document.getElementById('blog-content')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle hero post selection
  const handleHeroPostSelect = useCallback((slug: string) => {
    navigate(`/blog/${slug}`);
  }, [navigate]);

  // Generate popular tags from posts
  const popularTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    state.posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });
    
    return Array.from(tagCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [state.posts]);

  // Render pagination
  const renderPagination = () => {
    if (state.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(state.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            i === state.currentPage
              ? 'bg-accent text-text-inverse'
              : 'text-text-primary hover:bg-surface-secondary border border-border-primary'
          }`}
          aria-label={`Go to page ${i}`}
          aria-current={i === state.currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-12">
        <button
          onClick={() => handlePageChange(state.currentPage - 1)}
          disabled={state.currentPage <= 1}
          className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-secondary border border-border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          Previous
        </button>
        
        {pages}
        
        <button
          onClick={() => handlePageChange(state.currentPage + 1)}
          disabled={state.currentPage >= state.totalPages}
          className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-secondary border border-border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Error Banner */}
      {state.error && !dismissedBanner && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -50 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="bg-warning/10 border-b border-warning/20 px-6 py-3"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-warning" />
              <p className="text-sm text-text-primary">{state.error}</p>
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

      <div className="px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          {!state.isFeaturedLoading && state.featuredPosts.length > 0 && (
            <div className="mb-12">
              <HeroBlog
                featuredPosts={state.featuredPosts}
                onSelect={handleHeroPostSelect}
              />
            </div>
          )}

          {/* Category Pills Section */}
          <div className="text-center mb-12" id="blog-content">
            <h1 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-8">
              EXPLORE TRENDING TOPICS
            </h1>

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

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Blog Posts (2/3 width) */}
            <div className="lg:col-span-2">
              {state.isLoading ? (
                <div className="space-y-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-6 pb-8 animate-pulse">
                      <div className="w-[45%] h-60 bg-surface-secondary rounded-2xl" />
                      <div className="w-[55%] space-y-4">
                        <div className="h-4 bg-surface-secondary rounded w-1/3" />
                        <div className="h-8 bg-surface-secondary rounded w-full" />
                        <div className="h-4 bg-surface-secondary rounded w-2/3" />
                        <div className="h-10 bg-surface-secondary rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <BlogListHorizontal posts={state.posts} />
                  {renderPagination()}
                </>
              )}
            </div>

            {/* Right Column - Sidebar (1/3 width) */}
            <div className="lg:col-span-1">
              <BlogSidebar
                featuredPosts={state.featuredPosts.slice(0, 3)}
                categories={safeCategories}
                popularTags={popularTags}
                onTagClick={(tag) => setState(prev => ({ 
                  ...prev, 
                  selectedTags: prev.selectedTags.includes(tag) 
                    ? prev.selectedTags.filter(t => t !== tag)
                    : [...prev.selectedTags, tag],
                  currentPage: 1
                }))}
                onCategoryClick={handleCategoryChange}
                showAuthor={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}