// src/components/EventsPage.tsx
// Modified: Remove dependencies on removed columns and implement summary fallback

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Search, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { 
  fetchEvents, 
  fetchFeaturedEvents, 
  fetchEventTags,
  Event, 
  EventFetchParams,
  getEventSummary
} from '@/lib/supabase';
import { Hero } from '@/components/ui/Hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventList } from '@/components/ui/event-list';

// Updated seeded fallback events without removed columns
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
    images: [
      {
        url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&crop=center',
        alt: 'Japanese lanterns and festival decorations'
      }
    ],
    tags: ['Japanese Culture', 'Festival', 'Family Event'],
    summary: 'Experience authentic Japanese culture with traditional performances, delicious food, and family activities.',
    metadata: {},
    created_by: null,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'ON THE WHEELS (OTW) Tamiya Championship',
    slug: 'on-the-wheels-otw-tamiya-championship-2025',
    body: 'The ultimate mini 4WD racing competition returns to Supermal Karawaci! Watch Indonesia\'s best Tamiya racers compete for glory and amazing prizes.',
    start_at: '2025-09-02T14:00:00+07:00',
    end_at: '2025-09-28T21:00:00+07:00',
    timezone: 'Asia/Jakarta',
    is_published: true,
    is_featured: true,
    venue: 'Supermal Karawaci Level 2 Activity Zone',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop&crop=center',
        alt: 'Tamiya mini 4WD cars on racing track'
      }
    ],
    tags: ['Racing', 'Tamiya', 'Competition', 'Kids'],
    summary: null, // Test summary fallback functionality
    metadata: {},
    created_by: null,
    created_at: '2025-09-01T00:00:00Z',
    updated_at: '2025-09-01T00:00:00Z'
  }
];

const EventsPage: React.FC = () => {
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const PER_PAGE = 12;

  // Load initial data
  useEffect(() => {
    loadEvents(true);
    loadFeaturedEvents();
    loadAvailableTags();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadEvents(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedTags, showUpcomingOnly]);

  const loadEvents = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: EventFetchParams = {
        page: reset ? 1 : currentPage,
        perPage: PER_PAGE,
        search: searchQuery || undefined,
        upcomingOnly: showUpcomingOnly,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        isFeatured: false // Exclude featured events from main list
      };

      const result = await fetchEvents(params);
      
      if (reset) {
        setEvents(result.data);
        setCurrentPage(2);
      } else {
        setEvents(prev => [...prev, ...result.data]);
        setCurrentPage(prev => prev + 1);
      }
      
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading events:', err);

      // Use seeded events as fallback
      if (reset || events.length === 0) {
        setEvents(SEEDED_EVENTS);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadFeaturedEvents = async () => {
    try {
      setFeaturedLoading(true);
      const featured = await fetchFeaturedEvents(4);
      setFeaturedEvents(featured);
    } catch (err) {
      console.error('Error loading featured events:', err);
      // Use seeded featured events as fallback
      setFeaturedEvents(SEEDED_EVENTS.filter(e => e.is_featured));
    } finally {
      setFeaturedLoading(false);
    }
  };

  const loadAvailableTags = async () => {
    try {
      const tags = await fetchEventTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error('Error loading tags:', err);
      // Fallback tags from seeded events
      const fallbackTags = [...new Set(SEEDED_EVENTS.flatMap(e => e.tags))];
      setAvailableTags(fallbackTags);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadEvents(false);
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setShowUpcomingOnly(true);
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || !showUpcomingOnly;

  // Memoized components for performance
  const FeaturedEventsSection = useMemo(() => {
    if (featuredLoading) {
      return (
        <div className="bg-surface-secondary rounded-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-surface-tertiary rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="space-y-3">
                  <div className="aspect-video bg-surface-tertiary rounded"></div>
                  <div className="h-4 bg-surface-tertiary rounded w-3/4"></div>
                  <div className="h-3 bg-surface-tertiary rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (featuredEvents.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-secondary rounded-lg p-6 lg:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Featured Events</h2>
          <Badge variant="secondary" className="bg-accent text-text-inverse">
            {featuredEvents.length} Featured
          </Badge>
        </div>

        <EventList 
          events={featuredEvents} 
          variant="featured"
          className="grid-cols-1 lg:grid-cols-2"
        />
      </motion.div>
    );
  }, [featuredEvents, featuredLoading]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <Hero
        title="Discover Amazing Events"
        subtitle="Join exciting activities, workshops, and celebrations at Supermal Karawaci"
        variant="default"
        cta={
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="#events-list">
                <Calendar className="w-4 h-4 mr-2" />
                Browse Events
              </a>
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Featured Events */}
        {FeaturedEventsSection}

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-surface-secondary rounded-lg p-6"
            >
              <div className="space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Search Events</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder-text-muted"
                    />
                  </div>
                </div>

                {/* Filter Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Event Type</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showUpcomingOnly}
                        onChange={(e) => setShowUpcomingOnly(e.target.checked)}
                        className="w-4 h-4 text-accent border-border-primary rounded focus:ring-accent"
                      />
                      <span className="text-sm text-text-secondary">Upcoming events only</span>
                    </label>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={clearAllFilters}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>

                {/* Tags Filter */}
                {availableTags.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-text-primary">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagSelect(tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-accent text-text-inverse'
                              : 'bg-surface border border-border-primary text-text-secondary hover:bg-surface-tertiary'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events List */}
        <div id="events-list" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">All Events</h2>
              {hasActiveFilters && (
                <p className="text-sm text-text-muted mt-1">
                  {events.length} event{events.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-video bg-surface-secondary rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
                    <div className="h-3 bg-surface-secondary rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <>
              <EventList events={events} variant="default" />
              
              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    size="lg"
                    variant="outline"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading More...
                      </>
                    ) : (
                      'Load More Events'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* No Events Found */
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">No Events Found</h3>
              <p className="text-text-secondary mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to find more events.'
                  : 'Check back soon for exciting upcoming events!'
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearAllFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Structured Data for SEO - Updated without tickets offers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Events at Supermal Karawaci",
            "description": "Discover amazing events, workshops, and activities at Supermal Karawaci",
            "url": window.location.href,
            "numberOfItems": events.length,
            "itemListElement": events.slice(0, 10).map((event, index) => ({
              "@type": "Event",
              "position": index + 1,
              "name": event.title,
              "description": getEventSummary(event) || event.title,
              "startDate": event.start_at,
              "endDate": event.end_at || undefined,
              "location": {
                "@type": "Place",
                "name": event.venue || "Supermal Karawaci",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Jl. Boulevard Diponegoro No. 105",
                  "addressLocality": "Tangerang",
                  "addressRegion": "Banten",
                  "postalCode": "15115",
                  "addressCountry": "ID"
                }
              },
              "image": event.images?.[0]?.url,
              "url": `${window.location.origin}/event/${event.slug}`,
              "organizer": {
                "@type": "Organization",
                "name": "Supermal Karawaci",
                "url": "https://supermalkarawaci.com"
              }
            }))
          })
        }}
      />
    </div>
  );
};

export default EventsPage;