// src/components/ui/ImageWithFallback.tsx
// Created: Resilient image component with intelligent fallbacks and CORS handling

/*
Common image loading issues: HEIC format, CORS restrictions, missing CDN transforms
Recommended backend fixes: serve JPG/WEBP, configure Supabase storage transforms
This component provides client-side resilience only
*/

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain';
  objectPosition?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  imageResponsive?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackIcon?: React.ReactNode;
}

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  objectFit = 'cover',
  objectPosition = 'center',
  aspectRatio = 'aspect-video',
  width,
  height,
  imageResponsive = false,
  fetchPriority = 'low',
  loading = 'lazy',
  onLoad,
  onError,
  fallbackIcon
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryAttempted, setRetryAttempted] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setRetryAttempted(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
    if (isDevelopment) {
      console.debug(`Image loaded successfully: ${currentSrc}`);
    }
  };

  const handleError = async () => {
    if (isDevelopment) {
      console.debug(`Image failed to load: ${currentSrc}`);
    }

    // Single intelligent retry attempt
    if (!retryAttempted && currentSrc === src) {
      setRetryAttempted(true);
      
      // Try format conversion: HEIC -> JPG, or add .jpg/.webp
      let retrySrc = currentSrc;
      
      if (currentSrc.toLowerCase().includes('.heic')) {
        retrySrc = currentSrc.replace(/\.heic$/i, '.jpg');
        if (isDevelopment) {
          console.debug(`Attempting HEIC fallback: ${retrySrc}`);
        }
      } else if (!currentSrc.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i)) {
        // Add .jpg extension if no clear image extension
        retrySrc = currentSrc + '.jpg';
        if (isDevelopment) {
          console.debug(`Attempting extension fallback: ${retrySrc}`);
        }
      }

      // Try CORS-enabled HEAD request to check if image exists
      try {
        const response = await fetch(retrySrc, { 
          method: 'HEAD',
          mode: 'cors'
        });
        
        if (isDevelopment) {
          console.debug(`HEAD request response:`, {
            status: response.status,
            contentType: response.headers.get('Content-Type')
          });
        }

        if (response.ok) {
          setCurrentSrc(retrySrc);
          return; // Don't set error yet, let the img element try the new src
        }
      } catch (corsError) {
        if (isDevelopment) {
          console.debug(`CORS check failed: ${corsError}`);
        }
      }

      // If retry src is different, try it anyway
      if (retrySrc !== currentSrc) {
        setCurrentSrc(retrySrc);
        return;
      }
    }

    // Final fallback
    setIsLoading(false);
    setHasError(true);
    onError?.();
    
    if (isDevelopment) {
      console.debug(`All image loading attempts failed for: ${src}`);
    }
  };

  // Generate responsive srcSet if enabled and URL supports width params
  const generateSrcSet = (baseSrc: string) => {
    if (!imageResponsive) return undefined;
    
    // Basic heuristic: if URL contains width/w param, generate variants
    if (baseSrc.includes('w=') || baseSrc.includes('width=')) {
      const sizes = [480, 768, 1024, 1280, 1920];
      const srcSet = sizes.map(size => {
        const url = baseSrc.replace(/([?&])(w|width)=\d+/i, `$1$2=${size}`);
        return `${url} ${size}w`;
      }).join(', ');
      
      if (isDevelopment) {
        console.debug(`Generated srcSet: ${srcSet}`);
      }
      
      return srcSet;
    }
    
    return undefined;
  };

  const sizes = imageResponsive ? 
    '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : 
    undefined;

  // Fallback placeholder
  if (hasError) {
    const initials = alt.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
    
    return (
      <div className={cn(
        'flex items-center justify-center bg-surface-secondary text-muted-foreground',
        aspectRatio,
        className
      )}>
        {fallbackIcon || (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-sm font-medium">
              {initials || '?'}
            </div>
            <span className="text-xs opacity-70">Image unavailable</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', aspectRatio, className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-surface-secondary animate-pulse" />
      )}

      <picture>
        {imageResponsive && (
          <>
            <source
              srcSet={generateSrcSet(currentSrc)?.replace(/\.(jpg|jpeg|png)(\?.*)?$/g, '.webp$2')}
              type="image/webp"
              sizes={sizes}
            />
            <source
              srcSet={generateSrcSet(currentSrc)}
              sizes={sizes}
            />
          </>
        )}
        
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            objectPosition
          }}
        />
      </picture>
    </div>
  );
}