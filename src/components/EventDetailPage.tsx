// src/components/EventDetailPage.tsx
// Modified: Remove tickets_url, location coordinates, accent_color dependencies and add summary fallback

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Share2, 
  Copy, 
  MessageCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchEventBySlug, Event, getEventSummary } from '@/lib/supabase';
import { Hero } from '@/components/ui/Hero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventDetailPageParams {
  slug: string;
}

const EventDetailPage: React.FC = () => {
  const { slug } = useParams<EventDetailPageParams>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  // Load event data
  useEffect(() => {
    if (slug) {
      loadEvent(slug);
    }
  }, [slug]);

  const loadEvent = async (eventSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const eventData = await fetchEventBySlug(eventSlug);
      
      if (!eventData) {
        setError('Event not found');
        document.title = 'Event not found — Supermal Karawaci';
        return;
      }
      
      setEvent(eventData);
      document.title = `${eventData.title} — Supermal Karawaci`;
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event details');
      document.title = 'Error loading event — Supermal Karawaci';
    } finally {
      setLoading(false);
    }
  };

  // Format dates with proper timezone handling
  const formatEventDate = (dateString: string, showTime: boolean = true) => {
    try {
      const date = new Date(dateString);
      const formatString = showTime ? 'EEEE, MMMM d, yyyy • h:mm a' : 'EEEE, MMMM d, yyyy';
      return format(date, formatString);
    } catch {
      return dateString;
    }
  };

  const formatDateRange = useMemo(() => {
    if (!event) return '';
    
    const start = new Date(event.start_at);
    const end = event.end_at ? new Date(event.end_at) : null;
    
    if (!end) {
      return formatEventDate(event.start_at);
    }
    
    const isSameDay = start.toDateString() === end.toDateString();
    
    if (isSameDay) {
      return `${format(start, 'EEEE, MMMM d, yyyy')} • ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    }
    
    return `${formatEventDate(event.start_at)} - ${formatEventDate(event.end_at)}`;
  }, [event]);

  // Get event summary with fallback to body excerpt
  const eventSummary = useMemo(() => {
    return event ? getEventSummary(event) : '';
  }, [event]);

  // Share functionality
  const shareUrl = window.location.href;
  const shareText = event ? `${event.title} - ${eventSummary}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const generateCalendarLink = () => {
    if (!event) return '';
    
    const start = new Date(event.start_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = event.end_at 
      ? new Date(event.end_at).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : start;
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${start}/${end}`,
      details: eventSummary,
      location: event.venue || 'Supermal Karawaci'
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Image navigation
  const nextImage = () => {
    if (event && event.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event && event.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  };

  // Render markdown-like content
  const renderEventBody = (body: string) => {
    // Simple markdown rendering - you might want to use a proper markdown library
    return body.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mb-4 text-text-primary">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mb-3 text-text-primary">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mb-2 text-text-primary">{line.slice(4)}</h3>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-3 text-text-secondary leading-relaxed">{line}</p>;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">
              {error === 'Event not found' ? 'Event Not Found' : 'Error Loading Event'}
            </h1>
            <p className="text-text-secondary mb-8">
              {error === 'Event not found' 
                ? "The event you're looking for doesn't exist or has been removed."
                : 'We encountered an error while loading the event details.'}
            </p>
            <Link to="/events">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section with Event Details */}
      <Hero
        title={event.title}
        subtitle={formatDateRange}
        variant="compact"
        cta={
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(generateCalendarLink(), '_blank')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
            <div className="relative">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShareMenuOpen(!shareMenuOpen)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Event
              </Button>
              
              {/* Share Dropdown */}
              {shareMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 bg-surface-secondary border border-border-primary rounded-lg shadow-lg p-4 min-w-[200px] z-50"
                >
                  <div className="space-y-2">
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 p-2 hover:bg-surface-tertiary rounded text-left transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-2 p-2 hover:bg-surface-tertiary rounded transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        }
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link 
            to="/events"
            className="inline-flex items-center text-accent hover:text-accent-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {event.images && event.images.length > 0 && (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-tertiary">
                  <img
                    src={event.images[currentImageIndex]?.url}
                    alt={event.images[currentImageIndex]?.alt || event.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Image Navigation */}
                  {event.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 hover:bg-surface rounded-full flex items-center justify-center text-text-primary hover:shadow-lg transition-all"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface/80 hover:bg-surface rounded-full flex items-center justify-center text-text-primary hover:shadow-lg transition-all"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {/* Image Caption */}
                  {event.images[currentImageIndex]?.caption && (
                    <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-sm rounded p-3">
                      <p className="text-sm text-text-secondary">
                        {event.images[currentImageIndex].caption}
                      </p>
                    </div>
                  )}
                </div>

                {/* Thumbnail Navigation */}
                {event.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {event.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex 
                            ? 'border-accent' 
                            : 'border-border-secondary hover:border-border-primary'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Event Body Content */}
            {event.body && (
              <div className="prose prose-lg max-w-none">
                {renderEventBody(event.body)}
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="bg-surface-secondary rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Event Details</h3>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Date & Time</p>
                  <p className="text-sm text-text-secondary">{formatDateRange}</p>
                </div>
              </div>

              {event.venue && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary">Venue</p>
                    <p className="text-sm text-text-secondary">{event.venue}</p>
                  </div>
                </div>
              )}

              {event.timezone && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary">Timezone</p>
                    <p className="text-sm text-text-secondary">{event.timezone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => window.open(generateCalendarLink(), '_blank')}
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data (JSON-LD) for SEO - Updated without tickets/coordinates */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": event.title,
            "description": eventSummary || event.title,
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
            "image": event.images.map(img => img.url),
            "url": window.location.href,
            "organizer": {
              "@type": "Organization",
              "name": "Supermal Karawaci",
              "url": "https://supermalkarawaci.com"
            }
          })
        }}
      />

      {/* Click outside to close share menu */}
      {shareMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShareMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default EventDetailPage;