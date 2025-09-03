// src/components/EventDetailPage.tsx
// Created: Individual event detail page with full content, sharing, and structured data

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Share2, 
  Copy, 
  MessageCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchEventBySlug, Event } from '@/lib/supabase';
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

  // Share functionality
  const shareUrl = window.location.href;
  const shareText = event ? `Check out "${event.title}" at Supermal Karawaci!` : '';

  const handleShare = async (platform: string) => {
    if (!event) return;

    const urls = {
      copy: () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      },
      twitter: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      },
      whatsapp: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
      },
      facebook: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      }
    };

    urls[platform as keyof typeof urls]?.();
    setShareMenuOpen(false);
  };

  // Image gallery navigation
  const nextImage = () => {
    if (event && event.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === event.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (event && event.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? event.images.length - 1 : prev - 1
      );
    }
  };

  // Render markdown-like content safely
  const renderEventBody = (body: string) => {
    return body
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mb-6 text-text-primary">{paragraph.slice(2)}</h1>;
        }
        if (paragraph.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold mb-4 text-text-primary mt-8">{paragraph.slice(3)}</h2>;
        }
        if (paragraph.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold mb-3 text-text-primary mt-6">{paragraph.slice(4)}</h3>;
        }
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          return <li key={index} className="mb-2 text-text-secondary">{paragraph.slice(2)}</li>;
        }
        if (paragraph.trim()) {
          return <p key={index} className="mb-4 text-text-secondary leading-relaxed">{paragraph}</p>;
        }
        return null;
      })
      .filter(Boolean);
  };

  // Calendar export link
  const generateCalendarLink = () => {
    if (!event) return '#';
    
    const startDate = new Date(event.start_at);
    const endDate = event.end_at ? new Date(event.end_at) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
    
    const formatCalendarDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const calendarParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`,
      details: event.summary || event.title,
      location: event.venue || 'Supermal Karawaci',
      sf: 'true',
      output: 'xml'
    });
    
    return `https://calendar.google.com/calendar/render?${calendarParams.toString()}`;
  };

  // Check for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse space-y-4 max-w-md w-full px-4">
          <div className="h-8 bg-surface-secondary rounded"></div>
          <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
          <div className="h-32 bg-surface-secondary rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-4">
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
            {event.tickets_url && (
              <Button asChild size="lg">
                <a href={event.tickets_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Get Tickets
                </a>
              </Button>
            )}
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
                  className="absolute top-full right-0 mt-2 w-48 bg-surface-secondary border border-border-primary rounded-lg shadow-lg z-50"
                >
                  <div className="py-2">
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full text-left px-4 py-2 hover:bg-surface-tertiary transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="w-full text-left px-4 py-2 hover:bg-surface-tertiary transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full text-left px-4 py-2 hover:bg-surface-tertiary transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full text-left px-4 py-2 hover:bg-surface-tertiary transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Facebook
                    </button>
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
                <div 
                  className="relative aspect-video rounded-lg overflow-hidden bg-surface-tertiary"
                  style={{ ['--event-accent' as any]: event.accent_color }}
                >
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

                  {/* Image Counter */}
                  {event.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-surface/90 text-text-primary px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {event.images.length}
                    </div>
                  )}
                </div>

                {/* Image Caption */}
                {event.images[currentImageIndex]?.caption && (
                  <p className="text-sm text-text-muted italic">
                    {event.images[currentImageIndex].caption}
                  </p>
                )}

                {/* Image Thumbnails */}
                {event.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {event.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
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
                    {event.location_lat && event.location_lng && (
                      <a
                        href={`https://maps.google.com/?q=${event.location_lat},${event.location_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-hover text-sm inline-flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View on Map
                      </a>
                    )}
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
              {event.tickets_url && (
                <Button asChild className="w-full" size="lg">
                  <a href={event.tickets_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Get Tickets
                  </a>
                </Button>
              )}
              
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

      {/* Structured Data (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
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
                "streetAddress": "Jl. Boulevard Diponegoro No. 105",
                "addressLocality": "Tangerang",
                "addressRegion": "Banten",
                "postalCode": "15115",
                "addressCountry": "ID"
              },
              ...(event.location_lat && event.location_lng && {
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": event.location_lat,
                  "longitude": event.location_lng
                }
              })
            },
            "image": event.images.map(img => img.url),
            "url": window.location.href,
            "organizer": {
              "@type": "Organization",
              "name": "Supermal Karawaci",
              "url": "https://supermalkarawaci.com"
            },
            ...(event.tickets_url && {
              "offers": {
                "@type": "Offer",
                "url": event.tickets_url,
                "availability": "https://schema.org/InStock"
              }
            })
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