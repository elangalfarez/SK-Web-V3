// src/components/ui/HeroBlog.tsx
// Fixed: Use correct Post type properties (summary instead of excerpt, body_html instead of content)

import { useState, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResponsiveImage } from './ResponsiveImage';
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Autoplay logic
  useEffect(() => {
    if (shouldReduceMotion || featuredPosts.length <= 1 || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [featuredPosts.length, autoplayInterval, shouldReduceMotion, isPaused]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
  };

  // Helper functions
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
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    return `${readTime} Min Read`;
  };

  if (!featuredPosts.length) {
    return null;
  }

  const currentPost = featuredPosts[currentSlide];

  return (
    <section 
      className={cn(
        'relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <ResponsiveImage
          src={currentPost.image_url || ''}
          alt=""
          className="w-full h-full"
          aspectRatio="16/9"
          objectFit="cover"
          fetchPriority="high"
        />
        
        {/* Dark gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12">
        <div className="max-w-2xl space-y-4">
          {/* Category Badge */}
          {currentPost.category && (
            <Badge 
              variant="secondary"
              className="bg-accent text-text-inverse border-0 px-4 py-1.5 text-sm font-medium"
            >
              {currentPost.category.name}
            </Badge>
          )}

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {currentPost.title}
          </h2>

          {/* Summary */}
          {currentPost.summary && (
            <p className="text-lg text-white/90 leading-relaxed line-clamp-2">
              {currentPost.summary}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span>{formatDate(currentPost.created_at)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {estimateReadTime(currentPost.body_html)}
            </span>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={() => onSelect?.(currentPost.slug)}
              className="bg-accent hover:bg-accent-hover text-text-inverse border-0 px-8 py-3 text-lg font-medium rounded-xl shadow-lg"
            >
              Discover More
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featuredPosts.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface/20 hover:bg-surface/30 text-white border border-white/20 flex items-center justify-center transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous featured post"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface/20 hover:bg-surface/30 text-white border border-white/20 flex items-center justify-center transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next featured post"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {featuredPosts.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredPosts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                'w-3 h-3 rounded-full border border-white/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50',
                index === currentSlide 
                  ? 'bg-white' 
                  : 'bg-white/20 hover:bg-white/40'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}