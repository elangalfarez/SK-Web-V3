// src/components/hero/HeroContent.tsx
// Fixed: Removed showNavigation prop to match updated WhatsOnCarousel interface

import React, { useState } from 'react';
import { WhatsOnModal } from '../ui/whats-on-modal';
import { WhatsOnCarousel } from '../ui/whats-on-carousel';
import { useWhatsOn } from '@/lib/hooks/useWhatsOn';
import { WhatsOnItem } from '@/lib/supabase';

export interface HeroContentProps {
  title?: React.ReactNode;
  subtitle?: string;
  onDiscover?: () => void;
  className?: string;
}

export const HeroContent: React.FC<HeroContentProps> = ({
  title = (
    <>
      Welcome to<br />
      <span className="text-white">Supermal Karawaci</span>
    </>
  ),
  subtitle = "Your Shopping, Culinary, & Entertainment Destination",
}) => {
  const { items, isLoading } = useWhatsOn({ limit: 6 });
  const [selectedItem, setSelectedItem] = useState<WhatsOnItem | null>(null);

  const handleCardClick = (item: WhatsOnItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <>
      {/* DESKTOP LAYOUT - matches original Hero.tsx */}
      <div className="hidden md:block h-full">
        {/* Title and Subtitle - Higher Position */}
        <div className="absolute top-1/3 left-4 sm:left-6 lg:left-8 xl:left-12 transform -translate-y-1/2 max-w-2xl z-20">
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            <h1 className="commissioner-hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              {title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white leading-relaxed opacity-90">
              {subtitle}
            </p>
          </div>
        </div>

        {/* What's On Section - Bottom Left */}
        <div className="absolute bottom-8 left-4 sm:left-6 lg:left-8 xl:left-12 max-w-4xl z-20">
          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">What's On</h3>
            
            {!isLoading && items.length > 0 && (
              <WhatsOnCarousel
                items={items}
                onCardClick={handleCardClick}
                autoplay={true}
                autoplayDelay={4000}
                pauseOnHover={true}
                showDots={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT - matches original Hero.tsx */}
      <div className="block md:hidden h-full">
        <div className="absolute top-24 left-4 right-4 z-20">
          <div className="space-y-4 sm:space-y-6">
            {/* Title and Subtitle */}
            <div className="space-y-3">
              <h1 className="commissioner-hero-title text-2xl sm:text-3xl font-bold text-white leading-tight">
                Welcome to <br/> 
                <span className="text-white">Supermal Karawaci</span>
              </h1>
              <p className="text-sm sm:text-base text-white leading-relaxed opacity-90">
                {subtitle}
              </p>
            </div>

            {/* What's On Section */}
            <div className="space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-white">What's On</h3>
              
              {!isLoading && items.length > 0 && (
                <WhatsOnCarousel
                  items={items}
                  onCardClick={handleCardClick}
                  autoplay={true}
                  autoplayDelay={4000}
                  pauseOnHover={true}
                  showDots={true}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Models - Now handled by HeroModels component directly */}
        {/* Removed duplicate mobile models positioning */}
      </div>

      {/* What's On Detail Modal */}
      <WhatsOnModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={handleCloseModal}
      />
    </>
  );
};