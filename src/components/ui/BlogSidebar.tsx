// src/components/ui/BlogSidebar.tsx
// Created: Modular sidebar with subscribe CTA, tags, and featured posts using ImageWithFallback

import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, User, Calendar, Tag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ImageWithFallback from './ImageWithFallback';
import BlogCategoryPill from './BlogCategoryPill';
import { cn } from '@/lib/utils';
import type { Post, BlogCategory } from '../../lib/supabase';

interface BlogSidebarProps {
  featuredPosts?: Post[];
  categories?: BlogCategory[];
  popularTags?: Array<{ name: string; count: number }>;
  onTagClick?: (tag: string) => void;
  onCategoryClick?: (categoryId: string) => void;
  onSubscribe?: (email: string) => void;
  className?: string;
  showAuthor?: boolean;
  authorName?: string;
  authorBio?: string;
  authorLocation?: string;
}

export default function BlogSidebar({
  featuredPosts = [],
  categories = [],
  popularTags = [],
  onTagClick,
  onCategoryClick,
  onSubscribe,
  className = '',
  showAuthor = false,
  authorName = 'Supermal Karawaci',
  authorBio = 'Your premier shopping and lifestyle destination in Karawaci, bringing you the latest news, events, and community stories.',
  authorLocation = 'Jakarta, Indonesia'
}: BlogSidebarProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubscribeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    if (email && onSubscribe) {
      onSubscribe(email);
      // Reset form
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <aside className={cn('space-y-8', className)}>
      {/* Author/About Section */}
      {showAuthor && (
        <div className="bg-surface-secondary rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <User size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">{authorName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span>{authorLocation}</span>
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {authorBio}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              Follow
            </Button>
            <Button size="sm" variant="outline">
              <Mail size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Newsletter Subscribe */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Mail size={18} className="text-accent" />
          </div>
          <h3 className="font-semibold text-primary">Stay Updated</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Get the latest news, events, and stories from Supermal Karawaci delivered to your inbox.
        </p>

        <form onSubmit={handleSubscribeSubmit} className="space-y-3">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-primary placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          />
          <Button type="submit" size="sm" className="w-full">
            <Mail size={16} className="mr-2" />
            Subscribe
          </Button>
        </form>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
            <Tag size={18} />
            Categories
          </h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryClick?.(category.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-secondary rounded-lg transition-colors group"
              >
                <span className="text-primary group-hover:text-accent font-medium">
                  {category.name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {/* Count would come from parent component if available */}
                  <Tag size={12} />
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div>
          <h3 className="font-semibold text-primary mb-4">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag, index) => (
              <BlogCategoryPill
                key={tag.name}
                name={tag.name}
                count={tag.count}
                variant="outline"
                size="sm"
                onClick={() => onTagClick?.(tag.name)}
                className="hover:bg-accent/10 hover:text-accent hover:border-accent/40"
              />
            ))}
          </div>
        </div>
      )}

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div>
          <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
            <Star size={18} />
            Featured Posts
          </h3>
          <div className="space-y-4">
            {featuredPosts.slice(0, 4).map((post, index) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex gap-3 p-3 hover:bg-surface-secondary rounded-lg transition-colors"
              >
                <ImageWithFallback
                  src={post.image_url || ''}
                  alt={post.title}
                  className="w-16 h-12 flex-shrink-0 rounded"
                  objectFit="cover"
                  loading="lazy"
                  fetchPriority="low"
                />
                
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-1">
                    {post.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={10} />
                    <time dateTime={post.publish_at || post.created_at}>
                      {formatDate(post.publish_at || post.created_at)}
                    </time>
                    
                    {post.is_featured && (
                      <Badge className="bg-accent/10 text-accent border border-accent/20 text-xs px-1.5 py-0.5">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {featuredPosts.length > 4 && (
            <div className="mt-4">
              <Link to="/blog">
                <Button variant="outline" size="sm" className="w-full">
                  View All Posts
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Back to Blog (for detail pages) */}
      <div className="pt-4 border-t border-border">
        <Link to="/blog">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            ← Back to Blog
          </Button>
        </Link>
      </div>
    </aside>
  );
}