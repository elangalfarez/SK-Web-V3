// src/components/ui/whats-on-carousel.tsx
// Fixed: Much better UX - disabled mobile autoplay, improved touch handling, simplified interactions

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  autoplayDelay = 8000, // Much slower - 8 seconds
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

  // Touch handling - simplified
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Container refs
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Update refs when state changes
  useEffect(() => {
    isHoveredRef.current = isHovered;
    isDraggingRef.current = isDragging;
  }, [isHovered, isDragging]);

  // Autoplay functionality - DESKTOP ONLY
  const startAutoplay = useCallback(() => {
    if (!autoplay || items.length <= cardsPerDesktop) return;

    intervalRef.current = setInterval(() => {
      if (!isHoveredRef.current && !isDraggingRef.current) {
        setCurrentDesktopSlide(prev => (prev + 1) % maxDesktopSlides);
        // NO mobile autoplay to prevent confusion
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

  // Simplified mobile touch handlers - no conflicts with scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return;

    const touch = e.changedTouches[0];
    const deltaX = touchStartX - touch.clientX;
    const deltaY = touchStartY - touch.clientY;

    // Only handle horizontal swipes, ignore vertical scrolling
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 60) {
      e.preventDefault(); // Only prevent when we're handling the swipe
      
      if (deltaX > 0) {
        // Swipe left - next slide
        setCurrentMobileSlide(prev => prev < maxMobileSlides - 1 ? prev + 1 : prev);
      } else {
        // Swipe right - prev slide
        setCurrentMobileSlide(prev => prev > 0 ? prev - 1 : prev);
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Desktop drag handlers - simplified
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

      {/* Mobile Carousel - NO autoplay, better touch handling */}
      <div className="block md:hidden">
        <div 
          ref={mobileContainerRef}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div
            className="flex transition-transform duration-300 ease-out"
            style={{
              width: `${maxMobileSlides * 100}%`,
              transform: `translateX(-${currentMobileSlide * (100 / maxMobileSlides)}%)`,
            }}
          >
            {Array.from({ length: maxMobileSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex space-x-2 px-1">
                {items.slice(slideIndex * cardsPerMobile, (slideIndex + 1) * cardsPerMobile).map((item) => (
                  <div key={item.id} className="flex-1 min-w-0">
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
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentMobileSlide
                    ? 'bg-white w-4'
                    : 'bg-white/30 hover:bg-white/50'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};