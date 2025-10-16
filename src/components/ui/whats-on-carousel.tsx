// src/components/ui/whats-on-carousel.tsx
// Created: World-class mobile carousel with buttery-smooth 60fps animations, spring physics, and perfect touch handling

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import { WhatsOnCard } from './whats-on-card';
import { WhatsOnItem } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface WhatsOnCarouselProps {
  items: WhatsOnItem[];
  onCardClick?: (item: WhatsOnItem) => void;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  showNavigation?: boolean;
  showDots?: boolean;
  className?: string;
}

export const WhatsOnCarousel: React.FC<WhatsOnCarouselProps> = ({
  items,
  onCardClick,
  autoplay = true,
  autoplayDelay = 8000,
  pauseOnHover = true,
  showNavigation = false,
  showDots = true,
  className,
}) => {
  // Cards per slide configuration
  const cardsPerDesktop = 3;
  const cardsPerMobile = 2;

  // Calculate max slides
  const maxDesktopSlides = Math.ceil(items.length / cardsPerDesktop);
  const maxMobileSlides = Math.ceil(items.length / cardsPerMobile);

  // State
  const [currentDesktopSlide, setCurrentDesktopSlide] = useState(0);
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for stale closure prevention
  const isHoveredRef = useRef(isHovered);
  const isDraggingRef = useRef(isDragging);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Container refs
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Mobile animation controls
  const mobileX = useMotionValue(0);
  const mobileControls = useAnimation();

  // Update refs when state changes
  useEffect(() => {
    isHoveredRef.current = isHovered;
    isDraggingRef.current = isDragging;
  }, [isHovered, isDragging]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Autoplay functionality - DESKTOP ONLY
  const startAutoplay = useCallback(() => {
    if (!autoplay || items.length <= cardsPerDesktop) return;

    intervalRef.current = setInterval(() => {
      if (!isHoveredRef.current && !isDraggingRef.current) {
        setCurrentDesktopSlide(prev => (prev + 1) % maxDesktopSlides);
      }
    }, autoplayDelay);
  }, [autoplay, autoplayDelay, maxDesktopSlides, items.length, cardsPerDesktop]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Setup autoplay - DESKTOP ONLY
  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay]);

  // Handle hover for pause on hover
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsHovered(false);
    }
  };

  // Desktop drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      if (Math.abs(deltaX) > 100) {
        if (deltaX > 0) {
          setCurrentDesktopSlide(prev => prev < maxDesktopSlides - 1 ? prev + 1 : prev);
        } else {
          setCurrentDesktopSlide(prev => prev > 0 ? prev - 1 : prev);
        }
        cleanup();
      }
    };

    const handleMouseUp = () => {
      cleanup();
    };

    const cleanup = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // MOBILE: Smooth spring animation to target slide
  const animateToSlide = useCallback((slideIndex: number) => {
    const containerWidth = mobileContainerRef.current?.offsetWidth || 0;
    const targetX = -slideIndex * containerWidth;
    
    mobileControls.start({
      x: targetX,
      transition: {
        type: prefersReducedMotion ? 'tween' : 'spring',
        stiffness: prefersReducedMotion ? undefined : 300,
        damping: prefersReducedMotion ? undefined : 30,
        mass: prefersReducedMotion ? undefined : 0.8,
        duration: prefersReducedMotion ? 0.3 : undefined,
      }
    });
  }, [mobileControls, prefersReducedMotion]);

  // MOBILE: Handle drag end with momentum and snap
  const handleDragEnd = useCallback((_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const containerWidth = mobileContainerRef.current?.offsetWidth || 0;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Determine which slide to snap to based on velocity and offset
    let targetSlide = currentMobileSlide;
    
    // Strong swipe (high velocity) - immediate snap
    if (Math.abs(velocity) > 500) {
      if (velocity < 0 && currentMobileSlide < maxMobileSlides - 1) {
        targetSlide = currentMobileSlide + 1;
      } else if (velocity > 0 && currentMobileSlide > 0) {
        targetSlide = currentMobileSlide - 1;
      }
    } 
    // Gentle drag - snap based on threshold (40% of container width)
    else if (Math.abs(offset) > containerWidth * 0.4) {
      if (offset < 0 && currentMobileSlide < maxMobileSlides - 1) {
        targetSlide = currentMobileSlide + 1;
      } else if (offset > 0 && currentMobileSlide > 0) {
        targetSlide = currentMobileSlide - 1;
      }
    }
    
    setCurrentMobileSlide(targetSlide);
    animateToSlide(targetSlide);
  }, [currentMobileSlide, maxMobileSlides, animateToSlide]);

  // Update mobile position when slide changes
  useEffect(() => {
    animateToSlide(currentMobileSlide);
  }, [currentMobileSlide, animateToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentDesktopSlide(prev => prev > 0 ? prev - 1 : maxDesktopSlides - 1);
        setCurrentMobileSlide(prev => prev > 0 ? prev - 1 : maxMobileSlides - 1);
      } else if (e.key === 'ArrowRight') {
        setCurrentDesktopSlide(prev => (prev + 1) % maxDesktopSlides);
        setCurrentMobileSlide(prev => (prev + 1) % maxMobileSlides);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [maxDesktopSlides, maxMobileSlides]);

  if (!items.length) return null;

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Carousel - with autoplay and drag */}
      <div className="hidden md:block">
        <div 
          ref={desktopContainerRef}
          className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
        >
          <motion.div
            className="flex transition-transform duration-500 ease-out"
            style={{
              width: `${maxDesktopSlides * 100}%`,
              transform: `translateX(-${currentDesktopSlide * (100 / maxDesktopSlides)}%)`,
            }}
          >
            {Array.from({ length: maxDesktopSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex space-x-3 px-1">
                {items.slice(slideIndex * cardsPerDesktop, (slideIndex + 1) * cardsPerDesktop).map((item, cardIndex) => (
                  <div key={item.id} className="w-52">
                    <WhatsOnCard
                      item={item}
                      onClick={() => !isDragging && onCardClick?.(item)}
                      priority={slideIndex === 0 && cardIndex === 0}
                    />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Desktop Dots */}
        {showDots && maxDesktopSlides > 1 && (
          <div className="flex justify-center mt-2 space-x-2">
            {Array.from({ length: maxDesktopSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentDesktopSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentDesktopSlide
                    ? 'bg-white w-6'
                    : 'bg-white/30 hover:bg-white/50'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Carousel - Hardware-accelerated with spring physics */}
      <div className="block md:hidden">
        <div 
          ref={mobileContainerRef}
          className="relative overflow-hidden touch-pan-y"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y pinch-zoom',
          }}
        >
          <motion.div
            drag="x"
            dragConstraints={{
              left: -(maxMobileSlides - 1) * (mobileContainerRef.current?.offsetWidth || 0),
              right: 0,
            }}
            dragElastic={0.1}
            dragMomentum={true}
            onDragEnd={handleDragEnd}
            animate={mobileControls}
            style={{ 
              x: mobileX,
              display: 'flex',
              width: `${maxMobileSlides * 100}%`,
              willChange: 'transform',
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            {Array.from({ length: maxMobileSlides }).map((_, slideIndex) => (
              <div 
                key={slideIndex} 
                className="flex gap-2 px-1"
                style={{
                  width: `${100 / maxMobileSlides}%`,
                  flexShrink: 0,
                }}
              >
                {items.slice(slideIndex * cardsPerMobile, (slideIndex + 1) * cardsPerMobile).map((item) => (
                  <div 
                    key={item.id} 
                    className="flex-1"
                    style={{ minWidth: 0 }}
                  >
                    <WhatsOnCard
                      item={item}
                      onClick={() => onCardClick?.(item)}
                      priority={slideIndex === 0}
                    />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Mobile Dots */}
        {showDots && maxMobileSlides > 1 && (
          <div className="flex justify-center mt-3 space-x-2">
            {Array.from({ length: maxMobileSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMobileSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300 touch-manipulation',
                  index === currentMobileSlide
                    ? 'bg-white w-4'
                    : 'bg-white/30 hover:bg-white/50'
                )}
                style={{ minWidth: '44px', minHeight: '44px' }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};