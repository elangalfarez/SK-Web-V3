// src/components/ui/blog-card.tsx
// Modified: Golden-ratio heights, consistent card dimensions, solid badges, ImageWithFallback integration, contrast fixes

/*
Golden ratio implementation: 
Card min-height: 420px, Image container: ~260px (61.8%), Content area: ~160px (38.2%)
Mobile: stack with image first, then content
Badge styling: solid tokens, no backdrop-blur, shadow-sm for lift
Text color fix: titles use text-primary (not white), hover uses text-accent
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag, ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ImageWithFallback from './ImageWithFallback';
import BlogCategoryPill from './BlogCategoryPill';
import { cn } from '@/lib/utils';
import type { Post } from '../../lib/supabase';

interface BlogCardProps {
  post: Post;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export default function BlogCard({ 
  post, 
  className = '',
  variant = 'default'
}: BlogCardProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const estimateReadTime = (content: string | null) => {
    if (!content) return '5 min';
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min`;
  };

  // Compact variant for sidebar
  if (variant === 'compact') {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className="group flex gap-3 p-3 hover:bg-surface-secondary rounded-lg transition-colors"
        aria-describedby={`post-summary-${post.id}`}
      >
        <ImageWithFallback
          src={post.image_url || ''}
          alt=""
          className="w-16 h-12 flex-shrink-0 rounded"
          objectFit="cover"
          loading="lazy"
        />
        
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-sm text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-1">
            {post.title}
          </h4>
          <p className="text-xs text-muted-foreground">
            {formatDate(post.publish_at || post.created_at)}
          </p>
        </div>
      </Link>
    );
  }

  // Featured variant for hero sections
  if (variant === 'featured') {
    return (
      <article className={cn('group relative overflow-hidden rounded-lg', className)}>
        <Link
          to={`/blog/${post.slug}`}
          className="block h-full"
          aria-describedby={`post-summary-${post.id}`}
        >
          <div className="relative h-80 sm:h-96">
            <ImageWithFallback
              src={post.image_url || ''}
              alt=""
              className="w-full h-full"
              objectFit="cover"
              fetchPriority="high"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {post.is_featured && (
                <Badge className="bg-accent text-text-inverse border-0 shadow-sm">
                  Featured
                </Badge>
              )}
              {post.category && (
                <BlogCategoryPill
                  name={post.category.name}
                  variant="secondary"
                  size="sm"
                  accentColor={post.category.accent_color}
                  className="bg-surface-secondary/90 backdrop-blur-sm"
                />
              )}
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-gray-200 transition-colors">
                {post.title}
              </h3>
              
              {post.summary && (
                <p 
                  id={`post-summary-${post.id}`}
                  className="text-sm text-gray-200 line-clamp-2 mb-3"
                >
                  {post.summary}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-300">
                <time dateTime={post.publish_at || post.created_at}>
                  {formatDate(post.publish_at || post.created_at)}
                </time>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {estimateReadTime(post.body_html)} read
                </div>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default card variant - golden ratio proportions
  return (
    <article className={cn(
      'group bg-background border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300',
      'min-h-[420px] flex flex-col', // Golden ratio base height
      className
    )}>
      <Link
        to={`/blog/${post.slug}`}
        className="block h-full flex flex-col"
        aria-describedby={`post-summary-${post.id}`}
      >
        {/* Image Container - ~61.8% of card height (260px of 420px) */}
        <div className="relative h-[260px] overflow-hidden bg-surface-secondary">
          <ImageWithFallback
            src={post.image_url || ''}
            alt=""
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
            objectFit="cover"
            objectPosition="center top"
            loading="lazy"
          />

          {/* Solid badges - no glassmorphism */}
          <div className="absolute top-3 left-3 flex gap-2">
            {post.is_featured && (
              <Badge className="bg-accent text-text-inverse border-0 shadow-sm text-xs">
                Featured
              </Badge>
            )}
            {post.category && (
              <BlogCategoryPill
                name={post.category.name}
                variant="secondary"
                size="sm"
                accentColor={post.category.accent_color}
                className="shadow-sm"
              />
            )}
          </div>

          {/* Read time indicator */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-surface-secondary/90 text-primary border border-border shadow-sm text-xs">
              <Clock size={10} className="mr-1" />
              {estimateReadTime(post.body_html)}
            </Badge>
          </div>
        </div>

        {/* Content Area - ~38.2% of card height (160px of 420px) */}
        <div className="flex-1 p-6 flex flex-col justify-between min-h-[160px]">
          <div className="flex-1">
            {/* Meta Row */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <time 
                dateTime={post.publish_at || post.created_at}
                className="flex items-center gap-1.5"
              >
                <Calendar size={14} />
                {formatDate(post.publish_at || post.created_at)}
              </time>

              {post.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag size={14} />
                  <span className="truncate max-w-20">{post.tags[0]}</span>
                  {post.tags.length > 1 && (
                    <span className="text-xs">+{post.tags.length - 1}</span>
                  )}
                </div>
              )}
            </div>

            {/* Title - Fixed contrast: uses text-primary, hover text-accent */}
            <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-3">
              {post.title}
            </h3>

            {/* Summary - line-clamp to prevent overflow */}
            {post.summary && (
              <p 
                id={`post-summary-${post.id}`}
                className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
              >
                {post.summary}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-accent group-hover:text-accent/80 transition-colors">
              Read more
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Additional tags preview */}
            {post.tags.length > 1 && (
              <div className="flex gap-1">
                {post.tags.slice(1, 3).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs px-2 py-0.5 border-border text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}