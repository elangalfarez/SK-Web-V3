// src/components/ui/card-carousel.tsx
// Created: World-class infinite carousel with smooth autoplay and accessibility

import React, { useEffect, useRef, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules"
import type { Swiper as SwiperType } from 'swiper'

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

export interface CarouselEvent {
  id: number | string
  title: string
  image: string
  date: string
  time: string
  location: string
  description?: string
  category?: string
  slug?: string
}

interface CarouselProps {
  events: CarouselEvent[]
  autoplayDelay?: number
  showPagination?: boolean
}

export const CardCarousel: React.FC<CarouselProps> = ({
  events,
  autoplayDelay = 3000,
  showPagination = true,
}) => {
  const swiperRef = useRef<SwiperType | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set())
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)

  // Respect user's motion preferences
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  // Force start autoplay after initialization
  useEffect(() => {
    if (swiperRef.current?.autoplay && !prefersReducedMotion) {
      setTimeout(() => {
        swiperRef.current?.autoplay?.start()
      }, 100)
    }
  }, [prefersReducedMotion])

  // Handle empty states
  if (!events || events.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-center">
          <p className="text-text-secondary text-lg">
            No events available at the moment.
          </p>
          <p className="text-text-muted text-sm mt-2">
            Check back soon for exciting upcoming events!
          </p>
        </div>
      </div>
    )
  }

  // Single event - large display
  if (events.length === 1) {
    const event = events[0]
    return (
      <div className="max-w-4xl mx-auto px-4">
        <EventCard 
          event={event} 
          isLarge 
          onImageLoad={() => {}}
          onImageError={() => {}}
          hasLoaded={true}
          hasError={false}
        />
      </div>
    )
  }

  // Create seamless infinite slides by duplicating array
  const slides = [...events, ...events]

  const handleMouseEnter = () => {
    if (swiperRef.current?.autoplay && !prefersReducedMotion) {
      swiperRef.current.autoplay.stop()
      setIsAutoplayPaused(true)
    }
  }

  const handleMouseLeave = () => {
    if (swiperRef.current?.autoplay && !prefersReducedMotion && !isAutoplayPaused) {
      swiperRef.current.autoplay.start()
    }
    setIsAutoplayPaused(false)
  }

  const handleImageLoad = (imageUrl: string) => {
    setImagesLoaded(prev => new Set([...prev, imageUrl]))
  }

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set([...prev, imageUrl]))
  }

  return (
    <div className="relative w-full">
      <style>{carouselStyles}</style>
      
      <div 
        className="events-carousel-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        <Swiper
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView="auto"
          spaceBetween={50}
          speed={700}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          autoplay={prefersReducedMotion ? false : {
            delay: autoplayDelay,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={showPagination ? {
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active',
            bulletClass: 'swiper-pagination-bullet',
          } : false}
          navigation={false}
          className="events-swiper"
          role="region"
          aria-label="Current events carousel"
        >
          {slides.map((event, index) => (
            <SwiperSlide key={`${event.id}-${index}`} className="events-slide">
              <EventCard 
                event={event}
                onImageLoad={handleImageLoad}
                onImageError={handleImageError}
                hasLoaded={imagesLoaded.has(event.image)}
                hasError={imageErrors.has(event.image)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

interface EventCardProps {
  event: CarouselEvent
  isLarge?: boolean
  onImageLoad: (url: string) => void
  onImageError: (url: string) => void
  hasLoaded: boolean
  hasError: boolean
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isLarge = false, 
  onImageLoad, 
  onImageError, 
  hasLoaded, 
  hasError 
}) => {
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (imageRef && !hasLoaded && !hasError) {
      const img = new Image()
      img.onload = () => onImageLoad(event.image)
      img.onerror = () => onImageError(event.image)
      img.src = event.image
    }
  }, [imageRef, event.image, hasLoaded, hasError, onImageLoad, onImageError])

  const cardClasses = isLarge 
    ? "event-card event-card-large" 
    : "event-card"

  return (
    <article className={cardClasses}>
      <div className="event-card-image-container">
        {/* Loading skeleton */}
        {!hasLoaded && !hasError && (
          <div className="event-card-skeleton" />
        )}
        
        {/* Image */}
        <img
          ref={setImageRef}
          src={hasError ? "/img/placeholder-event.jpg" : event.image}
          alt={event.title}
          className={`event-card-image ${hasLoaded ? 'loaded' : ''}`}
          loading="lazy"
          onLoad={() => onImageLoad(event.image)}
          onError={() => onImageError(event.image)}
        />
        
        {/* Category badge */}
        <div className="event-card-badge">
          {event.category || "Event"}
        </div>
      </div>

      <div className="event-card-content">
        <h3 className="event-card-title">
          {event.title}
        </h3>

        <div className="event-card-details">
          <div className="event-card-detail">
            <span>{event.date}</span>
          </div>
          <div className="event-card-detail">
            <span>{event.time}</span>
          </div>
          {event.location && (
            <div className="event-card-detail">
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="event-card-description">
            {event.description}
          </p>
        )}

        <div className="event-card-footer">
          <a
            href={event.slug ? `/event/${event.slug}` : "#"}
            className="event-card-cta"
            aria-label={`Learn more about ${event.title}`}
          >
            Learn More
          </a>
        </div>
      </div>
    </article>
  )
}

const carouselStyles = `
  .events-carousel-container {
    width: 100%;
    padding-bottom: 60px;
  }
  
  .events-swiper {
    width: 100%;
    padding-left: 8vw;
    padding-right: 8vw;
    box-sizing: border-box;
  }
  
  .events-slide {
    width: 380px !important;
    height: auto;
    display: flex;
    flex-direction: column;
    transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  
  .swiper-slide-active .event-card {
    transform: scale(1.08);
    z-index: 30;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.25);
  }
  
  .swiper-slide-next .event-card,
  .swiper-slide-prev .event-card {
    transform: scale(0.95);
    z-index: 10;
    opacity: 1;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  }
  
  .event-card {
    background: var(--color-surface-secondary);
    border-radius: 24px;
    overflow: hidden;
    height: 500px;
    display: flex;
    flex-direction: column;
    transition: all 700ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
  
  .event-card-large {
    height: auto;
    max-width: none;
    transform: none !important;
  }
  
  .event-card-image-container {
    position: relative;
    height: 240px;
    overflow: hidden;
  }
  
  .event-card-large .event-card-image-container {
    height: 320px;
  }
  
  .event-card-skeleton {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, var(--color-surface-tertiary) 0%, var(--color-border-primary) 50%, var(--color-surface-tertiary) 100%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite ease-in-out;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .event-card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 700ms ease, opacity 300ms ease;
    opacity: 0;
  }
  
  .event-card-image.loaded {
    opacity: 1;
  }
  
  .event-card:hover .event-card-image {
    transform: scale(1.05);
  }
  
.event-card-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: linear-gradient(135deg, var(--color-purple-accent-dark) 0%, var(--color-purple-accent) 100%);
  color: #FFFFFF;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px var(--color-purple-glow), 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 300ms ease;
}
  
  .event-card-content {
    padding: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .event-card-large .event-card-content {
    padding: 32px;
  }
  
  .event-card-title {
    color: var(--color-text-primary);
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .event-card-large .event-card-title {
    font-size: 28px;
    -webkit-line-clamp: none;
  }
  
  .event-card-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .event-card-detail {
    color: var(--color-text-secondary);
    font-size: 14px;
    font-weight: 500;
  }
  
  .event-card-description {
    color: var(--color-text-secondary);
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .event-card-large .event-card-description {
    -webkit-line-clamp: none;
    font-size: 16px;
  }
  
  .event-card-footer {
    margin-top: auto;
  }
  
  .event-card-cta {
    display: block;
    width: 100%;
    background: var(--color-accent);
    color: var(--color-text-inverse);
    text-align: center;
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    transition: all 300ms cubic-bezier(0.22, 1, 0.36, 1);
    position: relative;
    overflow: hidden;
  }
  
  .event-card-cta::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color-accent);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: inherit;
    z-index: -1;
  }
  
  .event-card-cta:hover::before {
    opacity: 0.3;
  }
  
  .event-card-cta:hover {
    background: var(--color-accent-hover);
    transform: translateY(-2px);
  }
  
  .event-card-cta:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  
  /* Pagination styling */
  .swiper-pagination {
    bottom: 0 !important;
    display: flex;
    justify-content: center;
    gap: 8px;
  }
  
  .swiper-pagination-bullet {
    width: 12px !important;
    height: 12px !important;
    background: var(--color-text-muted) !important;
    opacity: 0.4 !important;
    border-radius: 50% !important;
    transition: all 300ms ease !important;
    margin: 0 !important;
  }
  
  .swiper-pagination-bullet-active {
    background: var(--color-accent) !important;
    opacity: 1 !important;
    transform: scale(1.2) !important;
    box-shadow: 0 4px 8px rgba(255, 215, 0, 0.3) !important;
  }
  
  [data-theme="light"] .swiper-pagination-bullet-active {
    box-shadow: 0 4px 8px rgba(90, 46, 138, 0.3) !important;
  }
  
  .swiper-pagination-bullet:hover {
    opacity: 0.7 !important;
    transform: scale(1.1) !important;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .events-swiper {
      padding-left: 5vw;
      padding-right: 5vw;
    }
    
    .events-slide {
      width: 300px !important;
    }
    
    .event-card {
      height: 420px;
    }
    
    .event-card-image-container {
      height: 180px;
    }
    
    .event-card-content {
      padding: 20px;
      gap: 12px;
    }
    
    .event-card-title {
      font-size: 18px;
    }
    
    .swiper-slide-active .event-card {
      transform: scale(1.05);
    }
    
    .swiper-slide-next .event-card,
    .swiper-slide-prev .event-card {
      transform: scale(0.92);
      opacity: 1;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .event-card,
    .events-slide,
    .event-card-image,
    .event-card-cta {
      transition: none !important;
      animation: none !important;
    }
    
    .swiper-slide-active .event-card,
    .swiper-slide-next .event-card,
    .swiper-slide-prev .event-card {
      transform: none !important;
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .event-card {
      border: 2px solid var(--color-border-primary);
    }
    
    .event-card-cta {
      border: 2px solid var(--color-accent);
    }
  }
`

export default CardCarousel