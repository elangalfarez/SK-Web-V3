// src/components/ui/BlogListHorizontal.tsx
// Modified: Removed unused React import

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
                <div className={cn(
                  'w-full h-60 rounded-2xl flex items-center justify-center',
                  generateGradientFallback(index)
                )}>
                  <span className="text-white text-6xl opacity-50">📰</span>
                </div>
              )}

              {/* Read Time Badge - Appears on hover */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg">
                  <Clock className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">
                    {estimateReadTime(post.body_html)}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Content Section - 55% width */}
          <div className="w-[55%] flex flex-col justify-center">
            {/* Category Badge - Solid styling */}
            {post.category && (
              <div className="mb-3">
                <Badge className="bg-accent text-text-inverse border-0 font-medium shadow-sm hover:shadow-md transition-shadow">
                  {post.category.name.toUpperCase()}
                </Badge>
              </div>
            )}

            {/* Title */}
            <Link to={`/blog/${post.slug}`}>
              <h3 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors leading-tight line-clamp-2">
                {post.title}
              </h3>
            </Link>

            {/* Summary */}
            {post.summary && (
              <p className="text-text-secondary mb-4 line-clamp-2 leading-relaxed">
                {post.summary}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <time dateTime={post.publish_at || post.created_at}>
                {formatDate(post.publish_at || post.created_at)}
              </time>
              {post.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-2">
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