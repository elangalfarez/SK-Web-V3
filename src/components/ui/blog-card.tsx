// src/components/ui/blog-card.tsx
// Modified: Golden-ratio heights, solid badges, ResponsiveImage usage, contrast fixes

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
import { Button } from '@/components/ui/button';
import { ResponsiveImage } from './ResponsiveImage';
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
        <ResponsiveImage
          src={post.image_url || ''}
          alt=""
          className="w-16 h-12 flex-shrink-0 rounded"
          aspectRatio="4/3"
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
            <ResponsiveImage
              src={post.image_url || ''}
              alt=""
              className="w-full h-full"
              aspectRatio="16/9"
              objectFit="cover"
              fetchPriority="high"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              {post.category && (
                <Badge className="bg-accent text-text-inverse border-0 shadow-sm mb-3">
                  {post.category.name}
                </Badge>
              )}
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                {post.title}
              </h3>
              
              <p className="text-sm text-gray-300">
                {formatDate(post.publish_at || post.created_at)}
              </p>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  // Default variant - following Good Layout Code structure
  return (
    <article 
      className={cn(
        'group bg-white border-0 shadow-lg rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl',
        'min-h-[420px] flex flex-col', // Golden ratio: 420px total height
        className
      )}
    >
      <Link 
        to={`/blog/${post.slug}`}
        className="flex flex-col h-full"
        aria-describedby={`post-summary-${post.id}`}
      >
        {/* Image Section - ~260px (61.8% of 420px) */}
        <div className="relative h-60">
          <ResponsiveImage
            src={post.image_url || ''}
            alt=""
            className="w-full h-full"
            aspectRatio="16/9"
            objectFit="cover"
            loading="lazy"
          />
          
          {/* Badges on image - solid, no blur */}
          <div className="absolute top-4 left-4 flex gap-2">
            {post.category && (
              <Badge className="bg-white text-gray-700 hover:bg-gray-50 border-0 text-xs font-medium shadow-sm">
                {post.category.name.toUpperCase()}
              </Badge>
            )}
            {post.tags.slice(0, 1).map(tag => (
              <Badge key={tag} className="bg-white text-gray-700 hover:bg-gray-50 border-0 text-xs font-medium shadow-sm">
                {tag.toUpperCase()}
              </Badge>
            ))}
          </div>
          
          {/* Read time badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">
              {estimateReadTime(post.body_html)}
            </span>
          </div>
        </div>

        {/* Content Section - ~160px (38.2% of 420px) */}
        <div className="relative h-40 p-6 flex flex-col">
          {/* Author info aligned to top */}
          <div className="mb-2">
            <span className="text-blue-600 text-sm font-medium">Ethan Caldwell</span>
            <span className="text-gray-500 text-sm ml-2">
              on {formatDate(post.publish_at || post.created_at)}
            </span>
          </div>

          {/* Title and excerpt - flex-1 to fill space */}
          <div className="flex-1 flex flex-col">
            <h2 className="text-xl font-bold mb-3 text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight">
              {post.title}
            </h2>

            {post.summary && (
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                {post.summary}
              </p>
            )}
          </div>

          {/* Button aligned to bottom */}
          <div className="mt-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm px-6 py-2 rounded-xl">
              Discover More
            </Button>
          </div>
        </div>
      </Link>

      {/* Hidden summary for screen readers */}
      <div id={`post-summary-${post.id}`} className="sr-only">
        {post.summary || `Read the full article: ${post.title}`}
      </div>
    </article>
  );
}