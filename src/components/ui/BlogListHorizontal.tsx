// src/components/ui/BlogListHorizontal.tsx
// Modified: Horizontal layout with read-time on hover, solid badges, proper contrast, rounded images

import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveImage } from './ResponsiveImage';
import { cn } from '@/lib/utils';
import type { Post } from '../../lib/supabase';

interface BlogListHorizontalProps {
  posts: Post[];
  className?: string;
}

export default function BlogListHorizontal({ 
  posts,
  className = ''
}: BlogListHorizontalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadTime = (content: string | null) => {
    if (!content) return '5 Min Read';
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} Min Read`;
  };

  const generateGradientFallback = (index: number) => {
    const gradients = [
      'bg-gradient-to-br from-pink-400 via-pink-300 to-purple-400',
      'bg-gradient-to-br from-blue-400 via-blue-300 to-indigo-400',
      'bg-gradient-to-br from-green-400 via-green-300 to-emerald-400',
      'bg-gradient-to-br from-orange-400 via-orange-300 to-red-400',
      'bg-gradient-to-br from-purple-400 via-purple-300 to-pink-400'
    ];
    return gradients[index % gradients.length];
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-surface-secondary rounded-full flex items-center justify-center">
          <span className="text-text-muted text-2xl">📰</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">No posts found</h3>
        <p className="text-text-muted">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {posts.map((post, index) => (
        <article key={post.id} className={cn(
          'flex gap-6 pb-8 group',
          index < posts.length - 1 && 'border-b border-border-primary'
        )}>
          {/* Image Section - 45% width with balanced rounding and hover read-time */}
          <div className="w-[45%] relative">
            <Link to={`/blog/${post.slug}`} className="block">
              {post.image_url ? (
                <ResponsiveImage
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-60 object-cover rounded-2xl"
                  aspectRatio="4/3"
                  objectFit="cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                // Gradient fallback for posts without images
                <div className={cn(
                  'w-full h-60 rounded-2xl flex items-center justify-center relative overflow-hidden',
                  generateGradientFallback(index)
                )}>
                  <div className="w-24 h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-xl transform rotate-12 shadow-lg"></div>
                  <div className="absolute top-3 right-3 w-4 h-4 bg-pink-500 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-10 h-1.5 bg-pink-500 rounded-full"></div>
                </div>
              )}
            </Link>
            
            {/* Category badges on image - solid backgrounds */}
            <div className="absolute top-4 left-4 flex gap-2">
              {post.category && (
                <Badge className="bg-surface text-text-primary border-0 text-xs font-medium shadow-sm">
                  {post.category.name.toUpperCase()}
                </Badge>
              )}
              {post.tags.slice(0, 1).map(tag => (
                <Badge key={tag} className="bg-surface text-text-primary border-0 text-xs font-medium shadow-sm">
                  {tag.toUpperCase()}
                </Badge>
              ))}
            </div>

            {/* Read time badge - show on small screens, hover on desktop */}
            <div className="absolute top-4 right-4">
              {/* Always visible on small screens */}
              <div className="sm:hidden flex items-center gap-1 bg-surface text-text-primary rounded-full px-2 py-1 shadow-sm">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {estimateReadTime(post.body_html)}
                </span>
              </div>
              
              {/* Show on hover on desktop */}
              <div className="hidden sm:flex items-center gap-1 bg-surface text-text-primary rounded-full px-2 py-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {estimateReadTime(post.body_html)}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section - 55% width */}
          <div className="w-[55%] relative h-60">
            {/* Author info aligned to top */}
            <div className="absolute top-0 left-0 right-0">
              <span className="text-accent text-sm font-medium">Ethan Caldwell</span>
              <span className="text-text-muted text-sm ml-2">
                on {formatDate(post.publish_at || post.created_at)}
              </span>
            </div>

            {/* Title and excerpt in middle */}
            <div className="absolute top-8 left-0 right-0 bottom-12">
              <Link to={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-bold mb-3 text-pretty leading-tight text-text-primary hover:text-accent transition-colors">
                  {post.title}
                </h2>
              </Link>

              <p className="text-text-secondary text-sm text-pretty leading-relaxed line-clamp-3">
                {post.summary || post.title}
              </p>
            </div>

            {/* Button aligned to bottom */}
            <div className="absolute bottom-0 left-0">
              <Button 
                asChild
                className="bg-accent hover:bg-accent-hover text-text-inverse border-0 text-sm px-6 py-2 rounded-xl shadow-sm"
              >
                <Link to={`/blog/${post.slug}`}>
                  Discover More
                </Link>
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}