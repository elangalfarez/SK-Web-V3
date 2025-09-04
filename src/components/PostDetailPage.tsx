// src/components/PostDetailPage.tsx
// Modified: Hero overlay design, breadcrumb navigation, BlogSidebar integration, prev/next navigation, ImageWithFallback usage

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
import ImageWithFallback from './ui/ImageWithFallback';
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
  const handleShare = async (platform?: 'twitter' | 'facebook' | 'linkedin' | 'copy') => {
    const url = window.location.href;
    const title = state.post?.title || '';
    const text = state.post?.summary || title;

    if (platform === 'copy' || !platform) {
      try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.warn('Failed to copy to clipboard');
      }
      return;
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
  };

  // Fetch post and related content
  useEffect(() => {
    if (!slug) {
      setState(prev => ({ ...prev, notFound: true, isLoading: false }));
      return;
    }

    const loadPost = async () => {
      setState(prev => ({ ...prev, isLoading: true, notFound: false }));

      try {
        const post = await fetchPostBySlug(slug);
        if (post) {
          setState(prev => ({ ...prev, post, isLoading: false, usingFallback: false }));
          document.title = `${post.title} — Supermal Karawaci Blog`;
          
          // Load related content
          loadRelatedContent(post);
        } else {
          setState(prev => ({ ...prev, notFound: true, isLoading: false }));
          document.title = 'Post Not Found — Supermal Karawaci Blog';
        }
      } catch (error) {
        console.warn('Failed to fetch post, using fallback data');
        const seededPost = seededPosts.find(p => p.slug === slug);
        if (seededPost) {
          setState(prev => ({ 
            ...prev, 
            post: seededPost, 
            isLoading: false, 
            usingFallback: true 
          }));
          document.title = `${seededPost.title} — Supermal Karawaci Blog`;
          loadRelatedContentFromSeeded(seededPost);
        } else {
          setState(prev => ({ ...prev, notFound: true, isLoading: false }));
          document.title = 'Post Not Found — Supermal Karawaci Blog';
        }
      }
    };

    loadPost();
  }, [slug]);

  // Load related content from server
  const loadRelatedContent = async (currentPost: Post) => {
    try {
      // Get related posts by category or tags
      const [categoryRelated, tagRelated] = await Promise.all([
        currentPost.category ? 
          fetchPosts({ categoryId: currentPost.category.id, perPage: 4 }) : 
          Promise.resolve({ posts: [], total: 0, page: 1, perPage: 4, hasMore: false }),
        currentPost.tags.length > 0 ?
          fetchPosts({ tags: currentPost.tags, perPage: 4 }) :
          Promise.resolve({ posts: [], total: 0, page: 1, perPage: 4, hasMore: false })
      ]);

      // Combine and deduplicate
      const allRelated = [...categoryRelated.posts, ...tagRelated.posts];
      const uniqueRelated = allRelated
        .filter((post, index, arr) => 
          post.id !== currentPost.id && 
          arr.findIndex(p => p.id === post.id) === index
        )
        .slice(0, 4);

      // Get all posts for prev/next navigation
      const allPosts = await fetchPosts({ perPage: 50 });
      const currentIndex = allPosts.posts.findIndex(p => p.id === currentPost.id);
      
      const prevPost = currentIndex > 0 ? allPosts.posts[currentIndex - 1] : null;
      const nextPost = currentIndex < allPosts.posts.length - 1 ? allPosts.posts[currentIndex + 1] : null;

      setState(prev => ({
        ...prev,
        relatedPosts: uniqueRelated,
        prevPost,
        nextPost
      }));
    } catch (error) {
      console.warn('Failed to load related content');
      loadRelatedContentFromSeeded(currentPost);
    }
  };

  // Load related content from seeded data
  const loadRelatedContentFromSeeded = (currentPost: Post) => {
    const related = seededPosts
      .filter(p => 
        p.id !== currentPost.id && 
        (p.category?.id === currentPost.category?.id || 
         p.tags.some(tag => currentPost.tags.includes(tag)))
      )
      .slice(0, 4);

    const currentIndex = seededPosts.findIndex(p => p.id === currentPost.id);
    const prevPost = currentIndex > 0 ? seededPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < seededPosts.length - 1 ? seededPosts[currentIndex + 1] : null;

    setState(prev => ({
      ...prev,
      relatedPosts: related,
      prevPost,
      nextPost
    }));
  };

  // Sanitized content with improved typography
  const sanitizedContent = useMemo(() => {
    if (!state.post?.body_html) return '';
    
    return DOMPurify.sanitize(state.post.body_html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'mark',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'a', 'img', 
        'blockquote', 'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'style']
    });
  }, [state.post?.body_html]);

  // Sidebar data
  const sidebarData = useMemo(() => {
    const tagCounts = seededPosts.reduce((acc, post) => {
      post.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return {
      featuredPosts: seededPosts.filter(p => p.is_featured).slice(0, 4),
      categories: seededCategories,
      popularTags
    };
  }, []);

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-[60vh] bg-surface-secondary" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:grid lg:grid-cols-4 lg:gap-12">
              <div className="lg:col-span-3 space-y-6">
                <div className="h-8 bg-surface-secondary rounded w-3/4" />
                <div className="h-4 bg-surface-secondary rounded w-1/2" />
                <div className="space-y-4">
                  <div className="h-4 bg-surface-secondary rounded w-full" />
                  <div className="h-4 bg-surface-secondary rounded w-full" />
                  <div className="h-4 bg-surface-secondary rounded w-3/4" />
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
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Post Not Found</h1>
            <p className="text-lg text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/blog">
              <Button>
                <ArrowLeft size={16} className="mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const post = state.post;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Overlay */}
      <section className="relative h-[60vh] overflow-hidden">
        <ImageWithFallback
          src={post.image_url || ''}
          alt={post.title}
          className="w-full h-full"
          objectFit="cover"
          objectPosition="center"
          fetchPriority="high"
          loading="eager"
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-8">
            <div className="max-w-7xl mx-auto">
              <div className="max-w-4xl">
                {/* Breadcrumb */}
                <nav className="mb-6" aria-label="Breadcrumb">
                  <ol className="flex items-center gap-2 text-sm text-gray-300">
                    <li>
                      <Link to="/" className="hover:text-white transition-colors flex items-center">
                        <Home size={16} />
                        <span className="sr-only">Home</span>
                      </Link>
                    </li>
                    <li>/</li>
                    <li>
                      <Link to="/blog" className="hover:text-white transition-colors">
                        Blog
                      </Link>
                    </li>
                    <li>/</li>
                    <li className="text-white truncate max-w-md">{post.title}</li>
                  </ol>
                </nav>

                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {post.category && (
                    <BlogCategoryPill
                      name={post.category.name}
                      variant="secondary"
                      size="sm"
                      accentColor={post.category.accent_color}
                      className="bg-white/10 border-white/20 text-white backdrop-blur-sm"
                    />
                  )}
                  
                  {post.is_featured && (
                    <Badge className="bg-accent/20 border-accent/40 text-white backdrop-blur-sm">
                      Featured
                    </Badge>
                  )}
                  
                  <Badge className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
                    <Clock size={12} className="mr-1" />
                    {estimateReadTime(post.body_html)}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-gray-300">
                  <time className="flex items-center gap-2">
                    <Calendar size={16} />
                    {formatDate(post.publish_at || post.created_at)}
                  </time>
                  
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag size={16} />
                      <div className="flex gap-2">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span key={tag}>
                            {tag}{index < Math.min(post.tags.length, 3) - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    {copySuccess ? <Check size={16} /> : <Share2 size={16} />}
                    {copySuccess ? 'Copied!' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Article Content */}
          <div className="lg:col-span-3">
            <article className="max-w-none">
              {/* Summary Callout */}
              {post.summary && (
                <div className="bg-accent/5 border-l-4 border-accent rounded-r-lg p-6 mb-8">
                  <p className="text-lg text-primary leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              )}

              {/* Social Share Buttons */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                <span className="text-sm text-muted-foreground">Share:</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                    className="text-blue-500 hover:bg-blue-50"
                  >
                    Twitter
                    <ExternalLink size={14} className="ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    Facebook
                    <ExternalLink size={14} className="ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                    className="text-blue-700 hover:bg-blue-50"
                  >
                    LinkedIn
                    <ExternalLink size={14} className="ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('copy')}
                  >
                    {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                    Copy Link
                  </Button>
                </div>
              </div>

              {/* Article Content with improved typography */}
              <div 
                className="prose prose-lg max-w-none leading-relaxed prose-headings:leading-tight prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-primary mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
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
                <nav className="mt-12 pt-8 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {state.prevPost && (
                      <Link 
                        to={`/blog/${state.prevPost.slug}`}
                        className="group flex items-center gap-4 p-6 bg-surface-secondary hover:bg-surface rounded-lg transition-colors"
                      >
                        <ChevronLeft size={24} className="text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground mb-1">Previous Article</p>
                          <h4 className="font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
                            {state.prevPost.title}
                          </h4>
                        </div>
                      </Link>
                    )}

                    {state.nextPost && (
                      <Link 
                        to={`/blog/${state.nextPost.slug}`}
                        className="group flex items-center gap-4 p-6 bg-surface-secondary hover:bg-surface rounded-lg transition-colors md:flex-row-reverse md:text-right"
                      >
                        <ChevronRight size={24} className="text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground mb-1">Next Article</p>
                          <h4 className="font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
                            {state.nextPost.title}
                          </h4>
                        </div>
                      </Link>
                    )}
                  </div>
                </nav>
              )}

              {/* Related Posts */}
              {state.relatedPosts.length > 0 && (
                <section className="mt-16">
                  <h2 className="text-2xl font-bold text-primary mb-8">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {state.relatedPosts.map(relatedPost => (
                      <BlogCard 
                        key={relatedPost.id} 
                        post={relatedPost}
                        variant="compact"
                      />
                    ))}
                  </div>
                </section>
              )}
            </article>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 mt-12 lg:mt-0">
            <div className="lg:sticky lg:top-6">
              <BlogSidebar
                featuredPosts={sidebarData.featuredPosts}
                categories={sidebarData.categories}
                popularTags={sidebarData.popularTags}
                onTagClick={(tag) => navigate(`/blog?tag=${encodeURIComponent(tag)}`)}
                onCategoryClick={(categoryId) => navigate(`/blog?category=${categoryId}`)}
                onSubscribe={(email) => {
                  console.log('Newsletter subscription:', email);
                  // TODO: Implement newsletter subscription
                }}
                showAuthor
                authorName="Supermal Karawaci Editorial Team"
                authorBio="Bringing you the latest news, events, and stories from Indonesia's premier shopping destination."
                authorLocation="Karawaci, Indonesia"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}