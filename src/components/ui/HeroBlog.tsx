// src/components/ui/HeroBlog.tsx
// Modified: Proper hero slider overlay implementation using design tokens, balanced image rounding

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} Min Read`;
  };

  if (!featuredPosts.length) {
    return null;
  }

  const currentHeroSlide = featuredPosts[currentSlide];

  return (
    <div className="px-6">
      <div className="max-w-6xl mx-auto">
        <div 
          className={cn('relative w-full h-[500px] overflow-hidden rounded-2xl mt-6 mb-12', className)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${currentHeroSlide.image_url})` }}
          >
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Content Overlay - Following Good Layout Code reference exactly */}
          <div className="relative z-10 h-full flex flex-col justify-between p-8 text-white">
            {/* Top Section - Categories and Read Time */}
            <div className="flex justify-between items-start ml-12">
              <div className="flex gap-2">
                {currentHeroSlide.category && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 text-xs font-medium backdrop-blur-sm">
                    {currentHeroSlide.category.name.toUpperCase()}
                  </Badge>
                )}
                {currentHeroSlide.tags.slice(0, 1).map(tag => (
                  <Badge key={tag} className="bg-white/20 text-white hover:bg-white/30 border-0 text-xs font-medium backdrop-blur-sm">
                    {tag.toUpperCase()}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs font-medium">{estimateReadTime(currentHeroSlide.body_html)}</span>
              </div>
            </div>

            {/* Bottom Section - Content */}
            <div className="max-w-2xl ml-12">
              <div className="mb-4">
                <span className="text-white/90 text-sm font-medium">Ethan Caldwell</span>
                <span className="text-white/70 text-sm ml-2">
                  on {formatDate(currentHeroSlide.publish_at || currentHeroSlide.created_at)}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4 text-balance leading-tight">
                {currentHeroSlide.title}
              </h1>

              <p className="text-white/90 text-base leading-relaxed mb-6 max-w-xl">
                {currentHeroSlide.summary || currentHeroSlide.title}
              </p>

              <Button 
                className="bg-accent hover:bg-accent-hover text-text-inverse border-0 px-6 py-2 rounded-xl"
                onClick={() => onSelect?.(currentHeroSlide.slug)}
              >
                Discover More
              </Button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {featuredPosts.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-6 right-8 flex gap-2 z-20">
                {featuredPosts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      index === currentSlide ? 'bg-white' : 'bg-white/50'
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}