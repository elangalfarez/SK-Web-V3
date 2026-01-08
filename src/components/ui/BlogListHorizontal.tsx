// src/components/ui/BlogListHorizontal.tsx
// World-class mobile-first responsive blog list

import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
      month: 'short',
      day: 'numeric'
    });
  };

  const estimateReadTime = (content: string | null) => {
    if (!content) return '5 Min';
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} Min`;
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
      <div className="text-center py-10 sm:py-16">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-surface-secondary rounded-full flex items-center justify-center">
          <span className="text-text-muted text-xl sm:text-2xl">📰</span>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">No posts found</h3>
        <p className="text-sm sm:text-base text-text-muted">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 sm:space-y-6 md:space-y-8', className)}>
      {posts.map((post, index) => (
        <article
          key={post.id}
          className={cn(
            // Mobile: Stacked, Desktop: Side by side
            'flex flex-col sm:flex-row',
            'gap-3 sm:gap-4 md:gap-6',
            'pb-4 sm:pb-6 md:pb-8',
            'group',
            index < posts.length - 1 && 'border-b border-border-primary'
          )}
        >
          {/* Image Section - Full width on mobile, 45% on desktop */}
          <div className="w-full sm:w-[45%] relative flex-shrink-0">
            <Link to={`/blog/${post.slug}`} className="block">
              {post.image_url ? (
                <ResponsiveImage
                  src={post.image_url}
                  alt={post.title}
                  className={cn(
                    'w-full object-cover',
                    // Responsive height and border radius
                    'h-40 xs:h-48 sm:h-52 md:h-60',
                    'rounded-xl sm:rounded-2xl'
                  )}
                  aspectRatio="4/3"
                  objectFit="cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className={cn(
                  'w-full flex items-center justify-center',
                  'h-40 xs:h-48 sm:h-52 md:h-60',
                  'rounded-xl sm:rounded-2xl',
                  generateGradientFallback(index)
                )}>
                  <span className="text-white text-4xl sm:text-5xl md:text-6xl opacity-50">📰</span>
                </div>
              )}

              {/* Read Time Badge - Always visible on mobile, hover on desktop */}
              <div className={cn(
                'absolute top-2 right-2 sm:top-4 sm:right-4',
                'sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300'
              )}>
                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 shadow-lg">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-600" />
                  <span className="text-[10px] sm:text-xs font-medium text-gray-700">
                    {estimateReadTime(post.body_html)}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Content Section - Full width on mobile, 55% on desktop */}
          <div className="w-full sm:w-[55%] flex flex-col justify-center min-w-0">
            {/* Category Badge - Smaller on mobile */}
            {post.category && (
              <div className="mb-2 sm:mb-3">
                <Badge className={cn(
                  'bg-accent text-text-inverse border-0 font-medium shadow-sm',
                  'text-[10px] sm:text-xs',
                  'px-2 py-0.5 sm:px-2.5 sm:py-1',
                  'hover:shadow-md transition-shadow'
                )}>
                  {post.category.name.toUpperCase()}
                </Badge>
              </div>
            )}

            {/* Title - Responsive typography */}
            <Link to={`/blog/${post.slug}`}>
              <h3 className={cn(
                'font-bold text-text-primary group-hover:text-accent transition-colors',
                'leading-tight line-clamp-2',
                'text-base xs:text-lg sm:text-xl md:text-2xl',
                'mb-1.5 sm:mb-2 md:mb-3'
              )}>
                {post.title}
              </h3>
            </Link>

            {/* Summary - Hidden on very small screens */}
            {post.summary && (
              <p className={cn(
                'text-text-secondary line-clamp-2 leading-relaxed',
                'hidden xs:block',
                'text-sm sm:text-base',
                'mb-2 sm:mb-3 md:mb-4'
              )}>
                {post.summary}
              </p>
            )}

            {/* Meta Info - Responsive spacing and sizing */}
            <div className={cn(
              'flex items-center flex-wrap',
              'gap-1.5 sm:gap-2 md:gap-4',
              'text-xs sm:text-sm text-text-muted'
            )}>
              <time dateTime={post.publish_at || post.created_at}>
                {formatDate(post.publish_at || post.created_at)}
              </time>
              {post.tags.length > 0 && (
                <>
                  <span className="text-text-muted/50">•</span>
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-accent font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}