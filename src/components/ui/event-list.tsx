// src/components/ui/event-list.tsx
// Fixed: Removed deprecated showAccentColors prop that no longer exists in EventCard

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Event } from '@/lib/supabase';
import { EventCard } from './event-card';

interface EventListProps {
  events: Event[];
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
  onEventClick?: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = memo(({
  events,
  variant = 'default',
  className = '',
  onEventClick
}) => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: prefersReducedMotion ? 1 : 0, 
      y: prefersReducedMotion ? 0 : 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.5 
      }
    }
  };

  // Grid classes based on variant
  const gridClasses = {
    default: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    featured: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
    compact: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${gridClasses[variant]} ${className}`}
    >
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          variants={itemVariants}
          custom={index}
        >
          <EventCard
            event={event}
            variant={variant}
            onClick={onEventClick ? () => onEventClick(event) : undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});

EventList.displayName = 'EventList';

export default EventList;