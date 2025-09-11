// src/components/ui/whats-on-carousel.tsx
// Modified: 3 cards desktop/2 mobile, removed arrows, fixed infinite autoplay with refs

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
  autoplayDelay = 4000,
  pauseOnHover = true,
  showNavigation = false,
  showDots = true,
  className,
}) => {
  // Calculate slides based on screen size
  const cardsPerDesktop = 3;
  const cardsPerMobile = 2;
  const maxDesktopSlides = Math.ceil(items.length / cardsPerDesktop);
  const maxMobileSlides = Math.ceil(items.length / cardsPerMobile);

  const [currentDesktopSlide, setCurrentDesktopSlide] = useState(0);
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Use refs to avoid stale closures in autoplay timer
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const desktopSliderRef = useRef<HTMLDivElement>(null);
  const mobileSliderRef = useRef<HTMLDivElement>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Update refs when state changes
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Clear autoplay timer
  const clearAutoplayTimer = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  // Start autoplay timer with proper infinite looping using refs
  const startAutoplayTimer = useCallback(() => {
    if (!autoplay || items.length <= 1) return;

    clearAutoplayTimer();
    autoplayTimerRef.current = setInterval(() => {
      // Read current values from refs to avoid stale closures
      if (!isHoveredRef.current && !isDraggingRef.current) {
        setCurrentDesktopSlide(prev => (prev + 1) % maxDesktopSlides);
        setCurrentMobileSlide(prev => (prev + 1) % maxMobileSlides);
      }
    }, autoplayDelay);
  }, [autoplay, autoplayDelay, items.length, maxDesktopSlides, maxMobileSlides, clearAutoplayTimer]);

  // Setup autoplay
  useEffect(() => {
    startAutoplayTimer();
    return clearAutoplayTimer;
  }, [startAutoplayTimer, clearAutoplayTimer]);

  // Handle hover events
  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    if (pauseOnHover) {
      clearAutoplayTimer();
    }
  }, [pauseOnHover, clearAutoplayTimer]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    if (pauseOnHover) {
      startAutoplayTimer();
    }
  }, [pauseOnHover, startAutoplayTimer]);

  // Desktop navigation handlers
  const handleDesktopPrev = useCallback(() => {
    setCurrentDesktopSlide(prev => prev === 0 ? maxDesktopSlides - 1 : prev - 1);
  }, [maxDesktopSlides]);

  const handleDesktopNext = useCallback(() => {
    setCurrentDesktopSlide(prev => (prev + 1) % maxDesktopSlides);
  }, [maxDesktopSlides]);

  // Mobile navigation handlers
  const handleMobilePrev = useCallback(() => {
    setCurrentMobileSlide(prev => prev === 0 ? maxMobileSlides - 1 : prev - 1);
  }, [maxMobileSlides]);

  const handleMobileNext = useCallback(() => {
    setCurrentMobileSlide(prev => (prev + 1) % maxMobileSlides);
  }, [maxMobileSlides]);

  // Desktop drag handlers
  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setDragOffset(0);
    if (desktopSliderRef.current) {
      desktopSliderRef.current.style.transition = 'none';
    }
  };

  const handleDesktopMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !desktopContainerRef.current) return;
    
    const deltaX = e.clientX - startX;
    setDragOffset(deltaX);
    
    if (desktopSliderRef.current) {
      const translateX = -currentDesktopSlide * (100 / maxDesktopSlides) + (deltaX / desktopContainerRef.current.offsetWidth) * (100 / maxDesktopSlides);
      desktopSliderRef.current.style.transform = `translateX(${translateX}%)`;
    }
  };

  const handleDesktopMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (desktopSliderRef.current) {
      desktopSliderRef.current.style.transition = 'transform 0.5s ease-out';
    }
    
    const threshold = 50;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handleDesktopPrev();
      } else {
        handleDesktopNext();
      }
    }
    
    setDragOffset(0);
  };

  // Mobile touch handlers
  const handleMobileTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setDragOffset(0);
    if (mobileSliderRef.current) {
      mobileSliderRef.current.style.transition = 'none';
    }
  };

  const handleMobileTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !mobileContainerRef.current) return;
    
    const deltaX = e.touches[0].clientX - startX;
    setDragOffset(deltaX);
    
    if (mobileSliderRef.current) {
      const translateX = -currentMobileSlide * (100 / maxMobileSlides) + (deltaX / mobileContainerRef.current.offsetWidth) * (100 / maxMobileSlides);
      mobileSliderRef.current.style.transform = `translateX(${translateX}%)`;
    }
  };

  const handleMobileTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (mobileSliderRef.current) {
      mobileSliderRef.current.style.transition = 'transform 0.5s ease-out';
    }
    
    const threshold = 30;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handleMobilePrev();
      } else {
        handleMobileNext();
      }
    }
    
    setDragOffset(0);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleDesktopPrev();
      handleMobilePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleDesktopNext();
      handleMobileNext();
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn('relative w-full', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="What's On carousel"
    >
      {/* Desktop Carousel - 3 cards per slide */}
      <div className="hidden md:block">
        <div 
          ref={desktopContainerRef}
          className="relative overflow-hidden"
          onMouseDown={handleDesktopMouseDown}
          onMouseMove={handleDesktopMouseMove}
          onMouseUp={handleDesktopMouseUp}
          onMouseLeave={handleDesktopMouseUp}
        >
          <motion.div
            ref={desktopSliderRef}
            className="flex transition-transform duration-500 ease-out"
            style={{
              width: `${maxDesktopSlides * 100}%`,
              transform: `translateX(-${currentDesktopSlide * (100 / maxDesktopSlides)}%)`,
            }}
          >
            {Array.from({ length: maxDesktopSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex gap-6">
                {items.slice(slideIndex * cardsPerDesktop, (slideIndex + 1) * cardsPerDesktop).map((item, cardIndex) => (
                  <div key={item.id} className="flex-1 min-w-0 h-full">
                    <WhatsOnCard
                      item={item}
                      onClick={() => onCardClick?.(item)}
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
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: maxDesktopSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentDesktopSlide(index)}
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-accent/20',
                  index === currentDesktopSlide
                    ? 'bg-white scale-110'
                    : 'bg-white/60 hover:bg-white/80'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Carousel - 2 cards per slide */}
      <div className="block md:hidden">
        <div 
          ref={mobileContainerRef}
          className="relative overflow-hidden"
          onTouchStart={handleMobileTouchStart}
          onTouchMove={handleMobileTouchMove}
          onTouchEnd={handleMobileTouchEnd}
        >
          <motion.div
            ref={mobileSliderRef}
            className="flex transition-transform duration-500 ease-out"
            style={{
              width: `${maxMobileSlides * 100}%`,
              transform: `translateX(-${currentMobileSlide * (100 / maxMobileSlides)}%)`,
            }}
          >
            {Array.from({ length: maxMobileSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex gap-4">
                {items.slice(slideIndex * cardsPerMobile, (slideIndex + 1) * cardsPerMobile).map((item) => (
                  <div key={item.id} className="flex-1 min-w-0 h-full">
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
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: maxMobileSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMobileSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-accent/20',
                  index === currentMobileSlide
                    ? 'bg-white scale-110'
                    : 'bg-white/60 hover:bg-white/80'
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