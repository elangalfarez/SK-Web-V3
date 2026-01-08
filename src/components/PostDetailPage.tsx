// src/components/PostDetailPage.tsx
// World-class Medium-style reading experience with optimal typography and navbar-aligned layout

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Copy, Check, ChevronLeft, ChevronRight, Home, Clock, Facebook, MessageCircle } from 'lucide-react';
import DOMPurify from 'dompurify';
import { fetchPostBySlug, fetchPosts, type Post } from '../lib/supabase';
import { seededPosts, seededCategories } from '../data/seeded-posts';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import BlogSidebar from './ui/BlogSidebar';
import BlogListHorizontal from './ui/BlogListHorizontal';
import { ResponsiveImage } from './ui/ResponsiveImage';
import BlogCategoryPill from './ui/BlogCategoryPill';
import { useSEO } from '@/lib/hooks/useSEO';
import { getBlogPostSEO } from '@/lib/seo/page-seo';
import { generateBlogPostSchema } from '@/lib/seo/structured-data';
import { cn } from '@/lib/utils';

interface PostDetailState {
  post: Post | null;
  relatedPosts: Post[];
  prevPost: Post | null;
  nextPost: Post | null;
  isLoading: boolean;
  notFound: boolean;
  usingFallback: boolean;
}

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [copySuccess, setCopySuccess] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const [state, setState] = useState<PostDetailState>({
    post: null,
    relatedPosts: [],
    prevPost: null,
    nextPost: null,
    isLoading: true,
    notFound: false,
    usingFallback: false
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Estimate reading time
  const estimateReadTime = (content: string | null) => {
    if (!content) return '5 min read';
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  // Reading progress tracker
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setReadingProgress(Math.min(scrollPercent * 100, 100));
    };

    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  // Share functionality with enhanced error handling
  const handleShare = async (platform?: 'x' | 'facebook' | 'whatsapp' | 'copy') => {
    if (!state.post) return;

    const url = window.location.href;
    const text = `Check out this post: ${state.post.title}`;

    try {
      if (platform === 'copy' || !platform) {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        }
        return;
      }

      const shareUrls = {
        x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
      };

      window.open(shareUrls[platform], '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    } catch (error) {
      console.error('Share failed:', error);
      // Show a user-friendly error message
      alert('Failed to share. Please copy the URL manually.');
    }
  };

  // Handle keyboard navigation
  // Note: ArrowLeft = Previous (older post = nextPost in array)
  //       ArrowRight = Next (newer post = prevPost in array)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) return; // Allow browser shortcuts

    switch (e.key) {
      case 'ArrowLeft':
        // Previous = older post = nextPost in array order
        if (state.nextPost) {
          e.preventDefault();
          navigate(`/blog/${state.nextPost.slug}`);
        }
        break;
      case 'ArrowRight':
        // Next = newer post = prevPost in array order
        if (state.prevPost) {
          e.preventDefault();
          navigate(`/blog/${state.prevPost.slug}`);
        }
        break;
      case 'Escape':
        e.preventDefault();
        navigate('/blog');
        break;
    }
  }, [state.prevPost, state.nextPost, navigate]);

  // Keyboard navigation event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // SEO - dynamically updates when post loads
  useSEO(
    state.post
      ? {
          ...getBlogPostSEO(state.post),
          structuredData: {
            type: 'BlogPosting',
            data: generateBlogPostSchema({
              title: state.post.title,
              summary: state.post.summary,
              slug: state.post.slug,
              image_url: state.post.image_url,
              created_at: state.post.created_at,
              updated_at: state.post.updated_at || undefined,
              publish_at: state.post.publish_at || undefined,
              category: state.post.category,
              tags: state.post.tags,
            }),
          },
        }
      : {
          title: state.notFound ? 'Post Not Found' : 'Loading...',
          description: state.notFound
            ? 'The blog post you are looking for could not be found.'
            : 'Loading blog post from Supermal Karawaci',
        },
    state.post
      ? [
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
          { name: state.post.title, url: `/blog/${state.post.slug}` },
        ]
      : undefined
  );

  // Scroll to top when post changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [slug, shouldReduceMotion]);

  // Fetch post data with comprehensive error handling and fallback logic
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        notFound: false, 
        error: null 
      }));

      try {
        console.log('Fetching post with slug:', slug);
        
        // Try to fetch from database first
        const post = await fetchPostBySlug(slug);
        
        if (post) {
          console.log('Post found:', post.title);
          
          // Fetch all posts to find prev/next navigation
          let allPosts: Post[] = [];
          let relatedPosts: Post[] = [];
          
          try {
            const allPostsResult = await fetchPosts({
              perPage: 100 // Get enough posts for navigation
            });
            allPosts = allPostsResult.posts;
            
            // Find current post index for prev/next navigation
            const currentIndex = allPosts.findIndex(p => p.id === post.id);
            const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
            const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
            
            // Get related posts (same category, excluding current)
            relatedPosts = allPosts.filter(p => 
              p.id !== post.id && 
              p.category?.id === post.category?.id
            ).slice(0, 3);
            
            setState(prev => ({ 
              ...prev, 
              post, 
              relatedPosts,
              prevPost,
              nextPost,
              usingFallback: false,
              isLoading: false
            }));
          } catch (relatedError) {
            console.warn('Failed to fetch related posts, using basic post data:', relatedError);
            setState(prev => ({ 
              ...prev, 
              post, 
              relatedPosts: [],
              prevPost: null,
              nextPost: null,
              usingFallback: false,
              isLoading: false
            }));
          }
        } else {
          throw new Error('Post not found in database');
        }
      } catch (error) {
        console.warn('Failed to fetch post from database, trying fallback data:', error);
        
        // Try fallback seeded data
        const safePosts = Array.isArray(seededPosts) ? seededPosts : [];
        const fallbackPost = safePosts.find(p => p.slug === slug);
        
        if (fallbackPost) {
          console.log('Using fallback post:', fallbackPost.title);
          
          // Find prev/next in seeded data
          const currentIndex = safePosts.findIndex(p => p.slug === slug);
          const prevPost = currentIndex > 0 ? safePosts[currentIndex - 1] : null;
          const nextPost = currentIndex < safePosts.length - 1 ? safePosts[currentIndex + 1] : null;
          
          // Get related posts from seeded data
          const relatedPosts = safePosts.filter(p => 
            p.slug !== slug && 
            p.category?.id === fallbackPost.category?.id
          ).slice(0, 3);
          
          setState(prev => ({ 
            ...prev, 
            post: fallbackPost, 
            relatedPosts,
            prevPost,
            nextPost,
            usingFallback: true,
            isLoading: false
          }));
        } else {
          console.error('Post not found in seeded data either');
          setState(prev => ({ 
            ...prev, 
            notFound: true, 
            isLoading: false 
          }));
        }
      }
    };

    fetchData();
  }, [slug]);

  // Generate sanitized HTML
  const sanitizedContent = useMemo(() => {
    if (!state.post?.body_html) return '';
    return DOMPurify.sanitize(state.post.body_html);
  }, [state.post?.body_html]);

  // Generate popular tags for sidebar (robust implementation)
  const popularTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    const safePosts = Array.isArray(seededPosts) ? seededPosts : [];
    
    safePosts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) {
            tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
          }
        });
      }
    });
    
    return Array.from(tagCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, []);


  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        {/* Loading skeleton - aligned with navbar */}
        <div className="animate-pulse">
          {/* Hero skeleton */}
          <div className="relative h-[400px] md:h-[450px] bg-surface-secondary">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl space-y-4">
                  <div className="h-4 bg-white/20 rounded w-48" />
                  <div className="h-6 bg-white/20 rounded w-24" />
                  <div className="h-12 bg-white/20 rounded w-full" />
                  <div className="h-12 bg-white/20 rounded w-3/4" />
                  <div className="h-4 bg-white/20 rounded w-56" />
                </div>
              </div>
            </div>
          </div>

          {/* Content skeleton - aligned with navbar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Main content skeleton */}
              <div className="lg:col-span-2 space-y-8">
                {/* Share bar skeleton */}
                <div className="h-14 bg-surface-secondary rounded-xl w-full max-w-[700px]" />

                {/* Article skeleton - optimal reading width */}
                <div className="space-y-4 max-w-[700px]">
                  <div className="h-5 bg-surface-secondary rounded w-full" />
                  <div className="h-5 bg-surface-secondary rounded w-[95%]" />
                  <div className="h-5 bg-surface-secondary rounded w-[85%]" />
                  <div className="h-5 bg-surface-secondary rounded w-full" />
                  <div className="h-8 mt-8" />
                  <div className="h-7 bg-surface-secondary rounded w-2/3" />
                  <div className="h-5 bg-surface-secondary rounded w-full" />
                  <div className="h-5 bg-surface-secondary rounded w-[90%]" />
                  <div className="h-5 bg-surface-secondary rounded w-[80%]" />
                </div>
              </div>

              {/* Sidebar skeleton */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-surface-secondary rounded-2xl h-64" />
                <div className="bg-surface-secondary rounded-2xl h-40" />
                <div className="bg-surface-secondary rounded-2xl h-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.notFound || !state.post) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Post Not Found</h1>
          <p className="text-text-secondary mb-8">
            The blog post you're looking for doesn't exist or may have been moved.
          </p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Reading Progress Bar - Premium gradient */}
      <div className="fixed top-0 left-0 w-full h-1 bg-surface-secondary/50 z-50 backdrop-blur-sm">
        <motion.div
          className="h-full bg-gradient-to-r from-accent via-purple-500 to-accent"
          style={{ width: `${readingProgress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${readingProgress}%` }}
          transition={shouldReduceMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Warning banner for fallback data - aligned with navbar */}
      {state.usingFallback && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="bg-warning/10 border-b border-warning/20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-sm text-text-primary">
              Viewing offline content. Some features may be limited.
            </p>
          </div>
        </motion.div>
      )}

      {/* Hero Section - Aligned with navbar (max-w-7xl), mobile-first responsive */}
      <section className="relative min-h-[320px] sm:min-h-[380px] md:min-h-[450px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <ResponsiveImage
            src={state.post.image_url || ''}
            alt=""
            className="w-full h-full"
            aspectRatio="16/9"
            objectFit="cover"
            fetchPriority="high"
          />
        </div>

        {/* Gradient overlay - cinematic look, stronger on mobile for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40 sm:from-black/90 sm:via-black/50 sm:to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent sm:from-black/60 sm:via-transparent" />

        {/* Content overlay - aligned with navbar */}
        <div className="absolute inset-0 flex items-end pb-6 sm:pb-10 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={shouldReduceMotion ? {} : fadeInUp.hidden}
              animate={shouldReduceMotion ? {} : fadeInUp.visible}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-3xl"
            >
              {/* Breadcrumb - smaller on mobile */}
              <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/70 mb-3 sm:mb-5">
                <Link
                  to="/"
                  className="hover:text-white transition-colors duration-200 flex items-center gap-1"
                >
                  <Home size={12} className="sm:w-[14px] sm:h-[14px]" />
                </Link>
                <span className="text-white/40">/</span>
                <Link to="/blog" className="hover:text-white transition-colors duration-200">
                  Blog
                </Link>
                <span className="text-white/40">/</span>
                <span className="text-white/90 truncate max-w-[120px] sm:max-w-none">
                  {state.post.category?.name || 'Post'}
                </span>
              </nav>

              {/* Category and meta - responsive sizing */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
                {state.post.category && (
                  <Badge className="bg-accent text-text-inverse border-0 font-semibold shadow-lg px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm">
                    {state.post.category.name.toUpperCase()}
                  </Badge>
                )}
                <div className="flex items-center gap-1 sm:gap-1.5 text-white/80 text-xs sm:text-sm">
                  <Clock size={12} className="sm:w-[14px] sm:h-[14px]" />
                  <span>{estimateReadTime(state.post.body_html)}</span>
                </div>
              </div>

              {/* Title - responsive font sizes, proper line clamping on mobile */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-5 leading-[1.2] sm:leading-[1.15] tracking-tight">
                {state.post.title}
              </h1>

              {/* Author and Date - responsive */}
              <div className="flex items-center gap-2 sm:gap-3 text-white/80 text-xs sm:text-sm">
                <span className="font-medium">Supermal Karawaci</span>
                <span className="text-white/40">•</span>
                <time dateTime={state.post.publish_at || state.post.created_at}>
                  {formatDate(state.post.publish_at || state.post.created_at)}
                </time>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content - Aligned with navbar (max-w-7xl), mobile-first padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-14">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {/* Article Content - 2/3 width */}
          <div className="lg:col-span-2">
            {/* Share Bar - Responsive: stacked on mobile, inline on desktop */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 mb-8 sm:mb-10',
                'bg-surface-secondary/50 backdrop-blur-sm rounded-xl',
                'border border-border-primary/50'
              )}
            >
              <span className="text-xs sm:text-sm font-medium text-text-muted">Share:</span>
              <div className="flex items-center gap-1 sm:gap-2">
                {/* X (formerly Twitter) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('x')}
                  className="h-8 sm:h-9 px-2.5 sm:px-3 hover:bg-neutral-800/20 hover:text-text-primary transition-colors"
                  aria-label="Share on X"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="hidden sm:inline ml-1.5">X</span>
                </Button>
                {/* Facebook */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('facebook')}
                  className="h-8 sm:h-9 px-2.5 sm:px-3 hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook size={16} />
                  <span className="hidden sm:inline ml-1.5">Facebook</span>
                </Button>
                {/* WhatsApp */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('whatsapp')}
                  className="h-8 sm:h-9 px-2.5 sm:px-3 hover:bg-[#25D366]/10 hover:text-[#25D366] transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle size={16} />
                  <span className="hidden sm:inline ml-1.5">WhatsApp</span>
                </Button>
                {/* Copy Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare('copy')}
                  className={cn(
                    'h-8 sm:h-9 px-2.5 sm:px-3 transition-all duration-200',
                    copySuccess
                      ? 'bg-green-500/10 text-green-500'
                      : 'hover:bg-accent/10 hover:text-accent'
                  )}
                  aria-label={copySuccess ? 'Link copied' : 'Copy link'}
                >
                  {copySuccess ? (
                    <>
                      <Check size={16} />
                      <span className="hidden sm:inline ml-1.5">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span className="hidden sm:inline ml-1.5">Copy Link</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/*
              Article Content - Medium-style optimal reading width
              Mobile-first responsive typography

              Typography best practices:
              - 50-75 characters per line (~700px on desktop, full-width on mobile)
              - 1.6-1.8 line height for body text
              - Adequate paragraph spacing
              - Clear hierarchy with headings
            */}
            <motion.article
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full" // Full width - content fills column
            >
              <div
                className={cn(
                  // Base prose styles - responsive
                  'prose prose-base sm:prose-lg',
                  // Optimal line height and spacing
                  'leading-[1.7] sm:leading-[1.75] tracking-[-0.01em]',
                  // Typography scale - smaller on mobile
                  'prose-p:text-base sm:prose-p:text-[1.125rem]',
                  'prose-p:leading-[1.75] sm:prose-p:leading-[1.8]',
                  'prose-p:mb-5 sm:prose-p:mb-6',
                  'prose-p:text-text-primary',
                  // Headings - responsive sizes
                  'prose-headings:text-text-primary prose-headings:font-bold prose-headings:tracking-tight',
                  'prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:mt-8 sm:prose-h1:mt-12 prose-h1:mb-4 sm:prose-h1:mb-6',
                  'prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 sm:prose-h2:mt-10 prose-h2:mb-4 sm:prose-h2:mb-5',
                  'prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 sm:prose-h3:mt-8 prose-h3:mb-3 sm:prose-h3:mb-4',
                  // Links
                  'prose-a:text-accent prose-a:font-medium prose-a:no-underline',
                  'prose-a:hover:underline prose-a:hover:underline-offset-4',
                  // Lists
                  'prose-li:text-text-primary prose-li:mb-2',
                  'prose-ul:my-4 sm:prose-ul:my-6 prose-ol:my-4 sm:prose-ol:my-6',
                  // Strong/Bold
                  'prose-strong:text-text-primary prose-strong:font-semibold',
                  // Blockquote - elegant styling, responsive padding
                  'prose-blockquote:border-l-4 prose-blockquote:border-accent',
                  'prose-blockquote:pl-4 sm:prose-blockquote:pl-6 prose-blockquote:py-1',
                  'prose-blockquote:my-6 sm:prose-blockquote:my-8',
                  'prose-blockquote:text-text-secondary prose-blockquote:italic',
                  'prose-blockquote:not-italic prose-blockquote:font-normal',
                  // Code
                  'prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
                  'prose-code:before:content-none prose-code:after:content-none',
                  'prose-code:text-sm sm:prose-code:text-base',
                  // Images - responsive margins
                  'prose-img:rounded-xl prose-img:shadow-lg prose-img:my-6 sm:prose-img:my-8',
                  // Horizontal rule
                  'prose-hr:border-border-primary prose-hr:my-8 sm:prose-hr:my-12'
                )}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </motion.article>

            {/* Tags Section - Responsive */}
            {state.post.tags && Array.isArray(state.post.tags) && state.post.tags.length > 0 && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                animate={shouldReduceMotion ? {} : { opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 sm:mt-12 pt-6 sm:pt-8 w-full relative"
              >
                {/* Elegant gradient divider */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-primary to-transparent" />
                <h3 className="text-xs sm:text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 sm:mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {state.post.tags.map((tag) => (
                    <BlogCategoryPill
                      key={tag}
                      name={tag}
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/blog?tag=${encodeURIComponent(tag)}`)}
                      className="cursor-pointer hover:bg-accent/10 transition-colors text-xs sm:text-sm"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Previous/Next Navigation - Responsive */}
            {/* Note: Posts are sorted newest-first, so:
                - prevPost (earlier in list) = NEWER post
                - nextPost (later in list) = OLDER post
                We swap them so "Previous" = older, "Next" = newer (chronological order) */}
            {(state.prevPost || state.nextPost) && (
              <motion.nav
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 sm:mt-14 pt-8 sm:pt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full relative"
              >
                {/* Elegant gradient divider */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-primary to-transparent" />

                {/* Previous Article = older post (nextPost in array order) */}
                {state.nextPost ? (
                  <Link
                    to={`/blog/${state.nextPost.slug}`}
                    className={cn(
                      'group flex items-center gap-3 sm:gap-4 p-4 sm:p-5',
                      'bg-surface-secondary/50 hover:bg-surface-secondary',
                      'rounded-xl border border-border-primary/50',
                      'transition-all duration-300 hover:shadow-lg active:scale-[0.98]'
                    )}
                  >
                    <ChevronLeft
                      className="text-text-muted group-hover:text-accent transition-colors flex-shrink-0"
                      size={18}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5 sm:mb-1">
                        Previous
                      </p>
                      <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 text-xs sm:text-sm">
                        {state.nextPost.title}
                      </h3>
                    </div>
                  </Link>
                ) : (
                  <div className="hidden sm:block" /> // Empty placeholder for grid alignment
                )}

                {/* Next Article = newer post (prevPost in array order) */}
                {state.prevPost && (
                  <Link
                    to={`/blog/${state.prevPost.slug}`}
                    className={cn(
                      'group flex items-center gap-3 sm:gap-4 p-4 sm:p-5',
                      'bg-surface-secondary/50 hover:bg-surface-secondary',
                      'rounded-xl border border-border-primary/50',
                      'transition-all duration-300 hover:shadow-lg active:scale-[0.98]',
                      'sm:text-right sm:flex-row-reverse'
                    )}
                  >
                    <ChevronRight
                      className="text-text-muted group-hover:text-accent transition-colors flex-shrink-0"
                      size={18}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-medium text-text-muted uppercase tracking-wider mb-0.5 sm:mb-1">
                        Next
                      </p>
                      <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2 text-xs sm:text-sm">
                        {state.prevPost.title}
                      </h3>
                    </div>
                  </Link>
                )}
              </motion.nav>
            )}

            {/* Related Posts - Responsive */}
            {state.relatedPosts.length > 0 && (
              <motion.section
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 sm:mt-16 pt-8 sm:pt-10 relative"
              >
                {/* Elegant gradient divider */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-primary to-transparent" />
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6 sm:mb-8">
                  Related Posts
                </h2>
                <BlogListHorizontal posts={state.relatedPosts} />
              </motion.section>
            )}
          </div>

          {/* Sidebar - 1/3 width, sticky on desktop */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar
                featuredPosts={(() => {
                  const safePosts = Array.isArray(seededPosts) ? seededPosts : [];
                  return safePosts
                    .filter((p) => p.is_featured && p.slug !== slug)
                    .slice(0, 3);
                })()}
                categories={(() => {
                  const safeCategories = Array.isArray(seededCategories)
                    ? seededCategories
                    : [];
                  return safeCategories.map((cat) => ({
                    ...cat,
                    post_count: Array.isArray(seededPosts)
                      ? seededPosts.filter((p) => p.category?.id === cat.id).length
                      : 0
                  }));
                })()}
                popularTags={popularTags}
                onTagClick={(tag) => navigate(`/blog?tag=${encodeURIComponent(tag)}`)}
                onCategoryClick={(categoryId) =>
                  navigate(`/blog?category=${categoryId}`)
                }
                onSubscribe={(email) => {
                  console.log('Newsletter subscription:', email);
                  alert('Thank you for subscribing!');
                }}
                showAuthor={true}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}