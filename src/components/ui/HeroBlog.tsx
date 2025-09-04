// src/components/ui/HeroBlog.tsx
// Created: Hero slideshow component for featured posts with overlay content and keyboard navigation

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ImageWithFallback from './ImageWithFallback';
import BlogCategoryPill from './BlogCategoryPill';
import { cn } from '@/lib/utils';
import type { Post } from '../../lib/supabase';

interface HeroBlogProps {
  featuredPosts: Post[];
  onSelect?: (slug: string) => void;
  autoplayInterval?: number;
  className?: string;
}

export default function HeroBlog({ 
  featuredPosts, 
  onSelect, 
  autoplayInterval = 5000,
  className = '' 
}: HeroBlogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Autoplay logic (disabled if reduced motion preferred)
  useEffect(() => {
    if (shouldReduceMotion || featuredPosts.length <= 1 || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [featuredPosts.length, autoplayInterval, shouldReduceMotion, isPaused]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'Enter' && featuredPosts[currentIndex]) {
      onSelect?.(featuredPosts[currentIndex].slug);
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredPosts.length);
    setIsPaused(true);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
    setIsPaused(true);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadTime = (content: string | null) => {
    if (!content) return '5 min read';
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200); // Average reading speed
    return `${minutes} min read`;
  };

  if (!featuredPosts.length) {
    return null;
  }

  const currentPost = featuredPosts[currentIndex];

  return (
    <section 
      className={cn('relative h-[70vh] overflow-hidden group', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured blog posts"
    >
      {/* Background Images */}
      <div className="relative w-full h-full">
        {featuredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            className="absolute inset-0"
            initial={shouldReduceMotion ? {} : { opacity: 0 }}
            animate={shouldReduceMotion ? {} : { 
              opacity: index === currentIndex ? 1 : 0 
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <ImageWithFallback
              src={post.image_url || ''}
              alt={post.title}
              className="w-full h-full"
              objectFit="cover"
              objectPosition="center"
              fetchPriority={index === 0 ? 'high' : 'low'}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </motion.div>
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              key={currentIndex}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Category & Read Time */}
              <div className="flex items-center gap-4">
                {currentPost.category && (
                  <BlogCategoryPill
                    name={currentPost.category.name}
                    variant="secondary"
                    size="sm"
                    accentColor={currentPost.category.accent_color}
                    className="bg-white/10 border-white/20 text-white backdrop-blur-sm"
                  />
                )}
                
                <Badge className="bg-white/10 border-white/20 text-white text-xs backdrop-blur-sm">
                  <Clock size={12} className="mr-1" />
                  {estimateReadTime(currentPost.body_html)}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {currentPost.title}
              </h1>

              {/* Summary */}
              {currentPost.summary && (
                <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-xl">
                  {currentPost.summary}
                </p>
              )}

              {/* Meta & CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 text-gray-300 text-sm">
                  <time className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    {formatDate(currentPost.publish_at || currentPost.created_at)}
                  </time>
                </div>

                <Button 
                  size="lg"
                  onClick={() => onSelect?.(currentPost.slug)}
                  className="bg-accent hover:bg-accent/90 text-text-inverse font-semibold"
                >
                  Read Article
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {featuredPosts.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Previous featured post"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Next featured post"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  index === currentIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white/40 hover:bg-white/60'
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        </>
      )}

      {/* Screen Reader Content */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {featuredPosts.length}: {currentPost.title}
      </div>
    </section>
  );
}