// src/components/hero/HeroContent.tsx
// Fixed: Comprehensive responsive layout using flexbox to prevent text overlap at all viewport sizes

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
      {/* LARGE DESKTOP LAYOUT (1280px+) - Title at top, What's On at bottom */}
      <div className="hidden xl:block h-full">
        {/* Title and Subtitle - Fixed at top area */}
        <div className="absolute top-[8%] 2xl:top-[10%] left-8 2xl:left-12 max-w-2xl z-20">
          <div className="space-y-3 2xl:space-y-4">
            <h1 className="commissioner-hero-title text-5xl 2xl:text-6xl 3xl:text-7xl font-bold text-white leading-tight">
              {title}
            </h1>
            <p className="text-lg 2xl:text-xl text-white leading-relaxed opacity-90">
              {subtitle}
            </p>
          </div>
        </div>

        {/* What's On Section - Fixed at bottom */}
        <div className="absolute bottom-16 2xl:bottom-20 left-8 2xl:left-12 max-w-4xl z-20">
          <div className="space-y-3">
            <h3 className="text-2xl 2xl:text-3xl font-semibold text-white">What's On</h3>

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

      {/* MEDIUM DESKTOP & LAPTOP LAYOUT (1024px - 1279px) - Title top, What's On bottom */}
      <div className="hidden lg:block xl:hidden h-full">
        {/* Title Section - Pinned to top */}
        <div className="absolute top-[6%] left-6 max-w-xl z-20">
          <div className="space-y-2">
            <h1 className="commissioner-hero-title text-4xl font-bold text-white leading-tight">
              {title}
            </h1>
            <p className="text-base text-white leading-relaxed opacity-90">
              {subtitle}
            </p>
          </div>
        </div>

        {/* What's On Section - Pinned to bottom */}
        <div className="absolute bottom-12 left-6 max-w-3xl z-20">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">What's On</h3>

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

      {/* TABLET LAYOUT (768px - 1023px) - Title top, What's On bottom */}
      <div className="hidden md:block lg:hidden h-full">
        {/* Title Section - Pinned to top */}
        <div className="absolute top-[5%] left-4 max-w-md z-20">
          <div className="space-y-2">
            <h1 className="commissioner-hero-title text-3xl font-bold text-white leading-tight">
              {title}
            </h1>
            <p className="text-sm text-white leading-relaxed opacity-90">
              {subtitle}
            </p>
          </div>
        </div>

        {/* What's On Section - Pinned to bottom */}
        <div className="absolute bottom-10 left-4 right-4 z-20">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">What's On</h3>

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

      {/* MOBILE LAYOUT (< 768px) - Natural flow, no gaps */}
      <div className="flex md:hidden flex-col h-full px-4 pt-4 pb-[240px] sm:pb-[280px] z-20">
        {/* Title Section */}
        <div className="space-y-1 mb-4">
          <h1 className="commissioner-hero-title text-2xl sm:text-3xl font-bold text-white leading-tight">
            Welcome to <br/>
            <span className="text-white">Supermal Karawaci</span>
          </h1>
          <p className="text-sm sm:text-base text-white leading-relaxed opacity-90">
            {subtitle}
          </p>
        </div>

        {/* What's On Section - Immediately after title */}
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-semibold text-white">What's On</h3>

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

      {/* What's On Detail Modal */}
      <WhatsOnModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={handleCloseModal}
      />
    </>
  );
};