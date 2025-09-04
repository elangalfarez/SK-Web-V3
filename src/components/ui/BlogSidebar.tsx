// src/components/ui/BlogSidebar.tsx
// Modified: Wider boxed design with white cards, drop shadows, uses ResponsiveImage

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
      onSubscribe?.(email);
      setEmail('');
    }
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* About Section */}
      {showAuthor && (
        <Card className="border-0 shadow-lg rounded-3xl">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-6">ABOUT</h3>

            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-12 h-12 rounded-3xl">
                <AvatarImage src="/professional-headshot.png" />
                <AvatarFallback>EC</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-lg text-primary">{authorName}</h4>
                <p className="text-sm text-gray-500 uppercase tracking-wide">REFLECTIVE BLOGGER</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {authorBio}
            </p>

            <div className="flex items-center gap-2 text-gray-500 mb-4">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{authorLocation}</span>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="p-2 h-auto">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-auto">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-auto">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" className="p-2 h-auto">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter Subscription */}
      <Card className="border-0 shadow-lg rounded-3xl">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-6">STAY UPDATED</h3>
          
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-primary mb-2">Subscribe to our newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Get the latest posts and exclusive content delivered directly to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-primary placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors text-sm"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Subscribe
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <Card className="border-0 shadow-lg rounded-3xl">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-6">FEATURED POSTS</h3>

            <div className="space-y-6">
              {featuredPosts.map((post, index) => (
                <div key={post.id}>
                  {index === 0 ? (
                    // First featured post - large card
                    <Card className="overflow-hidden border-0 shadow-sm rounded-3xl">
                      <CardContent className="p-0">
                        <div className="bg-gradient-to-br from-amber-700 to-orange-800 p-4 text-white relative rounded-3xl">
                          {post.category && (
                            <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 mb-3 text-xs rounded-3xl">
                              {post.category.name.toUpperCase()}
                            </Badge>
                          )}

                          <div className="mb-3">
                            <span className="text-white/80 text-xs">Ethan Caldwell</span>
                            <span className="text-white/60 text-xs ml-2">on {formatDate(post.publish_at || post.created_at)}</span>
                          </div>

                          <h4 className="text-sm font-bold mb-3 text-balance leading-tight">
                            {post.title}
                          </h4>

                          <ResponsiveImage
                            src={post.image_url || ''}
                            alt={post.title}
                            className="w-full h-20 object-cover rounded-2xl"
                            aspectRatio="4/3"
                            loading="lazy"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // Other featured posts - compact
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group flex gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
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
                        <h5 className="font-medium text-sm text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-1">
                          {post.title}
                        </h5>
                        <p className="text-xs text-muted-foreground">
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
        <Card className="border-0 shadow-lg rounded-3xl">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-6">POPULAR TAGS</h3>
            
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
        <Card className="border-0 shadow-lg rounded-3xl">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500 tracking-wider uppercase mb-6">CATEGORIES</h3>
            
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => onCategoryClick?.(category.id)}
                  className="w-full text-left px-3 py-2 hover:bg-surface-secondary rounded-lg transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary group-hover:text-accent transition-colors">
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {category.post_count || 0}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}