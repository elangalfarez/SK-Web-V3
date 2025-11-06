// src/components/ui/hero-background-lazy.tsx
// Fixed: Resolved TypeScript errors - removed unused alt prop and incompatible ease typing

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeroBackgroundLazyProps {
  src: string;
  priority?: boolean;
  className?: string;
}

export const HeroBackgroundLazy: React.FC<HeroBackgroundLazyProps> = ({
  src,
  priority = false,
  className,
}) => {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const preloadImage = useCallback(async () => {
    if (!src) {
      setImageStatus('error');
      return;
    }

    try {
      const img = new Image();
      
      if (priority) {
        img.fetchPriority = 'high';
      }
      
      // Promise-based image loading
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load hero background'));
        img.src = src;
      });

      setImageSrc(src);
      setImageStatus('loaded');
      
    } catch (error) {
      console.error('Hero background image failed to load:', error);
      setImageStatus('error');
    }
  }, [src, priority]);

  useEffect(() => {
    preloadImage();
  }, [preloadImage]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animationVariants = {
    hidden: { 
      opacity: prefersReducedMotion ? 1 : 0,
    },
    visible: { 
      opacity: 1,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.8,
      }
    },
  };

  return (
    <div 
      className={cn('absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Gradient placeholder while loading */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-subtle via-surface-tertiary to-accent-subtle" />
      
      {/* Blur placeholder animation */}
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-surface-tertiary to-accent/10 animate-pulse" />
      )}

      {/* Main background image */}
      {imageStatus === 'loaded' && imageSrc && (
        <motion.div
          variants={animationVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent" />
      
      {/* Error fallback */}
      {imageStatus === 'error' && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent-subtle to-surface-tertiary" />
      )}
    </div>
  );
};