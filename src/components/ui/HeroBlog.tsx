// src/components/ui/HeroBlog.tsx
// World-class mobile-first responsive hero carousel with zero overflow

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Minimum swipe distance for gesture detection (in px)
  const minSwipeDistance = 50;

  // Touch handlers for swipe gestures (mobile)
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left = next slide
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
    } else if (isRightSwipe) {
      // Swipe right = previous slide
      setDirection(-1);
      setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
    }

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Autoplay logic
  useEffect(() => {
    if (shouldReduceMotion || featuredPosts.length <= 1 || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [featuredPosts.length, autoplayInterval, shouldReduceMotion, isPaused]);

  // Navigation functions with explicit event handling
  const nextSlide = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % featuredPosts.length);
  }, [featuredPosts.length]);

  const prevSlide = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
  }, [featuredPosts.length]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const estimateReadTime = (content: string | null) => {
    if (!content) return '1 Min';
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    return `${readTime} Min`;
  };

  if (!featuredPosts.length) {
    return null;
  }

  const currentPost = featuredPosts[currentSlide];

  // Animation variants - mobile-optimized (reduced motion on smaller screens)
  const slideVariants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 50 : -50,
      opacity: shouldReduceMotion ? 1 : 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -50 : 50,
      opacity: shouldReduceMotion ? 1 : 0,
    }),
  };

  return (
    <section
      className={cn(
        // Mobile-first: compact height on mobile, scales up for larger screens
        'relative w-full',
        'h-[360px] xs:h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px]',
        // Responsive border radius - smaller on mobile
        'rounded-2xl sm:rounded-3xl',
        'overflow-hidden',
        'shadow-xl sm:shadow-2xl shadow-black/20',
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => {
        setIsPaused(true);
        onTouchStart(e);
      }}
      onTouchMove={onTouchMove}
      onTouchEnd={() => {
        setIsPaused(false);
        onTouchEnd();
      }}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <ResponsiveImage
              src={currentPost.image_url || ''}
              alt=""
              className="w-full h-full"
              aspectRatio="16/9"
              objectFit="cover"
              fetchPriority="high"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dark gradient overlay - stronger on mobile for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 sm:bg-gradient-to-r sm:from-black/85 sm:via-black/50 sm:to-transparent pointer-events-none" />
      </div>

      {/* Content - Mobile-first responsive padding and positioning */}
      <div className={cn(
        'relative z-10 h-full flex flex-col',
        // Mobile: content at bottom, Desktop: content centered
        'justify-end sm:justify-center',
        // Mobile-first padding - compact on mobile, expands on larger screens
        // Desktop needs extra padding to avoid nav arrow overlap
        'px-4 xs:px-5 sm:px-16 md:px-20 lg:px-24',
        'pb-14 sm:pb-8', // Extra bottom padding on mobile for indicators
        'pt-4 sm:py-8'
      )}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
            className={cn(
              // Responsive max-width - full width on mobile, constrained on desktop
              'w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl',
              // Responsive spacing between elements
              'space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-4'
            )}
          >
            {/* Category Badge - smaller on mobile */}
            {currentPost.category && (
              <Badge
                variant="secondary"
                className={cn(
                  'bg-accent text-text-inverse border-0 font-medium',
                  // Mobile-first sizing
                  'px-2.5 py-1 text-xs',
                  'sm:px-3 sm:py-1.5 sm:text-sm'
                )}
              >
                {currentPost.category.name}
              </Badge>
            )}

            {/* Title - Fluid responsive typography */}
            <h2 className={cn(
              'font-bold text-white leading-[1.15] tracking-tight',
              // Mobile-first fluid typography - scales smoothly
              'text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem]',
              // Line clamping for overflow protection
              'line-clamp-3 sm:line-clamp-none'
            )}>
              {currentPost.title}
            </h2>

            {/* Summary - Hidden on very small screens, shown with line clamp */}
            {currentPost.summary && (
              <p className={cn(
                'text-white/85 leading-relaxed',
                // Hide on very small mobile, show from xs up
                'hidden xs:block',
                // Responsive text size
                'text-sm sm:text-base md:text-lg',
                // Line clamping
                'line-clamp-2'
              )}>
                {currentPost.summary}
              </p>
            )}

            {/* Meta Information - Compact on mobile */}
            <div className={cn(
              'flex items-center flex-wrap gap-2 sm:gap-3',
              'text-xs sm:text-sm text-white/75'
            )}>
              <span>{formatDate(currentPost.created_at)}</span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                {estimateReadTime(currentPost.body_html)}
              </span>
            </div>

            {/* CTA Button - Touch-friendly sizing */}
            <div className="pt-1 sm:pt-2 md:pt-3">
              <Button
                onClick={() => onSelect?.(currentPost.slug)}
                className={cn(
                  'bg-accent hover:bg-accent-hover text-text-inverse border-0',
                  'font-medium rounded-lg sm:rounded-xl',
                  'shadow-lg transition-all duration-300',
                  'hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]',
                  // Mobile-first touch-friendly sizing (min 44px height)
                  'h-10 px-5 text-sm',
                  'sm:h-11 sm:px-6 sm:text-base',
                  'md:h-12 md:px-8 md:text-lg'
                )}
              >
                Discover More
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows - Touch-friendly, properly positioned */}
      {featuredPosts.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className={cn(
              // Hidden on mobile - use swipe gestures instead
              'hidden sm:flex',
              // Positioning - inset from edges
              'absolute top-1/2 -translate-y-1/2 z-30',
              'sm:left-4 md:left-6',
              // Touch-friendly sizing
              'sm:w-11 sm:h-11 md:w-12 md:h-12',
              'rounded-full',
              // Styling
              'bg-white/10 hover:bg-white/25 active:bg-white/30',
              'text-white border border-white/30',
              'items-center justify-center',
              'transition-all duration-200',
              'backdrop-blur-md',
              'active:scale-90',
              'focus:outline-none focus:ring-2 focus:ring-white/50',
              'shadow-lg'
            )}
            aria-label="Previous featured post"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className={cn(
              // Hidden on mobile - use swipe gestures instead
              'hidden sm:flex',
              // Positioning - inset from edges
              'absolute top-1/2 -translate-y-1/2 z-30',
              'sm:right-4 md:right-6',
              // Touch-friendly sizing
              'sm:w-11 sm:h-11 md:w-12 md:h-12',
              'rounded-full',
              // Styling
              'bg-white/10 hover:bg-white/25 active:bg-white/30',
              'text-white border border-white/30',
              'items-center justify-center',
              'transition-all duration-200',
              'backdrop-blur-md',
              'active:scale-90',
              'focus:outline-none focus:ring-2 focus:ring-white/50',
              'shadow-lg'
            )}
            aria-label="Next featured post"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Slide Indicators - Bottom center, touch-friendly */}
      {featuredPosts.length > 1 && (
        <div className={cn(
          'absolute left-1/2 -translate-x-1/2 z-30',
          'bottom-4 sm:bottom-5 md:bottom-6',
          'flex gap-1.5 sm:gap-2'
        )}>
          {featuredPosts.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={cn(
                // Touch-friendly minimum size
                'min-w-[10px] min-h-[10px]',
                'w-2 h-2 sm:w-2.5 sm:h-2.5',
                'rounded-full border transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-white/50',
                index === currentSlide
                  ? 'bg-white border-white scale-110'
                  : 'bg-white/30 border-white/40 hover:bg-white/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}