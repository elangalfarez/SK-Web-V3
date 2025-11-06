// src/components/ui/whats-on-card.tsx
// Fixed: Removed unused motion import to resolve TS6133 warning

import React from 'react';
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
        'w-52 h-full flex flex-col',
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
        
        {/* Badge - Purple brand color with elegant glow */}
        {item.badge_text && (
          <div 
          className="absolute top-2 left-2 px-3 py-1.5 rounded-full text-xs font-bold text-white purple-glow"
          style={{
            background: 'var(--color-accent)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
          >
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