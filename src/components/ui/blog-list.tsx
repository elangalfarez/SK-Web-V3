// src/components/ui/blog-list.tsx
// Created: Responsive blog posts grid component with performance optimization

import React, { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import BlogCard from '@/components/ui/blog-card';
import type { Post } from '../../lib/supabase';

interface BlogListProps {
  posts: Post[];
  className?: string;
}

const BlogList = memo(function BlogList({ posts, className = '' }: BlogListProps) {
  const shouldReduceMotion = useReducedMotion();

  if (posts.length === 0) {
    return null;
  }

  return (
    <div 
      className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      role="feed"
      aria-label="Blog posts"
    >
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? {} : { 
            delay: index * 0.05,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <BlogCard 
            post={post} 
            className="h-full"
          />
        </motion.div>
      ))}
    </div>
  );
});

export default BlogList;