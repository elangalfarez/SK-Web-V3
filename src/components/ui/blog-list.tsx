// src/components/ui/blog-list.tsx
// Fixed: removed unused React and Button imports (TS6133)

import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Numeric pagination (as per user request)
  const renderPagination = () => {
    if (!onPageChange || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            i === currentPage
              ? 'bg-accent text-text-inverse shadow-sm'
              : 'text-text-primary hover:bg-surface-secondary border border-border-primary'
          )}
          aria-label={`Go to page ${i}`}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-12">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg text-text-primary hover:bg-surface-secondary border border-border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-secondary border border-border-primary transition-colors"
              aria-label="Go to page 1"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-2 text-text-muted">...</span>
            )}
          </>
        )}
        
        {pages}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-text-muted">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-secondary border border-border-primary transition-colors"
              aria-label={`Go to page ${totalPages}`}
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg text-text-primary hover:bg-surface-secondary border border-border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
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

      {/* Numeric Pagination */}
      {renderPagination()}

      {/* Results Summary */}
      {totalPages > 1 && (
        <div className="text-center mt-6">
          <p className="text-sm text-text-muted">
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