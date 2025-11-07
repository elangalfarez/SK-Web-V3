// src/components/ui/whats-on-carousel.tsx
// Fixed: Mobile translation to account for gap between card pairs

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
  const [containerWidth, setContainerWidth] = useState(0);

  // Refs
  const isHoveredRef = useRef(isHovered);
  const isDraggingRef = useRef(isDragging);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const desktopContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Mobile animation controls
  const mobileX = useMotionValue(0);
  const mobileControls = useAnimation();

  // Gap size in pixels (1rem = 16px typically)
  const gapSize = 16;

  // Update refs when state changes
  useEffect(() => {
    isHoveredRef.current = isHovered;
    isDraggingRef.current = isDragging;
  }, [isHovered, isDragging]);

  // Measure container width precisely
  useEffect(() => {
    const updateWidth = () => {
      if (mobileContainerRef.current) {
        const rect = mobileContainerRef.current.getBoundingClientRect();
        setContainerWidth(Math.round(rect.width));
      }
    };

    const timer = setTimeout(updateWidth, 100);
    updateWidth();

    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Desktop: Auto-advance slides
  const advanceDesktopSlide = useCallback(() => {
    if (isHoveredRef.current && pauseOnHover) return;
    if (isDraggingRef.current) return;
    
    setCurrentDesktopSlide((prev) => (prev + 1) % maxDesktopSlides);
  }, [maxDesktopSlides, pauseOnHover]);

  // Mobile: Auto-advance slides
  const advanceMobileSlide = useCallback(() => {
    if (isHoveredRef.current && pauseOnHover) return;
    if (isDraggingRef.current) return;
    
    setCurrentMobileSlide((prev) => {
      const nextSlide = (prev + 1) % maxMobileSlides;
      const targetX = -nextSlide * (containerWidth + gapSize);
      
      if (!prefersReducedMotion) {
        mobileControls.start({
          x: targetX,
          transition: { duration: 0.5, ease: 'easeInOut' }
        });
      }
      
      return nextSlide;
    });
  }, [maxMobileSlides, containerWidth, pauseOnHover, mobileControls, prefersReducedMotion]);

  // Setup autoplay interval
  useEffect(() => {
    if (!autoplay) return;

    intervalRef.current = setInterval(() => {
      advanceDesktopSlide();
      advanceMobileSlide();
    }, autoplayDelay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplay, autoplayDelay, advanceDesktopSlide, advanceMobileSlide]);

  // Handle mobile drag
  const handleMobileDragEnd = (_event: unknown, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    setIsDragging(false);

    if (Math.abs(offset) < threshold && Math.abs(velocity) < 500) {
      // Snap back
      mobileControls.start({
        x: -currentMobileSlide * (containerWidth + gapSize),
        transition: { duration: 0.3, ease: 'easeOut' }
      });
      return;
    }

    // Determine direction
    let newSlide = currentMobileSlide;
    if (offset > threshold || velocity > 500) {
      newSlide = Math.max(0, currentMobileSlide - 1);
    } else if (offset < -threshold || velocity < -500) {
      newSlide = Math.min(maxMobileSlides - 1, currentMobileSlide + 1);
    }

    const targetX = -newSlide * (containerWidth + gapSize);
    mobileControls.start({
      x: targetX,
      transition: { duration: 0.3, ease: 'easeOut' }
    });

    setCurrentMobileSlide(newSlide);
  };

  // Handle dot click - Desktop
  const handleDesktopDotClick = (index: number) => {
    setCurrentDesktopSlide(index);
  };

  // Handle dot click - Mobile
  const handleMobileDotClick = (index: number) => {
    const targetX = -index * (containerWidth + gapSize);
    if (!prefersReducedMotion) {
      mobileControls.start({
        x: targetX,
        transition: { duration: 0.5, ease: 'easeInOut' }
      });
    }
    setCurrentMobileSlide(index);
  };

  return (
    <div 
      className={cn('relative w-full', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Desktop Carousel (hidden on mobile) */}
      <div className="hidden md:block">
        <div 
          ref={desktopContainerRef}
          className="relative overflow-hidden"
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentDesktopSlide * 100}%)`
            }}
          >
            {Array.from({ length: maxDesktopSlides }).map((_, slideIndex) => (
              <div 
                key={slideIndex}
                className="flex-shrink-0 w-full flex justify-start gap-6"
              >
                {items
                  .slice(
                    slideIndex * cardsPerDesktop,
                    (slideIndex + 1) * cardsPerDesktop
                  )
                  .map((item, cardIndex) => (
                    <WhatsOnCard
                      key={item.id}
                      item={item}
                      onClick={() => onCardClick?.(item)}
                      priority={slideIndex === 0 && cardIndex === 0}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Carousel (hidden on desktop) */}
      <div className="md:hidden">
        <div 
          ref={mobileContainerRef}
          className="relative overflow-hidden"
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: -(maxMobileSlides - 1) * (containerWidth + gapSize), right: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleMobileDragEnd}
            animate={mobileControls}
            style={{ x: prefersReducedMotion ? -currentMobileSlide * (containerWidth + gapSize) : mobileX }}
            className="flex gap-4"
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0"
                style={{ width: `calc((100% - 1rem) / ${cardsPerMobile})` }}
              >
                <WhatsOnCard
                  item={item}
                  onClick={() => !isDragging && onCardClick?.(item)}
                  priority={index === 0}
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Dots Navigation */}
      {showDots && (
        <>
          {/* Desktop Dots */}
          <div className="hidden md:flex justify-center gap-2 mt-6">
            {Array.from({ length: maxDesktopSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleDesktopDotClick(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentDesktopSlide
                    ? 'bg-accent w-8'
                    : 'bg-gray-400 hover:bg-gray-300'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Mobile Dots */}
          <div className="flex md:hidden justify-center gap-2 mt-6">
            {Array.from({ length: maxMobileSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleMobileDotClick(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentMobileSlide
                    ? 'bg-accent w-8'
                    : 'bg-gray-400 hover:bg-gray-300'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};