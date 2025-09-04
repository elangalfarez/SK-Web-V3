// src/components/ui/blog-list.tsx
// Modified: Load More pagination (as requested), consistent heights, ResponsiveImage support

import React, { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BlogCard from '@/components/ui/blog-card';
import { cn } from '@/lib/utils';
import type { Post } from '../../lib/supabase';

interface BlogListProps {
  posts: Post[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
  variant?: 'grid' | 'list';
}

const BlogList = memo(function BlogList({ 
  posts, 
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  variant = 'grid'
}: BlogListProps) {
  const shouldReduceMotion = useReducedMotion();

  // Load More pagination (as per user request)
  const renderLoadMore = () => {
    if (!onPageChange || currentPage >= totalPages) return null;

    return (
      <div className="text-center mt-12">
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          variant="outline"
          size="lg"
          className="px-8 py-3"
        >
          <Plus size={16} className="mr-2" />
          Load More Posts
        </Button>
      </div>
    );
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-surface-secondary rounded-full flex items-center justify-center">
          <span className="text-muted-foreground text-2xl">📰</span>
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">No posts found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Posts Grid/List */}
      <div 
        className={cn(
          'gap-6',
          variant === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
            : 'space-y-8'
        )}
        role="feed"
        aria-label="Blog posts"
      >
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? {} : { 
              delay: index * 0.1,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            // Ensure consistent heights in grid layout
            className={variant === 'grid' ? 'h-full flex' : ''}
          >
            <BlogCard 
              post={post} 
              className={variant === 'grid' ? 'flex-1' : ''}
            />
          </motion.div>
        ))}
      </div>

      {/* Load More Pagination */}
      {renderLoadMore()}

      {/* Results Summary */}
      {totalPages > 1 && (
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} 
            {posts.length > 0 && (
              <span> • Showing {posts.length} posts</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
});

export default BlogList;