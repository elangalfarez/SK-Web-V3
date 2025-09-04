// src/components/ui/HeroBlog.tsx
// Modified: Fixed contrast issues, solid badges, proper overlay implementation, rounded images

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
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
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} Min Read`;
  };

  if (!featuredPosts || featuredPosts.length === 0) {
    return null;
  }

  const currentPost = featuredPosts[currentSlide];

  return (
    <section 
      className={cn('relative h-[500px] rounded-2xl overflow-hidden group', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region" 
      aria-label="Featured blog posts"
    >
      {/* Background Image */}
      <ResponsiveImage
        src={currentPost.image_url || ''}
        alt=""
        className="w-full h-full"
        aspectRatio="16/9"
        objectFit="cover"
        fetchPriority="high"
      />
      
      {/* Dark Overlay for Content Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full px-6 md:px-8 lg:px-12">
          <div className="max-w-2xl">
            {/* Category and Read Time Badges - Top Left */}
            <div className="flex items-center gap-3 mb-6">
              {currentPost.category && (
                <Badge className="bg-accent text-text-inverse border-0 font-medium shadow-sm">
                  {currentPost.category.name.toUpperCase()}
                </Badge>
              )}
              
              {/* Read Time - Top Right Area */}
              <div className="ml-auto">
                <Badge className="bg-surface/20 text-white border-0 font-medium shadow-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  {estimateReadTime(currentPost.body_html)}
                </Badge>
              </div>
            </div>

            {/* Author and Date */}
            <div className="flex items-center gap-2 text-gray-200 text-sm mb-4">
              <span>Ethan Caldwell</span>
              <span>•</span>
              <span>{formatDate(currentPost.publish_at || currentPost.created_at)}</span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {currentPost.title}
            </h2>

            {/* Summary */}
            <p className="text-lg text-gray-200 mb-8 line-clamp-2 leading-relaxed max-w-xl">
              {currentPost.summary || currentPost.title}
            </p>

            {/* CTA Button */}
            <Button
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