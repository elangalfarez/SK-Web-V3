// src/components/PostDetailPage.tsx
// Created: Individual blog post detail page with sanitized HTML rendering and social sharing

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Share2, Copy, Check, Download } from 'lucide-react';
import DOMPurify from 'dompurify';
import { fetchPostBySlug, fetchPosts, type Post } from '../lib/supabase';
import { seededPosts } from '../data/seeded-posts';
import BlogCard from './ui/blog-card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface PostDetailState {
  post: Post | null;
  relatedPosts: Post[];
  isLoading: boolean;
  isRelatedLoading: boolean;
  notFound: boolean;
  usingFallback: boolean;
}

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const shouldReduceMotion = useReducedMotion();
  const [copySuccess, setCopySuccess] = useState(false);

  const [state, setState] = useState<PostDetailState>({
    post: null,
    relatedPosts: [],
    isLoading: true,
    isRelatedLoading: false,
    notFound: false,
    usingFallback: false
  });

  // Fetch post by slug
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
          
          // Load related posts
          loadRelatedPosts(post);
        } else {
          setState(prev => ({ ...prev, notFound: true, isLoading: false }));
          document.title = 'Post Not Found — Supermal Karawaci Blog';
        }
      } catch (error) {
        console.warn('Failed to fetch post, checking seeded data');
        const seededPost = seededPosts.find(p => p.slug === slug);
        if (seededPost) {
          setState(prev => ({ 
            ...prev, 
            post: seededPost, 
            isLoading: false, 
            usingFallback: true 
          }));
          document.title = `${seededPost.title} — Supermal Karawaci Blog`;
          loadRelatedPostsFromSeeded(seededPost);
        } else {
          setState(prev => ({ ...prev, notFound: true, isLoading: false }));
          document.title = 'Post Not Found — Supermal Karawaci Blog';
        }
      }
    };

    loadPost();
  }, [slug]);

  // Load related posts from server
  const loadRelatedPosts = async (currentPost: Post) => {
    setState(prev => ({ ...prev, isRelatedLoading: true }));

    try {
      // Try to find posts with shared tags or same category
      const relatedByTags = currentPost.tags.length > 0 
        ? await fetchPosts({ tags: currentPost.tags, perPage: 4 })
        : { posts: [] };

      let related = relatedByTags.posts.filter(p => p.id !== currentPost.id);

      // If not enough related by tags, get more from same category
      if (related.length < 3 && currentPost.category_id) {
        const relatedByCategory = await fetchPosts({ 
          categoryId: currentPost.category_id, 
          perPage: 4 
        });
        const categoryPosts = relatedByCategory.posts.filter(p => 
          p.id !== currentPost.id && !related.find(r => r.id === p.id)
        );
        related = [...related, ...categoryPosts];
      }

      setState(prev => ({ 
        ...prev, 
        relatedPosts: related.slice(0, 3), 
        isRelatedLoading: false 
      }));
    } catch (error) {
      console.warn('Failed to fetch related posts');
      loadRelatedPostsFromSeeded(currentPost);
    }
  };

  // Load related posts from seeded data
  const loadRelatedPostsFromSeeded = (currentPost: Post) => {
    const related = seededPosts
      .filter(p => p.id !== currentPost.id)
      .filter(p => {
        // Check for shared tags
        if (currentPost.tags.some(tag => p.tags.includes(tag))) return true;
        // Check for same category
        if (currentPost.category_id === p.category_id) return true;
        return false;
      })
      .slice(0, 3);

    setState(prev => ({ 
      ...prev, 
      relatedPosts: related, 
      isRelatedLoading: false 
    }));
  };

  // Share functionality
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.warn('Failed to copy link to clipboard');
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${state.post?.title} - ${window.location.href}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${state.post?.title} - ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Generate ICS download link
  const handleDownloadICS = () => {
    if (!state.post) return;

    const startDate = new Date(state.post.publish_at || state.post.created_at);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Supermal Karawaci//Blog//EN',
      'BEGIN:VEVENT',
      `UID:${state.post.id}@supermalkarawaci.com`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${state.post.title}`,
      `DESCRIPTION:${state.post.summary || ''}`,
      `URL:${window.location.href}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.post.slug}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Sanitize HTML content
  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false
    });
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="bg-surface-secondary rounded-lg h-64 mb-8"></div>
      <div className="bg-surface-secondary rounded h-8 w-3/4 mb-4"></div>
      <div className="bg-surface-secondary rounded h-6 w-1/2 mb-6"></div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface-secondary rounded h-4 w-full"></div>
        ))}
      </div>
    </div>
  );

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (state.notFound || !state.post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Post Not Found</h1>
            <p className="text-lg text-muted-foreground mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/blog">
              <Button variant="primary">
                <ArrowLeft className="mr-2" size={20} />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { post } = state;

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "description": post.summary || "",
            "image": post.image_url || "",
            "datePublished": post.publish_at || post.created_at,
            "dateModified": post.updated_at,
            "author": {
              "@type": "Organization",
              "name": "Supermal Karawaci"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Supermal Karawaci"
            },
            "url": window.location.href
          })
        }}
      />

      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Blog
          </Link>
        </div>

        {/* Post Header */}
        <header className="mb-8">
          {/* Hero Image */}
          {post.image_url && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
              className="mb-8 rounded-xl overflow-hidden"
              style={{ 
                ['--post-accent' as any]: post.category?.accent_color 
              }}
            >
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-64 sm:h-80 object-cover"
                loading="lazy"
              />
            </motion.div>
          )}

          {/* Post Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <time 
              dateTime={post.publish_at || post.created_at}
              className="flex items-center gap-2"
            >
              <Calendar size={16} />
              {formatDate(post.publish_at || post.created_at)}
            </time>

            {post.category && (
              <Badge 
                variant="secondary"
                style={{ 
                  ['--badge-accent' as any]: post.category.accent_color 
                }}
                className="text-xs"
              >
                {post.category.name}
              </Badge>
            )}

            {post.is_featured && (
              <Badge variant="primary" className="text-xs">
                Featured
              </Badge>
            )}
          </div>

          {/* Title */}
          <motion.h1
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-6 leading-tight"
          >
            {post.title}
          </motion.h1>

          {/* Summary */}
          {post.summary && (
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground leading-relaxed mb-8"
            >
              {post.summary}
            </motion.p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-8"
            >
              <Tag size={16} className="text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </header>

        {/* Post Content */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none mb-12"
        >
          {post.body_html ? (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHTML(post.body_html) 
              }}
            />
          ) : (
            <p className="text-muted-foreground italic">No content available.</p>
          )}
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center gap-4 p-6 bg-surface rounded-lg mb-12"
        >
          <div className="flex items-center gap-2">
            <Share2 size={20} className="text-muted-foreground" />
            <span className="text-sm font-medium">Share:</span>
          </div>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="gap-2"
            aria-live="polite"
          >
            {copySuccess ? <Check size={16} /> : <Copy size={16} />}
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </Button>

          <Button
            onClick={handleTwitterShare}
            variant="outline"
            size="sm"
          >
            Share on Twitter
          </Button>

          <Button
            onClick={handleWhatsAppShare}
            variant="outline"
            size="sm"
          >
            Share on WhatsApp
          </Button>

          <Button
            onClick={handleDownloadICS}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download size={16} />
            Add to Calendar
          </Button>
        </motion.div>

        {/* Related Posts */}
        {state.relatedPosts.length > 0 && (
          <motion.section
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            aria-labelledby="related-heading"
          >
            <h2 id="related-heading" className="text-2xl font-bold text-primary mb-6">
              Related Posts
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {state.relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <BlogCard post={relatedPost} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </article>
    </div>
  );
}