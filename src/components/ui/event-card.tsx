// src/components/ui/event-card.tsx
// Fixed: Removed invalid Badge variant, unused Clock import, and unused showAccentColor prop

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { Event, getEventSummary } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured' | 'compact';
  onClick?: () => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'default',
  onClick,
  className = ''
}) => {
  // Format date with proper error handling
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatDateRange = () => {
    try {
      const start = new Date(event.start_at);
      const end = event.end_at ? new Date(event.end_at) : null;
      
      if (!end) {
        return formatEventDate(event.start_at);
      }
      
      const isSameDay = start.toDateString() === end.toDateString();
      
      if (isSameDay) {
        return `${format(start, 'MMM d, yyyy')} • ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
      }
      
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } catch {
      return formatEventDate(event.start_at);
    }
  };

  // Determine event status
  const getEventStatus = () => {
    const now = new Date();
    const start = new Date(event.start_at);
    const end = event.end_at ? new Date(event.end_at) : null;

    if (isBefore(now, start)) {
      return 'upcoming';
    } else if (end && isAfter(now, end)) {
      return 'ended';
    } else {
      return 'ongoing';
    }
  };

  const eventStatus = getEventStatus();
  const primaryImage = event.images && event.images.length > 0 ? event.images[0] : null;
  
  // Get event summary with fallback to body excerpt
  const eventSummary = getEventSummary(event);
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Variant-specific styling
  const variantClasses = {
    default: 'h-full',
    featured: 'h-full bg-gradient-to-br from-accent/5 to-accent/10',
    compact: 'h-auto'
  };

  const imageClasses = {
    default: 'aspect-video',
    featured: 'aspect-[4/3]',
    compact: 'aspect-[3/2]'
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const cardContent = (
    <motion.div
      initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!prefersReducedMotion ? { y: -4 } : {}}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      className={`
        bg-surface-secondary rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 
        ${variantClasses[variant]} ${className}
      `}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className={`relative ${imageClasses[variant]} bg-surface-tertiary overflow-hidden`}>
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || event.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Placeholder when no image */
          <div className="w-full h-full bg-gradient-to-br from-accent/10 to-accent/20 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-accent/60" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {event.is_featured && (
            <Badge 
              variant="secondary" 
              className="bg-accent text-text-inverse shadow-lg"
            >
              Featured
            </Badge>
          )}
        </div>

        {/* Event Status Badge */}
        <div className="absolute top-3 right-3">
          {eventStatus === 'ongoing' && (
            <Badge variant="default" className="bg-success text-text-inverse shadow-lg">
              Live Now
            </Badge>
          )}
          {eventStatus === 'ended' && (
            <Badge variant="outline" className="bg-surface/80 shadow-lg">
              Ended
            </Badge>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-text-primary line-clamp-2 hover:text-accent transition-colors">
          {variant === 'compact' ? (
            <span className="text-lg">{event.title}</span>
          ) : (
            <span className="text-xl">{event.title}</span>
          )}
        </h3>

        {/* Summary with fallback */}
        {eventSummary && (
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
            {eventSummary}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 text-sm text-text-muted">
          {/* Date/Time */}
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
            <span className="line-clamp-2">{formatDateRange()}</span>
          </div>

          {/* Venue */}
          {event.venue && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && variant !== 'compact' && (
          <div className="flex flex-wrap gap-2">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-text-muted">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons - Remove tickets button, keep view details */}
        {variant === 'featured' && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1" asChild>
              <Link to={`/event/${event.slug}`}>
                View Details
              </Link>
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Wrap in Link if not using onClick handler
  if (onClick) {
    return cardContent;
  }

  return (
    <Link 
      to={`/event/${event.slug}`}
      className="block focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg"
      aria-label={`View details for ${event.title}`}
    >
      {cardContent}
    </Link>
  );
};

export default EventCard;