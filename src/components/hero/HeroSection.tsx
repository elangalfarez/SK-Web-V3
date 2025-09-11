// src/components/hero/HeroSection.tsx
// Modified: Added left gradient overlay, viewport-fit calculation, max-w-8xl container

import React from 'react';
import { HeroModels } from '../ui/hero-models';
import { HeroContent } from './HeroContent';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  className?: string;
  onDiscover?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  className,
  onDiscover,
}) => {
  const handleDiscover = () => {
    if (onDiscover) {
      onDiscover();
    } else {
      // Default behavior: scroll down to next section
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      className={cn('relative overflow-hidden', className)}
      style={{ minHeight: 'calc(100vh - var(--navbar-height, 72px))' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/Front-Facade.jpg"
          alt="Supermal Karawaci Main Lobby"
          className="w-full h-full object-cover"
          loading="eager"
          fetchpriority="high"
        />
      </div>

      {/* Left-concentrated dark overlay for text contrast */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 h-full w-3/5 md:w-2/5 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Hero Models Overlay - Right Side */}
      <HeroModels />

      {/* Hero Content Overlay - Left Side (includes What's On) */}
      <div className="relative z-20 h-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroContent 
          onDiscover={handleDiscover}
        />
      </div>
    </section>
  );
};