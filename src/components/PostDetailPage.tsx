// src/components/PostDetailPage.tsx
// Modified: Hero overlay design, breadcrumb navigation, constrained article measure (~12-14 words/line), BlogSidebar integration, ResponsiveImage usage

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Share2, Copy, Check, ChevronLeft, ChevronRight, Home, Clock, ExternalLink } from 'lucide-react';
import DOMPurify from 'dompurify';
import { fetchPostBySlug, fetchPosts, type Post } from '../lib/supabase';
import { seededPosts, seededCategories } from '../data/seeded-posts';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import BlogSidebar from './ui/BlogSidebar';
import BlogCard from './ui/blog-card';
import { ResponsiveImage } from './ui/ResponsiveImage';
import BlogCategoryPill from './ui/BlogCategoryPill';

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

  // Share functionality
  const handleShare = async (platform?: string) => {
    if (!state.post) return;

    const url = window.location.href;
    const title = state.post.title;
    const text = state.post.summary || title;

    try {
      if (platform === 'twitter') {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=420'
        );
      } else if (platform === 'facebook') {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=420'
        );
      } else if (platform === 'linkedin') {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank',
          'width=550,height=420'
        );
      } else {
        // Copy link
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;

      setState(prev => ({ ...prev, isLoading: true, notFound: false }));

      try {
        const result = await fetchPostBySlug(slug);
        
        if (!result.post) {
          // Try fallback data
          const fallbackPost = seededPosts.find(p => p.slug === slug);
          if (fallbackPost) {
            setState(prev => ({
              ...prev,
              post: fallbackPost,
              isLoading: false,
              usingFallback: true
            }));
            return;
          }
          
          setState(prev => ({ ...prev, notFound: true, isLoading: false }));
          return;
        }

        setState(prev => ({
          ...prev,
          post: result.post,
          isLoading: false,
          usingFallback: result.usingFallback || false
        }));

      } catch (error) {
        console.error('Failed to load post:', error);
        
        // Fallback
        const fallbackPost = seededPosts.find(p => p.slug === slug);
        if (fallbackPost) {
          setState(prev => ({
            ...prev,
            post: fallbackPost,
            isLoading: false,
            usingFallback: true
          }));
        } else {
          setState(prev => ({ ...prev, notFound: true, isLoading: false }));
        }
      }
    };

    loadPost();
  }, [slug]);

  // Load related posts and navigation
  useEffect(() => {
    const loadRelatedData = async () => {
      if (!state.post) return;

      try {
        // Related posts
        const relatedResult = await fetchPosts({
          categoryId: state.post.category?.id,
          limit: 3,
          exclude: [state.post.id]
        });

        setState(prev => ({
          ...prev,
          relatedPosts: relatedResult.posts
        }));

        // Previous/Next navigation
        const allPosts = await fetchPosts({ limit: 1000, orderBy: 'publish_at' });
        const currentIndex = allPosts.posts.findIndex(p => p.id === state.post?.id);
        
        if (currentIndex !== -1) {
          setState(prev => ({
            ...prev,
            prevPost: currentIndex > 0 ? allPosts.posts[currentIndex - 1] : null,
            nextPost: currentIndex < allPosts.posts.length - 1 ? allPosts.posts[currentIndex + 1] : null
          }));
        }

      } catch (error) {
        console.error('Failed to load related data:', error);
        // Use seeded data as fallback
        const related = seededPosts
          .filter(p => p.id !== state.post?.id && p.category?.id === state.post?.category?.id)
          .slice(0, 3);
        
        setState(prev => ({ ...prev, relatedPosts: related }));
      }
    };

    if (state.post) {
      loadRelatedData();
    }
  }, [state.post]);

  // Set document title and meta
  useEffect(() => {
    if (state.post) {
      document.title = `${state.post.title} - Supermal Karawaci Blog`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', state.post.summary || state.post.title);
      }
    }
  }, [state.post]);

  // Sanitized content
  const sanitizedContent = useMemo(() => {
    if (!state.post?.body_html) return '';
    return DOMPurify.sanitize(state.post.body_html);
  }, [state.post?.body_html]);

  // Sidebar data
  const sidebarData = useMemo(() => {
    const allTags = Array.from(new Set(
      seededPosts.flatMap(post => post.tags)
    )).slice(0, 12);

    const popularTags = allTags.map(tag => ({
      name: tag,
      count: seededPosts.filter(post => post.tags.includes(tag)).length
    })).sort((a, b) => b.count - a.count);

    return {
      featuredPosts: state.relatedPosts.length > 0 ? state.relatedPosts : seededPosts.slice(0, 3),
      categories: seededCategories,
      popularTags
    };
  }, [state.relatedPosts]);

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-96 bg-surface-secondary" />
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="space-y-4">
              <div className="h-8 bg-surface-secondary rounded w-3/4" />
              <div className="h-4 bg-surface-secondary rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-surface-secondary rounded" />
                <div className="h-4 bg-surface-secondary rounded" />
                <div className="h-4 bg-surface-secondary rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (state.notFound || !state.post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-surface-secondary rounded-full flex items-center justify-center">
            <span className="text-muted-foreground text-2xl">📄</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist or has been moved.
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Overlay */}
      <section className="relative h-96 overflow-hidden">
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
              <div className="flex items-center gap-4 mb-4">
                {state.post.category && (
                  <Badge className="bg-white text-gray-700 hover:bg-gray-50 border-0 text-xs font-medium shadow-sm">
                    {state.post.category.name.toUpperCase()}
                  </Badge>
                )}
                
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    {estimateReadTime(state.post.body_html)}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                {state.post.title}
              </h1>

              {/* Author and date */}
              <div className="flex items-center gap-4 text-gray-300">
                <span className="text-blue-400 font-medium">Ethan Caldwell</span>
                <span>•</span>
                <time>{formatDate(state.post.publish_at || state.post.created_at)}</time>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Container alignment matching BlogPage */}
      <div className="px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Article Content - Left Column (2/3 width) */}
            <div className="lg:col-span-2">
              <article className="bg-white shadow-lg rounded-3xl p-8">
                {/* Share buttons */}
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-sm text-muted-foreground">Share:</span>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShare('twitter')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShare('facebook')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    LinkedIn
                  </Button>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShare()}
                    className="text-muted-foreground hover:text-primary"
                  >
                    {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                    Copy Link
                  </Button>
                </div>

                {/* Article Content - Constrained to ~12-14 words per line for readability */}
                <div 
                  className="prose prose-lg max-w-[60ch] mx-auto leading-relaxed prose-headings:leading-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {/* Tags */}
                {state.post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-border max-w-[60ch] mx-auto">
                    <h3 className="text-lg font-semibold text-primary mb-4">Tags</h3>
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
              </article>

              {/* Previous/Next Navigation */}
              {(state.prevPost || state.nextPost) && (
                <nav className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {state.prevPost && (
                    <Link 
                      to={`/blog/${state.prevPost.slug}`}
                      className="group flex items-center gap-4 p-6 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow"
                    >
                      <ChevronLeft className="text-accent group-hover:text-accent-dark transition-colors" />
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Previous Post</p>
                        <h3 className="font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
                          {state.prevPost.title}
                        </h3>
                      </div>
                    </Link>
                  )}

                  {state.nextPost && (
                    <Link 
                      to={`/blog/${state.nextPost.slug}`}
                      className="group flex items-center gap-4 p-6 bg-white shadow-lg rounded-3xl hover:shadow-xl transition-shadow text-right md:flex-row-reverse"
                    >
                      <ChevronRight className="text-accent group-hover:text-accent-dark transition-colors" />
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground mb-1">Next Post</p>
                        <h3 className="font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
                          {state.nextPost.title}
                        </h3>
                      </div>
                    </Link>
                  )}
                </nav>
              )}

              {/* Related Posts - Using horizontal layout */}
              {state.relatedPosts.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-2xl font-bold text-primary mb-8">Related Posts</h2>
                  <BlogListHorizontal posts={state.relatedPosts.slice(0, 2)} />
                </section>
              )}
            </div>

            {/* Right Sidebar (1/3 width) - Same as BlogPage */}
            <div className="space-y-8">
              <BlogSidebar
                featuredPosts={sidebarData.featuredPosts}
                categories={sidebarData.categories}
                popularTags={sidebarData.popularTags}
                onSubscribe={(email) => {
                  console.log('Newsletter subscription:', email);
                  // TODO: Implement newsletter subscription
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": state.post.title,
            "description": state.post.summary || state.post.title,
            "image": state.post.image_url,
            "author": {
              "@type": "Person",
              "name": "Ethan Caldwell"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Supermal Karawaci",
              "logo": {
                "@type": "ImageObject",
                "url": "/logo.png"
              }
            },
            "datePublished": state.post.publish_at || state.post.created_at,
            "dateModified": state.post.updated_at || state.post.created_at,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": window.location.href
            }
          })
        }}
      />
    </div>
  );
}