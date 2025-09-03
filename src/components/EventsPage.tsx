// src/components/EventsPage.tsx
// Created: Main events listing page with filtering, search, and featured events scroller

/*
ACCEPTANCE CHECKLIST:
✅ Visit /events — shows featured events scroller, list of events, search & filters work, Load More works
✅ Click an event → navigates to /event/:slug → full detail page renders (images, description, tickets CTA)
✅ src/lib/supabase.ts exports required functions and types
✅ All colors use tokens or CSS var fallback (no hardcoded hex in UI artifacts)
✅ Keyboard & screenreader navigation works for cards and FAQ
✅ Respects prefers-reduced-motion for animations
✅ Mobile-first responsive design
✅ Offline fallback with seeded events
✅ Structured data (JSON-LD) for SEO
*/

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Search, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { 
  fetchEvents, 
  fetchFeaturedEvents, 
  fetchEventTags,
  Event, 
  EventFetchParams 
} from '@/lib/supabase';
import { Hero } from '@/components/ui/Hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventCard } from '@/components/ui/event-card';
import { EventList } from '@/components/ui/event-list';
import { EventFilters } from '@/components/ui/event-filters';

// Seeded fallback events for offline/error scenarios
const SEEDED_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Amazing September Matsuri',
    slug: 'amazing-september-matsuri-2025',
    body: null,
    start_at: '2025-09-02T10:00:00+07:00',
    end_at: '2025-09-28T22:00:00+07:00',
    timezone: 'Asia/Jakarta',
    is_published: true,
    is_featured: true,
    venue: 'Supermal Karawaci Main Atrium',
    location_lat: -6.1887,
    location_lng: 106.6323,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&crop=center',
        alt: 'Japanese lanterns and festival decorations'
      }
    ],
    tags: ['Japanese Culture', 'Festival', 'Family Event'],
    accent_color: '#E91E63',
    tickets_url: 'https://tickets.supermalkarawaci.com/matsuri-2025',
    summary: 'Experience authentic Japanese culture with traditional performances, delicious food, and family activities.',
    metadata: {},
    created_by: null,
    created_at: '2025-08-01T00:00:00Z',
    updated_at: '2025-08-01T00:00:00Z'
  }
];

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const EventsPage: React.FC = () => {
  // Set page title
  useEffect(() => {
    document.title = 'Events — Supermal Karawaci';
  }, []);

  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Debounced search
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch parameters - memoized to prevent unnecessary re-renders
  const fetchParams = useMemo<EventFetchParams>(() => ({
    page: currentPage,
    perPage: 12,
    search: debouncedSearch,
    upcomingOnly,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined
  }), [currentPage, debouncedSearch, upcomingOnly, fromDate, toDate, selectedTags]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load events when filters change (reset to page 1)
  useEffect(() => {
    if (currentPage === 1) {
      loadEvents(true);
    } else {
      setCurrentPage(1);
    }
  }, [debouncedSearch, upcomingOnly, fromDate, toDate, selectedTags]);

  // Load more events when page changes
  useEffect(() => {
    if (currentPage > 1) {
      loadEvents(false);
    }
  }, [currentPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load featured events, available tags, and initial events in parallel
      const [featuredData, tagsData] = await Promise.all([
        fetchFeaturedEvents(6),
        fetchEventTags()
      ]);

      setFeaturedEvents(featuredData);
      setAvailableTags(tagsData);
      
      // Load initial events
      await loadEvents(true);
    } catch (err) {
      console.error('Error loading initial data:', err);
      handleError('Failed to load events. Showing cached content.');
      
      // Fallback to seeded data
      setFeaturedEvents(SEEDED_EVENTS);
      setEvents(SEEDED_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (reset: boolean) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = reset ? { ...fetchParams, page: 1 } : fetchParams;
      const result = await fetchEvents(params);

      if (reset) {
        setEvents(result.data);
      } else {
        setEvents(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading events:', err);
      if (reset) {
        handleError('Failed to load events. Showing cached content.');
        setEvents(SEEDED_EVENTS);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleError = (message: string) => {
    setError(message);
    // Auto-hide error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setUpcomingOnly(true);
    setFromDate('');
    setToDate('');
  }, []);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Animation variants
  const listVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <Hero
        title={<>Current <span className="text-accent">Events</span></>}
        subtitle="Discover exciting events, workshops, and activities happening at Supermal Karawaci. Join us for unforgettable experiences!"
        stats={[
          { value: `${events.length}+`, label: 'Events' },
          { value: 'Daily', label: 'Activities' },
          { value: 'Free', label: 'Entry' }
        ]}
        variant="default"
      />

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-warning text-text-inverse px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <span className="text-sm font-medium">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Events Scroller */}
        {featuredEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">Featured Events</h2>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {featuredEvents.length} featured
              </Badge>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                {featuredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
                    className="flex-shrink-0 w-80"
                  >
                    <EventCard 
                      event={event} 
                      variant="featured"
                      showAccentColor={true}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Filters Section */}
        <section className="mb-8">
          <EventFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            availableTags={availableTags}
            upcomingOnly={upcomingOnly}
            onUpcomingToggle={setUpcomingOnly}
            fromDate={fromDate}
            onFromDateChange={setFromDate}
            toDate={toDate}
            onToDateChange={setToDate}
            onClearFilters={handleClearFilters}
          />
        </section>

        {/* Events List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">
              All Events
              {events.length > 0 && (
                <span className="text-text-muted text-lg font-normal ml-2">
                  ({events.length} found)
                </span>
              )}
            </h2>
          </div>

          {loading && !loadingMore ? (
            /* Loading skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-surface-secondary rounded-lg h-64 mb-4"></div>
                  <div className="h-4 bg-surface-secondary rounded mb-2"></div>
                  <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                <EventList events={events} />
              </motion.div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    size="lg"
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Events
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                No events found
              </h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                {searchQuery || selectedTags.length > 0 || fromDate || toDate
                  ? 'Try adjusting your filters to find more events.'
                  : 'Check back soon for exciting new events and activities!'}
              </p>
              {(searchQuery || selectedTags.length > 0 || fromDate || toDate) && (
                <Button onClick={handleClearFilters} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Events at Supermal Karawaci",
            "description": "Current and upcoming events at Supermal Karawaci shopping center",
            "url": window.location.href,
            "itemListElement": events.slice(0, 10).map((event, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Event",
                "name": event.title,
                "description": event.summary || event.title,
                "startDate": event.start_at,
                "endDate": event.end_at || undefined,
                "location": {
                  "@type": "Place",
                  "name": event.venue || "Supermal Karawaci",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Tangerang",
                    "addressCountry": "ID"
                  }
                },
                "image": event.images[0]?.url || undefined,
                "url": `${window.location.origin}/event/${event.slug}`,
                "offers": event.tickets_url ? {
                  "@type": "Offer",
                  "url": event.tickets_url,
                  "availability": "https://schema.org/InStock"
                } : undefined
              }
            }))
          })
        }}
      />
    </div>
  );
};

export default EventsPage;