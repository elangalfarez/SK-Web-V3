// src/components/ui/ResponsiveImage.tsx
// Modified: Proper className forwarding for rounded corners, robust image loading with mobile fallbacks

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  objectFit?: 'cover' | 'contain';
  aspectRatio?: '4/3' | '16/9' | '3/2';
  fallbackLetter?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  objectFit = 'cover',
  aspectRatio = '4/3',
  fallbackLetter,
  loading = 'lazy',
  fetchPriority = 'auto',
  onLoad,
  onError
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showFallback, setShowFallback] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Normalize and sanitize image URL
  const normalizeSrc = useCallback((url: string): string => {
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    try {
      // Basic URL encoding for safety
      return encodeURI(decodeURI(url));
    } catch {
      return url;
    }
  }, []);

  // Generate fallback letter avatar
  const generateFallbackLetter = useCallback(() => {
    if (fallbackLetter) return fallbackLetter.charAt(0).toUpperCase();
    return alt?.charAt(0)?.toUpperCase() || 'S';
  }, [fallbackLetter, alt]);

  // HEAD probe to check if image is accessible
  const probeImage = useCallback(async (url: string): Promise<boolean> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: abortControllerRef.current.signal,
        cache: 'no-cache',
        mode: 'cors'
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        return contentType ? contentType.startsWith('image/') : true;
      }
      return false;
    } catch (error) {
      // CORS or network error - let img element try loading anyway
      console.debug('HEAD probe failed for:', url, error);
      return true; // Allow img element to try loading anyway
    }
  }, []);

  // Try different URL variants for HEIC and format issues
  const tryImageVariants = useCallback(async (originalUrl: string): Promise<string | null> => {
    const variants: string[] = [originalUrl];
    
    // If HEIC, try .jpg variant
    if (originalUrl.toLowerCase().includes('.heic')) {
      variants.push(originalUrl.toLowerCase().replace(/\.heic$/, '.jpg'));
      variants.push(originalUrl + '?format=jpg'); // Some CDNs support this
    }
    
    // Try adding format parameter for CDNs that support it
    if (!originalUrl.includes('format=')) {
      variants.push(originalUrl + (originalUrl.includes('?') ? '&' : '?') + 'format=jpg');
    }
    
    for (const variant of variants) {
      const isAccessible = await probeImage(variant);
      if (isAccessible) {
        console.debug('Using image variant:', variant);
        return variant;
      }
    }
    
    return null;
  }, [probeImage]);

  // Load image with fallback logic
  const loadImage = useCallback(async () => {
    if (!src) {
      setShowFallback(true);
      setImageStatus('error');
      return;
    }

    setImageStatus('loading');
    setShowFallback(false);

    try {
      const normalizedSrc = normalizeSrc(src);
      const workingSrc = await tryImageVariants(normalizedSrc);
      
      if (!workingSrc) {
        console.debug('All image variants failed for:', src);
        setShowFallback(true);
        setImageStatus('error');
        onError?.();
        return;
      }

      setCurrentSrc(workingSrc);
    } catch (error) {
      console.debug('Image loading error:', error);
      setShowFallback(true);
      setImageStatus('error');
      onError?.();
    }
  }, [src, normalizeSrc, tryImageVariants, onError]);

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    setImageStatus('loaded');
    setShowFallback(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image load error - fallback to letter avatar
  const handleImageError = useCallback(() => {
    console.debug('Image failed to load:', currentSrc);
    setImageStatus('error');
    setShowFallback(true);
    onError?.();
  }, [currentSrc, onError]);

  // Initialize image loading when src changes
  useEffect(() => {
    loadImage();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadImage]);

  // Get aspect ratio classes
  const aspectRatioClass = {
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video', 
    '3/2': 'aspect-[3/2]'
  }[aspectRatio];

  const objectFitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClass, className)}>
      {/* Blur-up skeleton while loading */}
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-surface-tertiary animate-pulse" />
      )}
      
      {/* Main image */}
      {currentSrc && !showFallback && (
        <img
          ref={imageRef}
          src={currentSrc}
          alt={alt}
          loading={loading}
          fetchpriority={fetchPriority}
          decoding="async"
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={cn(
            'w-full h-full transition-all duration-300',
            objectFitClass,
            imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
          )}
          role="img"
          aria-label={alt || 'Image'}
        />
      )}
      
      {/* Fallback letter avatar */}
      {(showFallback || !currentSrc) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-tertiary to-surface-secondary">
          <div className="text-4xl md:text-5xl font-bold text-text-muted/40 select-none">
            {generateFallbackLetter()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveImage;