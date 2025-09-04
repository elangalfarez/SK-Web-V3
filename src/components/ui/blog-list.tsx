// src/components/ui/blog-list.tsx
// Modified: Consistent heights with golden-ratio BlogCard, numbered pagination support, improved grid alignment

import React, { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Numbered pagination component
  const renderPagination = () => {
    if (!onPageChange || totalPages <= 1) return null;

    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = Array.from(
      { length: endPage - startPage + 1 }, 
      (_, i) => startPage + i
    );

    return (
      <nav 
        className="flex justify-center mt-12"
        role="navigation"
        aria-label="Blog pagination"
      >
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3"
            aria-label="Go to previous page"
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </Button>

          {/* First page + ellipsis */}
          {startPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                className="px-3"
                aria-label="Go to page 1"
              >
                1
              </Button>
              {startPage > 2 && (
                <span className="text-muted-foreground px-2">...</span>
              )}
            </>
          )}

          {/* Page numbers */}
          {pages.map(page => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="px-3"
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </Button>
          ))}

          {/* Last page + ellipsis */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="text-muted-foreground px-2">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="px-3"
                aria-label={`Go to page ${totalPages}`}
              >
                {totalPages}
              </Button>
            </>
          )}

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-3"
            aria-label="Go to next page"
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </nav>
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

      {/* Pagination */}
      {renderPagination()}

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