// src/components/ui/blog-card.tsx
// Created: Reusable blog post card component with responsive design and accessibility

import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Calendar, Tag } from 'lucide-react';
import { Badge } from './Badge';
import type { Post } from '../../lib/supabase';

interface BlogCardProps {
  post: Post;
  className?: string;
}

export default function BlogCard({ post, className = '' }: BlogCardProps) {
  const shouldReduceMotion = useReducedMotion();

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fallback for missing image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.classList.add('bg-surface');
      parent.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground text-sm">No image</div>';
    }
  };

  return (
    <motion.article
      whileHover={shouldReduceMotion ? {} : { y: -4, scale: 1.02 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group ${className}`}
      style={{
        // CSS custom property fallback for database accent colors
        ['--post-accent' as any]: post.category?.accent_color || 'transparent'
      }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="block focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-xl"
        aria-labelledby={`post-title-${post.id}`}
        aria-describedby={`post-summary-${post.id}`}
      >
        {/* Post Image */}
        <div className="aspect-video overflow-hidden relative bg-surface-secondary">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt=""
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-surface flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}

          {/* Featured Badge */}
          {post.is_featured && (
            <div className="absolute top-3 left-3">
              <Badge variant="primary" className="text-xs font-medium">
                Featured
              </Badge>
            </div>
          )}

          {/* Category Badge */}
          {post.category && (
            <div className="absolute top-3 right-3">
              <Badge 
                variant="secondary" 
                className="text-xs font-medium bg-background/90 backdrop-blur-sm"
                style={{
                  // Use CSS custom property for category accent color
                  borderColor: 'var(--post-accent, transparent)'
                }}
              >
                {post.category.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="p-6 space-y-4">
          {/* Post Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                <span className="truncate">{post.tags[0]}</span>
                {post.tags.length > 1 && (
                  <span className="text-xs">+{post.tags.length - 1}</span>
                )}
              </div>
            )}
          </div>

          {/* Post Title */}
          <h3 
            id={`post-title-${post.id}`}
            className="text-lg font-semibold text-primary line-clamp-2 leading-tight group-hover:text-accent transition-colors"
          >
            {post.title}
          </h3>

          {/* Post Summary */}
          {post.summary && (
            <p 
              id={`post-summary-${post.id}`}
              className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
            >
              {post.summary}
            </p>
          )}

          {/* Read More Indicator */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-accent group-hover:underline">
              Read more
            </span>
            
            {/* Tags Preview */}
            {post.tags.length > 1 && (
              <div className="flex gap-1">
                {post.tags.slice(1, 3).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}