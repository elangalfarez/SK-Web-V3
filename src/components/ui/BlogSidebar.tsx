// src/components/ui/BlogSidebar.tsx
// Modified: Wider boxed design with white cards, drop shadows, responsive image usage, rounded corners

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, User, Calendar, Tag, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ResponsiveImage } from './ResponsiveImage';
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
  showAuthor = true,
  authorName = 'Ethan Caldwell',
  authorBio = 'Ethan Caldwell shares thoughtful insights and reflections on life, culture, and personal growth. His work explores the intersections of creativity and experience, offering readers unique perspectives.',
  authorLocation = 'Paris, France'
}: BlogSidebarProps) {
  const [email, setEmail] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubscribe?.(email.trim());
      setEmail(''); // Reset form
    }
  };

  return (
    <aside className={cn('space-y-8', className)}>
      {/* Author Profile Card */}
      {showAuthor && (
        <Card className="border-0 shadow-lg rounded-3xl bg-surface">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-6">ABOUT</h3>
              
              {/* Profile section */}
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent/20 to-accent/40 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-accent" />
                </div>
                
                <h4 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-2">REFLECTIVE BLOGGER</h4>
                
                <p className="text-sm text-text-secondary leading-relaxed mb-4">
                  {authorBio}
                </p>
                
                <div className="flex items-center justify-center gap-2 text-text-muted text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{authorLocation}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter Subscription Card */}
      <Card className="border-0 shadow-lg rounded-3xl bg-surface">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-6">STAY UPDATED</h3>
          
          <p className="text-sm text-text-secondary mb-4">
            Get the latest posts and exclusive content delivered directly to your inbox.
          </p>
          
          <form onSubmit={handleSubscribe} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-border-primary rounded-xl text-sm text-text-primary placeholder-text-muted bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              required
              aria-label="Email address for newsletter"
            />
            <Button 
              type="submit"
              className="w-full bg-accent hover:bg-accent-hover text-text-inverse border-0 rounded-xl py-3 font-medium"
            >
              <Mail className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <Card className="border-0 shadow-lg rounded-3xl bg-surface">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-6">FEATURED POSTS</h3>
            
            <div className="space-y-6">
              {featuredPosts.slice(0, 3).map((post, index) => (
                <div key={post.id}>
                  {index === 0 ? (
                    // First featured post - large card
                    <Card className="border border-border-primary shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <Link to={`/blog/${post.slug}`} className="block group">
                          <ResponsiveImage
                            src={post.image_url || ''}
                            alt={post.title}
                            className="w-full h-32 object-cover"
                            aspectRatio="4/3"
                            loading="lazy"
                          />
                        </Link>
                        
                        <div className="p-4">
                          <Link to={`/blog/${post.slug}`}>
                            <h4 className="font-semibold text-sm text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-2">
                              {post.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-text-muted">
                            {formatDate(post.publish_at || post.created_at)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // Other featured posts - compact
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group flex gap-3 hover:bg-surface-secondary rounded-xl p-2 transition-colors"
                    >
                      <ResponsiveImage
                        src={post.image_url || ''}
                        alt=""
                        className="w-16 h-12 flex-shrink-0 rounded-lg"
                        aspectRatio="4/3"
                        objectFit="cover"
                        loading="lazy"
                      />
                      
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-sm text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-1">
                          {post.title}
                        </h5>
                        <p className="text-xs text-text-muted">
                          {formatDate(post.publish_at || post.created_at)}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <Card className="border-0 shadow-lg rounded-3xl bg-surface">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-6">POPULAR TAGS</h3>
            
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <BlogCategoryPill
                  key={tag.name}
                  name={tag.name}
                  count={tag.count}
                  onClick={() => onTagClick?.(tag.name)}
                  variant="outline"
                  size="sm"
                  className="hover:bg-surface-secondary"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card className="border-0 shadow-lg rounded-3xl bg-surface">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-text-muted tracking-wider uppercase mb-6">CATEGORIES</h3>
            
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => onCategoryClick?.(category.id)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-secondary rounded-xl transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-primary group-hover:text-accent transition-colors">
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="text-xs bg-surface-secondary border-0">
                      {category.post_count || 0}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
}