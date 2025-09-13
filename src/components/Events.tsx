// src/components/Events.tsx
// Complete rewrite: Clean integration with new responsive carousel

import React from 'react';
import { CardCarousel } from '@/components/ui/card-carousel';
import { useFeaturedEvents } from '@/lib/hooks/useFeaturedEvents';
import { Event } from '@/lib/supabase';

// Helper functions for data formatting
const formatDateRange = (startAt: string, endAt: string | null): string => {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  };
  
  if (!end) {
    return start.toLocaleDateString('en-GB', options);
  }
  
  const isSameDay = start.toDateString() === end.toDateString();
  
  if (isSameDay) {
    return start.toLocaleDateString('en-GB', options);
  }
  
  const startStr = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const endStr = end.toLocaleDateString('en-GB', options);
  
  return `${startStr} – ${endStr}`;
};

const formatTimeRange = (startAt: string, endAt: string | null): string => {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : null;
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Jakarta'
  };
  
  if (!end) {
    return start.toLocaleTimeString('en-GB', timeOptions);
  }
  
  const startTime = start.toLocaleTimeString('en-GB', timeOptions);
  const endTime = end.toLocaleTimeString('en-GB', timeOptions);
  
  if (startTime === endTime) {
    return startTime;
  }
  
  return `${startTime} – ${endTime}`;
};

const extractSummaryFromBody = (body: string | null): string => {
  if (!body) return '';
  
  const cleaned = body
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  
  if (cleaned.length <= 150) return cleaned;
  
  const truncated = cleaned.substring(0, 150);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 100 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

// Transform DB Event to Carousel format
const mapEventForCarousel = (e: Event) => {
  const img = (e.images && e.images.length && e.images[0].url) 
    ? e.images[0].url 
    : '/img/placeholder-event.jpg';
  
  const date = formatDateRange(e.start_at, e.end_at);
  const time = formatTimeRange(e.start_at, e.end_at);
  const description = e.summary || extractSummaryFromBody(e.body);
  const category = Array.isArray(e.tags) && e.tags.length ? e.tags[0] : 'Event';
  
  return {
    id: typeof e.id === 'string' ? parseInt(e.id.substring(0, 8), 16) || Math.floor(Math.random() * 10000) : e.id,
    title: e.title,
    image: img,
    date,
    time,
    location: e.venue || '',
    description,
    category,
    slug: e.slug
  };
};

const Events = () => {
  const { items, isLoading, error, refetch } = useFeaturedEvents({ limit: 8 });

  // Defensive: items may be undefined during loading
  const events = (items || []).map(mapEventForCarousel);

  return (
    <section className="py-12 md:py-20 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            <span className="text-text-primary">Current</span>{' '}
            <span className="text-accent">Events</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            Don't miss out on our exciting events and exclusive promotions
          </p>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-surface-secondary border border-border-primary rounded-2xl overflow-hidden animate-pulse h-[480px]">
                  <div className="h-48 bg-surface-tertiary"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-surface-tertiary rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-surface-tertiary rounded w-1/2"></div>
                      <div className="h-4 bg-surface-tertiary rounded w-2/3"></div>
                      <div className="h-4 bg-surface-tertiary rounded w-1/2"></div>
                    </div>
                    <div className="h-16 bg-surface-tertiary rounded w-full"></div>
                    <div className="h-10 bg-surface-tertiary rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div 
            className="text-center py-12" 
            aria-live="assertive"
            role="alert"
          >
            <div className="max-w-md mx-auto">
              <p className="text-text-secondary mb-4">
                Unable to load events at the moment. Please try again.
              </p>
              <button
                onClick={refetch}
                className="inline-flex items-center px-6 py-3 bg-accent text-text-inverse rounded-lg font-semibold hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                aria-label="Retry loading events"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-text-secondary max-w-md mx-auto">
              No featured events available at the moment. Check back soon for exciting upcoming events!
            </p>
          </div>
        )}

        {/* Events Carousel */}
        {!isLoading && !error && events.length > 0 && (
          <CardCarousel
            events={events}
            autoplayDelay={5000}
            showPagination={true}
            showNavigation={true}
          />
        )}
      </div>
    </section>
  );
};

export default Events;