// src/components/ui/whats-on-card.tsx
// Fixed: Exact styling from original Hero.tsx - compact, no borders, proper contrast

import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveImage } from './ResponsiveImage';
import { WhatsOnItem } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface WhatsOnCardProps {
  item: WhatsOnItem;
  onClick?: () => void;
  className?: string;
  priority?: boolean;
}

export const WhatsOnCard: React.FC<WhatsOnCardProps> = ({
  item,
  onClick,
  className,
  priority = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden',
        'cursor-pointer hover:bg-black/50 transition-all duration-300',
        'transform hover:scale-105 group',
        'w-52 h-full flex flex-col', // Added h-full and flex flex-col for consistent heights
        className
      )}
    >
      {/* Image - aspect ratio 4:3 like original */}
      <div className="aspect-[4/3] relative flex-shrink-0">
        <ResponsiveImage
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover"
          aspectRatio="4/3"
          objectFit="cover"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'low'}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
        
        {/* Badge */}
        {item.badge_text && (
          <div className="absolute top-2 left-2 bg-accent text-white px-2 py-1 rounded-full text-xs font-bold">
            {item.badge_text}
          </div>
        )}
      </div>
      
      {/* Content - compact like original with consistent height */}
      <div className="p-5 flex flex-col flex-1">
        <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2 flex-1">
          {item.title}
        </h4>
        <p className="text-gray-300 text-xs opacity-75 flex-shrink-0">
          {item.date_text}
        </p>
      </div>
    </div>
  );
};