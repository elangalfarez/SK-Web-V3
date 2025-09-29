// src/components/hero/HeroSection.tsx
// Fixed: Exact viewport height (no extra scrolling) and consistent badge text colors

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
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section 
      className={cn('relative h-screen flex items-center overflow-hidden', className)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://plctjbxxkuettzgueqck.supabase.co/storage/v1/object/public/SK%20Assets/Web%20Assets/Best%20Facade%20Final.jpg"
          alt="Supermal Karawaci Interior"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        {/* Enhanced gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full">
        <HeroContent onDiscover={handleDiscover} />
      </div>

      {/* RIGHT PART - Desktop: Models */}
      <HeroModels />
      
      {/* Scroll Indicator - Centered */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <button
          onClick={handleDiscover}
          className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center hover:border-white/80 transition-colors focus:outline-none"
          aria-label="Scroll down"
        >
          <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-bounce"></div>
        </button>
      </div>
    </section>
  );
};