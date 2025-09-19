// src/components/ui/logo-preloader.tsx
// Created: Preloads both theme logos for instant switching without loading delays

import { useEffect } from 'react';

interface LogoPreloaderProps {
  lightLogo: string;
  darkLogo: string;
}

export const LogoPreloader: React.FC<LogoPreloaderProps> = ({ 
  lightLogo, 
  darkLogo 
}) => {
  useEffect(() => {
    // Preload both logo images
    const preloadImage = (src: string) => {
      const img = new Image();
      img.src = src;
      return img;
    };

    // Preload both themes
    const lightImg = preloadImage(lightLogo);
    const darkImg = preloadImage(darkLogo);

    // Optional: Log when images are loaded for debugging
    lightImg.onload = () => console.debug('Light theme logo preloaded');
    darkImg.onload = () => console.debug('Dark theme logo preloaded');
    
    lightImg.onerror = () => console.warn('Failed to preload light theme logo');
    darkImg.onerror = () => console.warn('Failed to preload dark theme logo');

    // Cleanup function
    return () => {
      lightImg.onload = null;
      lightImg.onerror = null;
      darkImg.onload = null;
      darkImg.onerror = null;
    };
  }, [lightLogo, darkLogo]);

  // This component doesn't render anything visible
  return null;
};

export default LogoPreloader;