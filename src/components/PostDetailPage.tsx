// src/components/PostDetailPage.tsx
// Modified: Constrained reading width (~12-14 words per line), hero overlay design, proper layout with sidebar, FULL FUNCTIONALITY RESTORED

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Copy, Check, ChevronLeft, ChevronRight, Home, Clock } from 'lucide-react';
import DOMPurify from 'dompurify';
import { fetchPostBySlug, fetchPosts, type Post } from '../lib/supabase';
import { seededPosts, seededCategories } from '../data/seeded-posts';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import BlogSidebar from './ui/BlogSidebar';
import BlogListHorizontal from './ui/BlogListHorizontal';
import { ResponsiveImage } from './ui/ResponsiveImage';
import BlogCategoryPill from './ui/BlogCategoryPill';
import { useSEO } from '@/lib/hooks/useSEO';
import { getBlogPostSEO } from '@/lib/seo/page-seo';
import { generateBlogPostSchema } from '@/lib/seo/structured-data';

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
  const handleShare = async (platform?: 'twitter' | 'facebook' | 'linkedin' | 'copy') => {
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
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
      };

      window.open(shareUrls[platform], '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    } catch (error) {
      console.error('Share failed:', error);
      // Show a user-friendly error message
      alert('Failed to share. Please copy the URL manually.');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) return; // Allow browser shortcuts
    
    switch (e.key) {
      case 'ArrowLeft':
        if (state.prevPost) {
          e.preventDefault();
          navigate(`/blog/${state.prevPost.slug}`);
        }
        break;
      case 'ArrowRight':
        if (state.nextPost) {
          e.preventDefault();
          navigate(`/blog/${state.nextPost.slug}`);
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
        {/* Loading skeleton */}
        <div className="animate-pulse">
          {/* Hero skeleton */}
          <div className="h-96 bg-surface-secondary" />
          
          <div className="px-6 mt-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Content skeleton */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Share buttons skeleton */}
                  <div className="bg-surface-secondary rounded-2xl h-16" />
                  
                  {/* Article content skeleton */}
                  <div className="space-y-4 max-w-[60ch]">
                    <div className="h-4 bg-surface-secondary rounded w-full" />
                    <div className="h-4 bg-surface-secondary rounded w-5/6" />
                    <div className="h-4 bg-surface-secondary rounded w-4/6" />
                    <div className="h-8 bg-surface-secondary rounded w-full mt-8" />
                    <div className="h-4 bg-surface-secondary rounded w-full" />
                    <div className="h-4 bg-surface-secondary rounded w-3/4" />
                    <div className="h-4 bg-surface-secondary rounded w-5/6" />
                  </div>
                </div>
                
                {/* Sidebar skeleton */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-surface-secondary rounded-3xl h-48" />
                  <div className="bg-surface-secondary rounded-3xl h-32" />
                  <div className="bg-surface-secondary rounded-3xl h-40" />
                </div>
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

  return (
    <div className="min-h-screen bg-surface">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-surface-secondary z-50">
        <motion.div
          className="h-full bg-accent"
          style={{ width: `${readingProgress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${readingProgress}%` }}
          transition={shouldReduceMotion ? {} : { type: "spring", stiffness: 400, damping: 40 }}
        />
      </div>


      {/* Warning banner for fallback data */}
      {state.usingFallback && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          className="bg-warning/10 border-b border-warning/20 px-6 py-3"
        >
          <div className="max-w-6xl mx-auto">
            <p className="text-sm text-text-primary">
              ⚠️ Viewing offline content. Some features may be limited.
            </p>
          </div>
        </motion.div>
      )}

      {/* Hero Section with Overlay */}
      <section className="relative h-96 overflow-hidden mb-8">
        <ResponsiveImage
          src={state.post.image_url || ''}
          alt=""
          className="w-full h-full"
          aspectRatio="16/9"
          objectFit="cover"
          fetchPriority="high"
        />
        
        {/* Semi-opaque overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                <Link to="/" className="hover:text-white transition-colors">
                  <Home size={16} />
                </Link>
                <span>/</span>
                <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-white">{state.post.category?.name || 'Post'}</span>
              </nav>

              {/* Category and meta */}
              <div className="flex items-center gap-3 mb-4">
                {state.post.category && (
                  <Badge className="bg-accent text-text-inverse border-0 font-medium shadow-sm">
                    {state.post.category.name.toUpperCase()}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-gray-300 text-sm">
                  <Clock size={14} />
                  {estimateReadTime(state.post.body_html)}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {state.post.title}
              </h1>

              {/* Author and Date */}
              <div className="flex items-center gap-2 text-gray-200 text-sm">
                <span>Ethan Caldwell</span>
                <span>•</span>
                <span>{formatDate(state.post.publish_at || state.post.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Article Content - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="max-w-none">
                {/* Share buttons */}
                <Card className="border-0 shadow-lg rounded-2xl mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-muted">Share:</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare('twitter')}
                          className="text-xs"
                        >
                          Twitter
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare('facebook')}
                          className="text-xs"
                        >
                          Facebook
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare('copy')}
                          className="text-xs"
                        >
                          {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Article Content - Constrained to ~12-14 words per line for readability */}
                <div className="mx-auto">
                  <div 
                    className="prose prose-lg max-w-[60ch] leading-relaxed prose-headings:leading-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-p:text-text-primary prose-headings:text-text-primary prose-strong:text-text-primary prose-a:text-accent prose-a:hover:text-accent-hover"
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                  />
                </div>

                {/* Tags */}
                {state.post.tags && Array.isArray(state.post.tags) && state.post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border-primary max-w-[60ch]">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {state.post.tags.map(tag => (
                        <BlogCategoryPill
                          key={tag}
                          name={tag}
                          variant="outline"
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous/Next Navigation */}
                {(state.prevPost || state.nextPost) && (
                  <nav className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[60ch]">
                    {state.prevPost && (
                      <Link 
                        to={`/blog/${state.prevPost.slug}`}
                        className="group flex items-center gap-4 p-6 bg-surface shadow-lg rounded-2xl hover:shadow-xl transition-shadow"
                      >
                        <ChevronLeft className="text-accent group-hover:text-accent-hover transition-colors" />
                        <div className="min-w-0">
                          <p className="text-sm text-text-muted mb-1">Previous Post</p>
                          <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                            {state.prevPost.title}
                          </h3>
                        </div>
                      </Link>
                    )}

                    {state.nextPost && (
                      <Link 
                        to={`/blog/${state.nextPost.slug}`}
                        className="group flex items-center gap-4 p-6 bg-surface shadow-lg rounded-2xl hover:shadow-xl transition-shadow text-right md:flex-row-reverse"
                      >
                        <ChevronRight className="text-accent group-hover:text-accent-hover transition-colors" />
                        <div className="min-w-0">
                          <p className="text-sm text-text-muted mb-1">Next Post</p>
                          <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                            {state.nextPost.title}
                          </h3>
                        </div>
                      </Link>
                    )}
                  </nav>
                )}

                {/* Related Posts - Using horizontal layout */}
                {state.relatedPosts.length > 0 && (
                  <section className="mt-16">
                    <h2 className="text-2xl font-bold text-text-primary mb-8">Related Posts</h2>
                    <BlogListHorizontal posts={state.relatedPosts} />
                  </section>
                )}
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="lg:col-span-1">
              <BlogSidebar
                featuredPosts={(() => {
                  const safePosts = Array.isArray(seededPosts) ? seededPosts : [];
                  return safePosts.filter(p => 
                    p.is_featured && 
                    p.slug !== slug
                  ).slice(0, 3);
                })()}
                categories={(() => {
                  const safeCategories = Array.isArray(seededCategories) ? seededCategories : [];
                  return safeCategories.map(cat => ({
                    ...cat,
                    post_count: Array.isArray(seededPosts) 
                      ? seededPosts.filter(p => p.category?.id === cat.id).length
                      : 0
                  }));
                })()}
                popularTags={popularTags}
                onTagClick={(tag) => navigate(`/blog?tag=${encodeURIComponent(tag)}`)}
                onCategoryClick={(categoryId) => navigate(`/blog?category=${categoryId}`)}
                onSubscribe={(email) => {
                  // Handle newsletter subscription
                  console.log('Newsletter subscription:', email);
                  // You can implement actual subscription logic here
                  alert('Thank you for subscribing! (This is a demo)');
                }}
                showAuthor={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}